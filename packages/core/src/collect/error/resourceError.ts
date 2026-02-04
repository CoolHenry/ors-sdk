import ErrorBase from "./error";
import { ErrorCategoryEnum, ErrorLevelEnum } from "@/constant";
import { logReport } from "@/config";
import { windowOrs } from "@/store";
import type { SessionParams } from "@/types/init";
import { MonitorDestroyReason } from "@/types/lifecycle";
import { Logger } from "@/utils/common";
import { shouldIgnoreOnError } from "./helpers";
import { sdkLifeTimeEmitter } from "@/utils/mitt";
/**
 * 资源加载错误
 */
class ResourceError extends ErrorBase {
  listenerError: any;
  params: SessionParams;
  constructor(params: SessionParams) {
    super(params);
    this.params = params;
    this.listenerError = this.jsAndResError.bind(this);
    this.handleError();
    this.monitorDestroy();
  }
  private monitorDestroy() {
    sdkLifeTimeEmitter.on("monitorDestroy", (reason: MonitorDestroyReason) => {
      switch (reason) {
        case "sdk:teardown":
          this.destroyListenter();
          break;
        default:
          break;
      }
    });
  }

  jsAndResError(event: any) {
    Logger.log("[log][errorEvent-jsAndRes]:", event);
    try {
      if (!event) {
        return;
      }
      if (shouldIgnoreOnError()) {
        return;
      }
      // 错误信息黑名单
      this.category = ErrorCategoryEnum.RESOURCE_ERROR;
      const target = event.target || event.srcElement;
      const isElementTarget =
        target instanceof HTMLScriptElement ||
        target instanceof HTMLLinkElement ||
        target instanceof HTMLImageElement;
      if (!isElementTarget) {
        setTimeout(() => {
          try {
            this.recordError({
              message: event?.message,
              error: event?.error,
              errorSubType: "js",
              mechanism: {
                handled: false,
                type: "auto.browser.global_handlers.onerror",
              },
              filename: event?.filename,
            });
          } catch (error) {
            logReport("jsRecordError", error);
          }
        }, 0);
        return; // js error
      }

      this.level =
        target?.tagName.toUpperCase() === "IMG"
          ? ErrorLevelEnum.WARN
          : ErrorLevelEnum.ERROR;
      this.msg = "加载 " + target?.tagName + " 资源错误";
      this.url =
        (target as HTMLImageElement)?.src || (target as HTMLLinkElement)?.href;
      this.errorObj = {
        stack: target?.outerHTML,
      };
      windowOrs.orsDataInfo.resourceErrorList.push(this.url);
    } catch (error) {
      logReport("listenerError", error);
    }
  }
  /**
   * 注册onerror事件
   */
  handleError() {
    window.addEventListener("error", this.listenerError, true);
  }

  // 销毁错误监听器
  destroyListenter() {
    window.removeEventListener("error", this.listenerError, true);
  }
}
export default ResourceError;
