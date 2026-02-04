import {
  ProjectInfoType,
  SessionParams,
  CollectStoreType,
  isJsErrorWithProject,
} from "@/types/init";
import { XHR } from "./byXHR";
import ByNavigator from "./byNavigator";
import { windowOrs } from "@/store/windowOrs";
import { logReport, getEntity, SamplingManager } from "@/config";
import { EventFilter } from "@/utils/event";
import { CollectStore } from "@/store";
import DataHandle from "../dataHandle";
import pkg from "../../package.json";
import { deviceInfo } from "@/utils/deviceInfo";

interface ReportClientParams {
  sessionParams: SessionParams;
  webGroupId: string | number;
  server: string | undefined;
  entity: string | undefined;
}
export class ReportClient {
  private static instance: ReportClient;
  private webGroupId: string | number;
  private sessionParams: SessionParams;
  private reportGzipUrl: string;
  private reportUrl: string;
  constructor({
    sessionParams,
    webGroupId,
    server,
    entity,
  }: ReportClientParams) {
    this.sessionParams = sessionParams;
    this.webGroupId = webGroupId;
    const serverOrigin = server || getEntity(entity);
    this.reportUrl = `${serverOrigin}${process.env.TRACE_URL}`;
    this.reportGzipUrl = `${serverOrigin}${process.env.TRACE_GZIP_URL}`;
  }

  public static getInstance(params: ReportClientParams) {
    if (!ReportClient.instance) {
      ReportClient.instance = new ReportClient(params);
    }
    return ReportClient.instance;
  }
  //sendData xhr方式上报数据
  public sendData(data: any, projectInfo?: ProjectInfoType) {
    try {
      const xhr = XHR();
      const appInfo = windowOrs.nativeData;

      xhr.toReport({
        url: this.reportUrl,
        // gzip默认是开启的，只有明确指定为A（关闭）的时候才会关闭
        gzipUrl:
          windowOrs.samplingConfig?.featureFlags?.sdkGzipSwitch !== "A"
            ? this.reportGzipUrl
            : "",
        data,
        accessNo: appInfo?.accessNo,
        webGroupId: projectInfo?.projectId || this.webGroupId,
      });
    } catch (error) {
      logReport("sendData", error);
    }
  }

  //sendBeacon方式上报数据
  public sendBeaconData(data: readonly CollectStoreType[]) {
    try {
      const dataHandle = this.getDataHandle();
      const concatData = dataHandle.composeData(data);
      if (!concatData) return;

      const navigator = new ByNavigator();
      const appInfo = windowOrs.nativeData;
      const reportUrl = `${this.reportUrl}?accessNo=${appInfo?.accessNo || this.webGroupId}&webGroupId=${this.webGroupId}`;
      return navigator.toReport(reportUrl, concatData);
    } catch (error) {
      logReport("sendBeaconData", error);
      return false;
    }
  }

  public flush() {
    try {
      CollectStore.flush((storeData) => {
        if (!storeData || !storeData?.length) {
          return;
        }
        // 修正类型定义：按 projectId 分组的数据结构
        interface ProjectGroup {
          projectInfo?: ProjectInfoType; // 可选的项目信息
          items: any[]; // 该项目的所有数据项
        }

        const flushData: Record<string, ProjectGroup> = {};

        for (let i = 0; i < storeData.length; i++) {
          const item = storeData[i];

          // 过滤不需要上报的事件
          if (!this.shouldReportEvent(this.sessionParams, item)) {
            continue;
          }

          const singleData: CollectStoreType | null = this.beforeSend(
            this.sessionParams,
            item,
          );
          if (!singleData?.rumType) continue;

          // 检查是否有 projectInfo 字段
          if (isJsErrorWithProject(item) && item.projectInfo) {
            const projectId = item.projectInfo.projectId;

            // 如果该项目ID不存在，创建新的数组
            if (!flushData[projectId]) {
              flushData[projectId] = {
                projectInfo: item.projectInfo,
                items: [],
              };
            }

            // 将数据添加到对应的项目数组中
            flushData[projectId].items.push(item);
          } else {
            // 没有 projectInfo 的数据，放入 mainApp 分组
            if (!flushData["mainApp"]) {
              flushData["mainApp"] = {
                items: [],
              };
            }
            flushData["mainApp"].items.push(item);
          }
        }
        // 遍历所有分组发送数据
        Object.keys(flushData).forEach((projectId) => {
          const projectInfo = flushData[projectId].projectInfo;
          const itemsData = flushData[projectId].items;
          if (itemsData.length > 0) {
            const dataHandle = this.getDataHandle(projectInfo);
            this.sendData(
              dataHandle.composeData(itemsData),
              dataHandle.getProjectInfo(), // 可能需要根据 projectId 获取对应的项目信息
            );
          }
        });
      });
      CollectStore.clear();
    } catch (error) {
      logReport("flush", error);
    }
  }

