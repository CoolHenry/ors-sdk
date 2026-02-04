import ErrorBase from "./error";
import { ErrorCategoryEnum, ErrorLevelEnum } from "@/constant";
import { logReport } from "@/config";
import { Logger } from "@/utils/common";
import type { SessionParams } from "@/types/init";
import { MonitorDestroyReason } from "@/types/lifecycle";
import { sdkLifeTimeEmitter } from "@/utils/mitt";
/**
 * 捕获未处理的Promise异常
 */
class PromiseError extends ErrorBase {
  listenerError: any;
  constructor(params: SessionParams) {
    super(params);
    this.listenerError = this.unhandledRejectionError.bind(this);
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
  unhandledRejectionError(event: any) {
    try {
      if (!event || !event.reason) {
        return;
      }
      Logger.log("[log][errorEvent-unhandledrejection]:", event);
      //判断当前被捕获的异常url，是否是异常处理url，防止死循环
      if (event.reason.config && event.reason.config.url) {
        this.url = event.reason.config.url;
      }
      this.level = ErrorLevelEnum.WARN;
      this.category = ErrorCategoryEnum.PROMISE_ERROR;
      this.msg =
        typeof event.reason === "object"
          ? event?.reason?.message
          : event.reason;
      const errorType = "promise";
      this.errorObj = {
        stack:
          typeof event.reason === "object" ? event?.reason?.stack : undefined,
      };
      setTimeout(() => {
        this.recordError({
          message: String(this.msg),
          error: this.errorObj,
          mechanism: {
            handled: false,
            type: "auto.browser.global_handlers.onunhandledrejection",
          },
          errorSubType: errorType,
        });
      }, 0);
    } catch (error) {
      logReport("promiseListenerError", error);
    }
  }

  /**
   * 处理错误
   */
  monitorError() {
    window.addEventListener("unhandledrejection", this.listenerError, true);
  }
  // 销毁错误监听器
  destroyListenter() {
    window.removeEventListener("unhandledrejection", this.listenerError, true);
  }
}
export default PromiseError;
