import { ReportClient, mergeDuplicateViewData } from "../report/reportClient";
import { logReport, SamplingManager } from "@/config";
import { createSessionId } from "@/utils/sessionCalculate";
import { getCurrentTime } from "@/utils/getCurTime";
import { CollectStore } from "@/store";
import type {
  ProjectInfoType,
  SessionInfosType,
  SessionParams,
  CollectStoreType,
  ActionIdType,
} from "@/types/init";
import { windowOrs } from "@/store/windowOrs";
import DataHandle from "../dataHandle";
interface immediatelySendType {
  status: boolean;
  data: CollectStoreType;
}

// 最后一条的数据
let lastDataTime = 0;

export default class Base {
  public name?: string;
  public version: string;
  public appId?: string;
  public osName?: string;
  public accessNo?: string;
  public _events: [];
  public webGroupId: string | number;
  public options: SessionParams;
  public reportClient: ReportClient;
  constructor(options: SessionParams) {
    this.options = options;
    this.name = options.name;
    this.version = options.version;
    this.appId = options.appId;
    this.osName = options.osName;
    this.accessNo = options.accessNo;
    this._events = [];
    this.webGroupId = options.projectId;

    this.reportClient = ReportClient.getInstance({
      sessionParams: options,
      webGroupId: options.projectId,
      server: options.server,
      entity: options.entity,
    });
  }

  // 定时上报更新数据
  updateDataQueue(
    dataHandle: DataHandle,
    immediatelySend: immediatelySendType,
  ) {
    try {
      const reportData = CollectStore.get();
      const deliverData = () => {
        const mergeDuplicateData = mergeDuplicateViewData(reportData);
        CollectStore.clear();
        this.reportClient.sendData(
          dataHandle.composeData(mergeDuplicateData),
          dataHandle.getProjectInfo(),
        );
      };
      // 上报规则：
      // 错误立即上报
      // 大于或等于50条立即上报
      // 闲时1s上报
      if (immediatelySend?.status) {
        // 错误立即上报
        this.reportClient.sendData(
          dataHandle.composeData([immediatelySend.data]),
          dataHandle.getProjectInfo(),
        );
      } else {
        if (reportData?.length >= 50) {
          // 大于或等于50条立即上报所有的
          deliverData();
        } else {
          window.intervalUpdate = setTimeout(() => {
            try {
              // 闲时1s上报
              if (reportData?.length > 0) {
                deliverData();
              }
            } catch (error) {
              logReport("闲时上报", error);
            }
          }, 1000);
        }
      }
    } catch (error) {
      logReport("updateDataQueue", error);
    }
  }

  async reportData(data: CollectStoreType[], projectInfo?: ProjectInfoType) {
    try {
      if (Array.isArray(data) && data.length) {
        const dataHandle = this.reportClient.getDataHandle(projectInfo);
        data.forEach((item: CollectStoreType) => {
          const isShouldReport = this.reportClient.shouldReportEvent(
            this.options,
            item,
            projectInfo,
          );
          if (!isShouldReport) return;

          const singleData: CollectStoreType | null =
            this.reportClient.beforeSend(this.options, item);
          if (!singleData?.rumType) return;
          const immediatelySend = {
            status: false,
            data: {} as CollectStoreType,
          };
          if (singleData.rumType === "ors_error") {
            immediatelySend.status = true;
            immediatelySend.data = singleData;
          } else if (singleData.rumType) {
            immediatelySend.status = false;
            CollectStore.add(singleData);
            window.intervalUpdate && clearTimeout(window.intervalUpdate);
          }
          this.updateDataQueue(dataHandle, immediatelySend);
        });
      }
    } catch (error) {
      logReport("reportData", error);
    }
  }

  // sessionInfo的信息
  getSessionInfo() {
    const curTime = getCurrentTime();

    // 会话时间超过4小时或者时间超过15分钟未操作时，重新生成sessionId,精确到微秒的计算时间
    if (
      curTime - windowOrs.orsDataInfo.sessionInfo.sessionStartTime >
        4 * 60 * 60 * 1000 * 1000 ||
      (lastDataTime != 0 && curTime - lastDataTime > 15 * 60 * 1000 * 1000)
    ) {
      if (windowOrs.samplingConfig.session) {
        SamplingManager.init({
          // 先默认上采样率，后面再根据config接口返回的配置进行覆盖
          ...{
            view: true,
            viewRate: 100,
            action: true,
            actionRate: 100,
            console: true,
            consoleRate: 100,
            resourceRate: 100,
          },
          ...windowOrs.samplingConfig,
        });
      }
      // 重新生成session时间
      createSessionId();
    }

    const sessionInfos: SessionInfosType = {
      sessionStartTime: windowOrs.orsDataInfo.sessionInfo.sessionStartTime,
      sessionId: windowOrs.orsDataInfo.sessionInfo.sessionId,
    };
    lastDataTime = curTime;
    return sessionInfos;
  }

  // action的公共信息
  actionInfo() {
    const actionInfo: ActionIdType = {
      actionId: windowOrs.orsDataInfo.actionId,
    };
    return actionInfo;
  }

  // 更新页面最后的时间
  updateViewEndTime(pageInfo?: { viewEndTime: number; spentDuration: number }) {
    try {
      const innerPageInfo = pageInfo || windowOrs.orsViewPage;
      innerPageInfo.viewEndTime = getCurrentTime() * 1000;
      const timeSpentOnPage =
        innerPageInfo.viewEndTime - innerPageInfo.viewStartTime;

      innerPageInfo.spentDuration =
        timeSpentOnPage > 0 ? Math.floor(timeSpentOnPage / 1000) : 0;
    } catch (error) {
      logReport("updateViewEndTime", error);
    }
  }
}
