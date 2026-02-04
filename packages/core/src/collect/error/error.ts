import Base from "../base";
import getrandomNumber from "@/utils/getrandomNumber";
import MD5 from "md5-es";
import { logReport, eventBus } from "@/config";
import { openWhiteScreen } from "@/plugin/whiteScreen";
import { userInfoStore, windowOrs, Breadcrumbs } from "@/store";
import { sdkLifeTimeEmitter } from "@/utils/mitt";
import {
  JsErrorInfoType,
  BlankScreenErrorEventType,
  BlankScreenErrorInfoType,
  ProjectInfoType,
  SessionParams,
  UserAttrsInfo,
  SessionInfosType,
  ActionInfoType,
  ViewAttrsType,
  JsErrorEventType,
  whiteScreenMonitorParamsType,
} from "@/types/init";
import type { SeverityLevel, Mechanism } from "@/types/error";
import { isErrorAsDiscarded } from "@/utils/error";
import { ORS_ERROR_RETHROW } from "@/constant";
import { needSkipError } from "@/utils/error";
import { scopeHub } from "@/api//scope";
export default class ErrorBase extends Base {
  public category: string;
  public level: string;
  public msg: string | Event;
  public url: string | undefined;
  public errorObj: string | undefined | object;
  public errorList: any[] = [];
  public params: SessionParams;
  constructor(params: SessionParams) {
    super(params);
    this.params = params;
    // this.category = ErrorCategoryEnum.UNKNOW_ERROR; //错误类型
    // this.level = ErrorLevelEnum.INFO; //错误等级
    this.category = ""; //错误类型
    this.level = ""; //错误等级
    this.msg = ""; //错误信息
    this.url = ""; //错误信息地址
    this.errorObj = ""; //错误堆栈
  }

