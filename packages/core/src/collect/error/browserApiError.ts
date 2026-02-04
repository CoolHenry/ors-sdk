import { fill, getFunctionName, getOriginalFunction } from "@/utils/fill";
import { WINDOW, wrap, ReportInfo } from "./helpers";
import ErrorBase from "./error";
import {
  XMLHttpRequestProp,
  BrowserApiErrorsOptions,
  WrappedFunction,
} from "@/types/error";
import { DEFAULT_EVENT_TARGET } from "@/constant";
import { logReport } from "@/config";
import type { SessionParams } from "@/types/init";
import { MonitorDestroyReason } from "@/types/lifecycle";
import { windowOrs } from "@/store/windowOrs";
import { sdkLifeTimeEmitter } from "@/utils/mitt";

class BrowserApiError extends ErrorBase {
  isEnableReport: boolean;
  constructor(params: SessionParams) {
    super(params);
    // 是否开启上报
    this.isEnableReport = true;
    this.fillBrowserApi();
    this.monitorDestroy();
    // 在构造函数中绑定 this
    this.reportCallback = this.reportCallback.bind(this);
  }
  fillBrowserApi(options: Partial<BrowserApiErrorsOptions> = {}) {
    try {
      const _options = {
        XMLHttpRequest: true,
        eventTarget: true,
        requestAnimationFrame: true,
        setInterval: true,
        setTimeout: true,
        unregisterOriginalCallbacks: false,
        ...options,
      };
      // We may want to adjust this to check for client etc.
      if (_options.setTimeout) {
        fill(WINDOW, "setTimeout", this._wrapTimeFunction.bind(this));
      }

      if (_options.setInterval) {
        fill(WINDOW, "setInterval", this._wrapTimeFunction.bind(this));
      }

      if (_options.requestAnimationFrame) {
        fill(WINDOW, "requestAnimationFrame", this._wrapRAF.bind(this));
      }

      if (_options.XMLHttpRequest && "XMLHttpRequest" in WINDOW) {
        fill(XMLHttpRequest.prototype, "send", this._wrapXHR.bind(this));
      }

      const eventTargetOption = _options.eventTarget;
      if (eventTargetOption) {
        const eventTarget = Array.isArray(eventTargetOption)
          ? eventTargetOption
          : DEFAULT_EVENT_TARGET;
        eventTarget.forEach((target) =>
          this._wrapEventTarget(target, _options),
        );
      }
    } catch (error) {
      logReport("fillBrowserApi", error);
    }
  }
  reportCallback({ message, error, errorType, mechanism }: ReportInfo) {
    if (windowOrs.samplingConfig.jsError && this.isEnableReport) {
      this.recordError({
        message,
        error,
        errorSubType: errorType,
        mechanism,
      });
    }
  }