  public getDataHandle(projectInfo?: ProjectInfoType) {
    const appInfo = windowOrs.nativeData;
    const { name, version, appId } = this.sessionParams;
    const {
      os,
      osVersion,
      osVersionMajor,
      networkType,
      screenSize,
      browser,
      browserVersion,
      browserVersionMajor,
    } = deviceInfo;
    const dataHandle = new DataHandle({
      name: appInfo?.name || name,
      projectName: projectInfo?.name || name,
      projectVersion: projectInfo?.version || version,
      version: appInfo?.version || version,
      appId: appInfo?.appId || appId,
      sdkName: "ors_web",
      sdkVersion: pkg.version,
      osName: appInfo?.osName || os,
      osVersion: osVersion,
      osVersionMajor: osVersionMajor,
      networkType: appInfo?.networkType || networkType || "", // 这个属性 webview里没有这个属性
      deviceId: appInfo?.deviceId || windowOrs.userConfig.deviceId,
      deviceScreen: screenSize,
      browser: browser,
      browserVersion: browserVersion,
      browserVersionMajor: browserVersionMajor,
      webviewId: appInfo?.webviewId || "",
      orsSdkVersion: appInfo?.orsSdkVersion || "",
      webviewStartTime: appInfo?.webviewStartTime || "",
      deviceModel: appInfo?.deviceModel || "",
      instanceId: appInfo?.instanceId || "",
      createTime: appInfo?.createTime || "",
      customTags: windowOrs.customInfo,
      userAgent: navigator.userAgent,
    });
    if (projectInfo) {
      dataHandle.setProjectInfo(projectInfo);
    }
    return dataHandle;
  }
  public beforeSend(options: SessionParams, item: CollectStoreType) {
    try {
      if (typeof options?.beforeSend === "function") {
        try {
          return options?.beforeSend(item);
        } catch (error) {
          console.error("beforeSend error", error);
          return item;
        }
      } else {
        return item;
      }
    } catch (error) {
      logReport("beforeSend", error);
      return item;
    }
  }

  //上报前判断是否该上报
  public shouldReportEvent(
    options: SessionParams,
    item: CollectStoreType,
    projectInfo?: ProjectInfoType,
  ) {
    try {
      //事件过滤
      if (EventFilter.shouldDrop(item, options)) {
        return false;
      }

      //采样率过滤
      const decision = SamplingManager.decide(item);
      if (decision === "unready") {
        const collectData = projectInfo ? { ...item, projectInfo } : item;
        CollectStore.add(collectData);
        return false;
      }
      if (decision === "drop") {
        return false;
      }

      return true;
    } catch (error) {
      logReport("shouldReportEvent", error);
      return false;
    }
  }
}

//过滤出多条rumType为ors_view且viewSubType为pageload的数据中最后一条
export const mergeDuplicateViewData = (data: readonly CollectStoreType[]) => {
  try {
    if (!data || !Array.isArray(data)) {
      return data;
    }
    // 判断是否为ors_view且pageload
    const isPageload = (i: { rumType: string; viewSubType: string }) =>
      i?.rumType === "ors_view" && i?.viewSubType === "pageload";

    // ors_view且pageload数据
    const pageLoadList = data.filter(isPageload);

    // 判断是否为ors_view且navigation
    const isNavigation = (i: { rumType: string; viewSubType: string }) =>
      i.rumType === "ors_view" && i.viewSubType === "navigation";

    // ors_view且navigation数据
    const navigationList = data.filter(isNavigation);

    const duplicatePageLoadList = getLastOfDuplicatePageload(pageLoadList);
    const duplicateNavigationList =
      getLastOfDuplicateNavigationAndOthersNavigation(navigationList);

    // 判断是否为ors_view且navigation
    const othersList = data.filter((e) => !isPageload(e) && !isNavigation(e));

    return [
      ...duplicatePageLoadList,
      ...duplicateNavigationList,
      ...othersList,
    ];
  } catch (error) {
    logReport("mergeDuplicateViewData", error);
    return data;
  }
};

//过滤出重复多条rumType为ors_view且viewSubType为pageload的数据中最后一条
export const getLastOfDuplicatePageload = (data: CollectStoreType[]) => {
  try {
    // 只有当多条pageload时才进行处理
    if (data.length <= 1) {
      return data;
    }
    // 取最后一条ors_view且pageload数据
    const lastPageLoadList = data[data.length - 1];

    return [lastPageLoadList];
  } catch (error) {
    logReport("getLastOfDuplicatePageload", error);
    return data;
  }
};

// 过滤出多条rumType为ors_view且viewSubType为navigation且eventId和startTime相同的数据中最后一条与其他不重复navigation数据合并
export const getLastOfDuplicateNavigationAndOthersNavigation = (
  data: CollectStoreType[],
) => {
  try {
    // 只有当多条navigation时才进行处理
    if (data.length <= 1) {
      return data;
    }
    // Map key -> { last: Item, count: number }
    const map = new Map<string, { last: any; count: number }>();

    for (const item of data) {
      const key = `${item.viewId ?? ""}_${item.viewStartTime ?? ""}`;
      const entry = map.get(key);
      if (entry) {
        // 已存在：增加计数并覆盖 last（保证最后一条被保留）
        entry.count += 1;
        entry.last = item;
      } else {
        // 新键：初始化 count = 1
        map.set(key, { last: item, count: 1 });
      }
    }

    const result = [];
    for (const { last } of map.values()) {
      // 只取出现次数 > 1 的键的最后一条
      //   if (count > 1) result.push(last);
      result.push(last);
    }

    return result;
  } catch (error) {
    logReport("getLastOfDuplicateNavigationAndOthersNavigation", error);
    return data;
  }
};