  /**
   * 记录错误信息
   * errorType:错误类型
   */
  recordError(options: {
    message: string;
    error?: Error | string | object | undefined;
    errorSubType: string;
    mechanism: Mechanism;
    level?: SeverityLevel;
    filename?: string;
    projectInfoParams?: ProjectInfoType;
  }) {
    try {
      const {
        message,
        error,
        errorSubType,
        mechanism,
        filename = "",
        projectInfoParams,
      } = options;
      // 如果未采集到错误信息和错误堆栈信息的时候,不上报这种错误,对业务方没有帮助
      if (!message && (!error || (error instanceof Error && !error?.stack)))
        return;

      //如果该错误已经被捕获上报，再次被rethrow出来的不进行上报
      if ((error as any)?.[ORS_ERROR_RETHROW]) return;

      if (needSkipError(message, this.params)) {
        // 错误信息采样黑名单
        return;
      }
      const userInfo: UserAttrsInfo = userInfoStore.get() as UserAttrsInfo;
      const sessionInfo: SessionInfosType = this.getSessionInfo();
      const viewAttrs: ViewAttrsType = windowOrs.orsViewAttrs;
      const errorEvent: JsErrorEventType = {
        id: getrandomNumber(32),
        rumType: "ors_error",
        type: "js",
        subtype: errorSubType,
        mechanism,
        msg: message,
        source: "js",
        catId: MD5.hash(message || "undefined"),
        errorObj: (error as Error)?.stack,
        sessionType: "user",
        filename,
      };
      const breadcrumbs = Breadcrumbs.get();
      const scopeSnapshot = scopeHub.getScopeSnapshot();
      const scopeData = scopeSnapshot.getScopeData();
      const errorInfo: JsErrorInfoType = {
        ...userInfo,
        ...viewAttrs,
        ...sessionInfo,
        ...this.actionInfo(),
        ...breadcrumbs,
        ...errorEvent,
        extra: scopeData.extra,
      };
      if (errorSubType === "vue") {
        // vue的组件错误单独处理
        errorInfo.componentName = (
          error as { componentName?: string }
        )?.componentName;
        errorInfo.orsCompMark =
          (error as { orsCompMark?: string })?.orsCompMark || "";
      }

      if (errorSubType === "react") {
        // react的组件错误单独处理
        errorInfo.componentName = (
          error as { componentName?: string }
        )?.componentName;
        errorInfo.orsCompMark =
          (error as { orsCompMark?: string })?.orsCompMark || "";
      }

      // 如果业务方使用和ubs一起的可观测的功能，需要加上scene字段
      if (windowOrs.ubsData.scenes) errorInfo.scenes = windowOrs.ubsData.scenes;

      // 更新页面的结束时长
      this.updateViewEndTime();
      this.openWhiteScreenMonitor({ errorInfo });
      sdkLifeTimeEmitter.emit("reportError", errorInfo);
      // 如果错误通过插件被废弃，则不上报
      if (isErrorAsDiscarded(errorInfo)) {
        return;
      }
      //可能通过integration的方式，改变error中的项目信息，以此调整上报到的项目id
      let projectInfo: ProjectInfoType | undefined = projectInfoParams;
      if (errorInfo.projectInfo) {
        projectInfo = errorInfo?.projectInfo;
        delete errorInfo.projectInfo;
      }
      this.reportData([errorInfo], projectInfo);
      //清除面包屑
      Breadcrumbs.clear();
    } catch (error) {
      logReport("recordError", error);
    }
  }
  // 开启白屏检测
  openWhiteScreenMonitor(params: whiteScreenMonitorParamsType = {}) {
    const { errorInfo } = params;
    if (windowOrs.plugins.blankScreen.autoDetect) {
      let blankScreenInfo: Partial<BlankScreenErrorEventType> = {
        id: getrandomNumber(32),
        rumType: "ors_error",
        type: "blank_screen",
        subtype: "js_error",
        source: "js",
        sessionType: "user",
        reasonId: "",
      };
      if (errorInfo) {
        // 检测到白屏时，修改上报信息
        openWhiteScreen(
          (res: { status: string }) => {
            if (res.status === "error") {
              blankScreenInfo.reasonId = errorInfo.id;
              // 白屏的errorId使用新生成的
              blankScreenInfo.id = getrandomNumber(32);
              blankScreenInfo.subtype = "js_error";
              blankScreenInfo = {
                ...errorInfo,
                ...blankScreenInfo,
              } as BlankScreenErrorInfoType;
              const blankScreenErrorInfo: BlankScreenErrorInfoType =
                blankScreenInfo as BlankScreenErrorInfoType;
              this.reportData([blankScreenErrorInfo]);
            }
          },
          {
            skeletonProject: false,
            whiteBoxElements: windowOrs.plugins.blankScreen.rootSelector,
          },
        );
      }
      // 监听错误的资源
      eventBus.on("errorStaticRes", (resource) => {
        // 检测到白屏时，修改上报信息
        openWhiteScreen(
          (res: { status: string }) => {
            if (res.status === "error") {
              // 在这里上报
              const userInfo = userInfoStore.get() as ActionInfoType;
              // resonId使用最近上一次的error_Id
              blankScreenInfo.reasonId = resource.id;
              // 白屏的errorId使用新生成的
              blankScreenInfo.id = getrandomNumber(32);
              blankScreenInfo.subtype = resource.netType + "_error";
              blankScreenInfo.resourceUrl = resource.url;
              blankScreenInfo.resourceMethod = resource?.method;
              blankScreenInfo.resourceStatus = resource?.status;
              blankScreenInfo.source = "network";
              blankScreenInfo.msg = resource.url;
              blankScreenInfo.catId = MD5.hash(
                resource?.url + resource?.status + resource?.method,
              );
              blankScreenInfo = {
                ...blankScreenInfo,
                ...userInfo,
                ...windowOrs.orsViewAttrs,
                ...this.getSessionInfo(),
                ...this.actionInfo(),
              };
              const blankScreenErrorInfo: BlankScreenErrorInfoType =
                blankScreenInfo as BlankScreenErrorInfoType;
              this.reportData([blankScreenErrorInfo]);
            }
          },
          {
            skeletonProject: false,
            whiteBoxElements: windowOrs.plugins.blankScreen.rootSelector,
          },
        );
      });
      // 监听路由切换时是否产生白屏
      eventBus.on("pageChange", () => {
        // 检测到白屏时，修改上报信息
        openWhiteScreen(
          (res: { status: string }) => {
            if (res.status === "error") {
              blankScreenInfo.reasonId = "";
              // 白屏的errorId使用新生成的
              blankScreenInfo.id = getrandomNumber(32);
              blankScreenInfo.subtype = "unknown";
              blankScreenInfo.msg = windowOrs.orsViewPage.viewUrl;
              blankScreenInfo.catId = MD5.hash(windowOrs.orsViewPage.viewUrl);
              blankScreenInfo = {
                ...blankScreenInfo,
                ...windowOrs.orsViewAttrs,
                ...this.getSessionInfo(),
                ...this.actionInfo(),
              };
              const blankScreenErrorInfo: BlankScreenErrorInfoType =
                blankScreenInfo as BlankScreenErrorInfoType;
              this.reportData([blankScreenErrorInfo]);
            }
          },
          {
            skeletonProject: false,
            whiteBoxElements: windowOrs.plugins.blankScreen.rootSelector,
          },
        );
      });
    }
  }
}