  destroyListenter() {
    this.isEnableReport = false;
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
  /**
   * Wrap timer functions and event targets to catch errors and provide better meta data.
   */
  // export const browserApiErrorsIntegration = defineIntegration(_browserApiErrorsIntegration);

  _wrapTimeFunction<T extends (...args: any[]) => any>(
    original: T,
  ): (...args: Parameters<T>) => ReturnType<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
      const originalCallback = args[0];
      args[0] = wrap(originalCallback, {
        mechanism: {
          data: { function: getFunctionName(original) },
          handled: false,
          type: `auto.browser.browserapierrors.${getFunctionName(original)}`,
        },
        reportCallback: that.reportCallback,
      });
      return original.apply(this, args);
    };
  }

  _wrapRAF(
    original: (callback: FrameRequestCallback) => number,
  ): (callback: FrameRequestCallback) => number {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    return function (this: unknown, callback: FrameRequestCallback): number {
      return original.apply(this, [
        wrap(callback, {
          mechanism: {
            data: {
              function: "requestAnimationFrame",
              handler: getFunctionName(original),
            },
            handled: false,
            type: "auto.browser.browserapierrors.requestAnimationFrame",
          },
          reportCallback: that.reportCallback,
        }),
      ]);
    };
  }

  _wrapXHR(
    originalSend: (body?: Document | XMLHttpRequestBodyInit | null) => void,
  ): (body?: Document | XMLHttpRequestBodyInit | null) => void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    return function (
      this: XMLHttpRequest,
      body?: Document | XMLHttpRequestBodyInit | null,
    ): void {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const xhr = this;
      const xmlHttpRequestProps: XMLHttpRequestProp[] = [
        "onload",
        "onerror",
        "onprogress",
        "onreadystatechange",
      ];

      xmlHttpRequestProps.forEach((prop) => {
        if (prop in xhr && typeof xhr[prop] === "function") {
          fill(xhr, prop, function (original: any) {
            const wrapOptions = {
              mechanism: {
                data: {
                  function: prop,
                  handler: getFunctionName(original),
                },
                handled: false,
                type: `auto.browser.browserapierrors.xhr.${prop}`,
              },
              reportCallback: that.reportCallback,
            };

            // If Instrument integration has been called before BrowserApiErrors, get the name of original function
            const originalFunction = getOriginalFunction(original);
            if (originalFunction) {
              wrapOptions.mechanism.data.handler =
                getFunctionName(originalFunction);
            }

            // Otherwise wrap directly
            return wrap(original, wrapOptions);
          });
        }
      });

      return originalSend.apply(this, [body]);
    };
  }

  _wrapEventTarget(
    target: string,
    integrationOptions: BrowserApiErrorsOptions,
  ): void {
    const globalObject = WINDOW as unknown as Record<
      string,
      { prototype?: object }
    >;
    const proto = globalObject[target]?.prototype;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    // eslint-disable-next-line no-prototype-builtins
    if (!proto?.hasOwnProperty?.("addEventListener")) {
      return;
    }

    fill(
      proto,
      "addEventListener",
      function (
        original: (
          type: string,
          listener: EventListenerOrEventListenerObject,
          options?: boolean | AddEventListenerOptions,
        ) => void,
      ): (
        ...args: Parameters<typeof WINDOW.addEventListener>
      ) => ReturnType<typeof WINDOW.addEventListener> {
        return function (
          this: unknown,
          eventName: string,
          fn: EventListenerOrEventListenerObject,
          options?: boolean | AddEventListenerOptions,
        ): void {
          try {
            if (that.isEventListenerObject(fn)) {
              // ESlint disable explanation:
              //  First, it is generally safe to call `wrap` with an unbound function. Furthermore, using `.bind()` would
              //  introduce a bug here, because bind returns a new function that doesn't have our
              //  flags(like __ors_original__) attached. `wrap` checks for those flags to avoid unnecessary wrapping.
              //  Without those flags, every call to addEventListener wraps the function again, causing a memory leak.
              // eslint-disable-next-line @typescript-eslint/unbound-method
              fn.handleEvent = wrap(fn.handleEvent, {
                mechanism: {
                  data: {
                    function: "handleEvent",
                    handler: getFunctionName(fn),
                    target,
                  },
                  handled: false,
                  type: "auto.browser.browserapierrors.handleEvent",
                },
                reportCallback: that.reportCallback,
              });
            }
          } catch {
            // can sometimes get 'Permission denied to access property "handle Event'
          }

          if (integrationOptions.unregisterOriginalCallbacks) {
            that.unregisterOriginalCallback(this, eventName, fn);
          }

          return original.apply(this, [
            eventName,
            wrap(fn, {
              mechanism: {
                data: {
                  function: "addEventListener",
                  handler: getFunctionName(fn),
                  target,
                },
                handled: false,
                type: "auto.browser.browserapierrors.addEventListener",
              },
              reportCallback: that.reportCallback,
            }),
            options,
          ]);
        };
      },
    );

    fill(
      proto,
      "removeEventListener",
      function (
        originalRemoveEventListener: (...args: any[]) => any,
      ): (
        this: unknown,
        ...args: Parameters<typeof WINDOW.removeEventListener>
      ) => ReturnType<typeof WINDOW.removeEventListener> {
        return function (
          this: unknown,
          eventName: string,
          fn: EventListenerOrEventListenerObject,
          options?: boolean | EventListenerOptions,
        ): void {
          /**
           * There are 2 possible scenarios here:
           *
           * 1. Someone passes a callback, which was attached prior to Sentry initialization, or by using unmodified
           * method, eg. `document.addEventListener.call(el, name, handler). In this case, we treat this function
           * as a pass-through, and call original `removeEventListener` with it.
           *
           * 2. Someone passes a callback, which was attached after Sentry was initialized, which means that it was using
           * our wrapped version of `addEventListener`, which internally calls `wrap` helper.
           * This helper "wraps" whole callback inside a try/catch statement, and attached appropriate metadata to it,
           * in order for us to make a distinction between wrapped/non-wrapped functions possible.
           * If a function was wrapped, it has additional property of `__ors_wrapped__`, holding the handler.
           *
           * When someone adds a handler prior to initialization, and then do it again, but after,
           * then we have to detach both of them. Otherwise, if we'd detach only wrapped one, it'd be impossible
           * to get rid of the initial handler and it'd stick there forever.
           */
          try {
            const originalEventHandler = (fn as WrappedFunction)
              .__ors_wrapped__;
            if (originalEventHandler) {
              originalRemoveEventListener.call(
                this,
                eventName,
                originalEventHandler,
                options,
              );
            }
          } catch {
            // ignore, accessing __ors_wrapped__ will throw in some Selenium environments
          }
          return originalRemoveEventListener.call(this, eventName, fn, options);
        };
      },
    );
  }

  isEventListenerObject(obj: unknown): obj is EventListenerObject {
    return typeof (obj as EventListenerObject).handleEvent === "function";
  }

  unregisterOriginalCallback(
    target: unknown,
    eventName: string,
    fn: EventListenerOrEventListenerObject,
  ): void {
    if (
      target &&
      typeof target === "object" &&
      "removeEventListener" in target &&
      typeof target.removeEventListener === "function"
    ) {
      target.removeEventListener(eventName, fn);
    }
  }
}

export default BrowserApiError;
