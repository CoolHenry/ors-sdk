import Base from "../base";
import { logReport } from "@/config";
import {
  SessionParams,
  RequestItem,
  ResourceAndRequestInfoType,
} from "@/types/init";
import { eventBus, SamplingManager } from "@/config";
import { windowOrs, Breadcrumbs } from "@/store";
import type { FetchInfoType } from "@/types/init";
import { MonitorDestroyReason } from "@/types/lifecycle";
import { Logger } from "@/utils/common";
import { urlIncludes, needSkipUrlCollect } from "@/utils";
import { ResourceCollect } from "@/collect/resource/index";
import { sdkLifeTimeEmitter } from "@/utils/mitt";

export class RequestCollect extends Base {
  [x: string]: any;
  originalFetch: typeof window.fetch & { _isHijackedBySDK?: boolean };
  ResourceCollectStance: ResourceCollect;
  originalOpen:
    | (typeof XMLHttpRequest.prototype.open & { _isHijackedBySDK?: boolean })
    | null;
  originalSend: typeof XMLHttpRequest.prototype.send | null;
  isEnableReport: boolean;

  constructor(params: SessionParams) {
    super(params);
    this.params = params;
    this.originalFetch = window.fetch.bind(window);
    this.ResourceCollectStance = ResourceCollect.getInstance(params);
    this.originalOpen = null;
    this.originalSend = null;
    // 是否开启上报
    this.isEnableReport = true;
    this.monitorDestroy();
  }

  private monitorDestroy() {
    sdkLifeTimeEmitter.on("monitorDestroy", (reason: MonitorDestroyReason) => {
      switch (reason) {
        case "sdk:teardown":
          this.destroyMonitor();
          break;
        default:
          break;
      }
    });
  }

  // 初始化请求监控
  public initMonitor() {
    try {
      // 设置 XHR 拦截
      this.setupXhrInterception();
      // 设置 fetch 拦截
      this.setupFetchInterception();
    } catch (error) {
      logReport("initMonitor", error);
    }
  }

  // 初始化请求监控
  public destroyMonitor() {
    try {
      this.isEnableReport = false;
    } catch (error) {
      logReport("destroyRequestMonitor", error);
    }
  }
  /** 上报请求 */
  private reportRequest(item: RequestItem): void {
    try {
      const entryResource = window.performance.getEntriesByType("resource");

      for (let i = entryResource.length - 1; i >= 0; i--) {
        const entry = entryResource[i];
        if (this.fobiddenReportSdkResource(entry)) {
          continue;
        }
        if (
          this.isPerformanceResourceTiming(entry) &&
          entry.name.endsWith(item?.url)
        ) {
          requestAnimationFrame(() => {
            try {
              // 消费请求
              const resourceData: ResourceAndRequestInfoType | null =
                this.ResourceCollectStance.handleResourceData(entry, {
                  method: item?.method || "get",
                  netType: "api",
                  responseBodySize: item?.responseBodySize,
                  status: item?.status,
                });
              if (!resourceData) {
                return;
              }
              if (item?.status >= 200 && item?.status < 300) {
                this.reportRequestData(resourceData);
              } else {
                this.reportRequestData(resourceData);
                eventBus.emit("errorStaticRes", resourceData);
              }
            } catch (error) {
              logReport("reportRequest", error);
            }
          });
          break;
        }
      }
    } catch (error) {
      logReport("reportRequest", error);
    }
  }
  private reportRequestData(resourceData: ResourceAndRequestInfoType) {
    /** 根据采样率判断是否需要上报操作数据，如果需要就上报，否则只采集数据 */
    const isRateDrop =
      SamplingManager.decide({ rumType: "ors_resource" }) === "drop";
    if (isRateDrop) {
      // 采集的数据存入store
      Breadcrumbs.add(resourceData);
    }
    this.reportData([resourceData]);
  }
  private isPerformanceResourceTiming(
    entry: PerformanceEntry,
  ): entry is PerformanceResourceTiming {
    return (
      entry.entryType === "resource" &&
      "initiatorType" in entry &&
      typeof (entry as PerformanceResourceTiming).nextHopProtocol ===
        "string" &&
      (entry.initiatorType === "fetch" ||
        entry.initiatorType === "xmlhttprequest")
    );
  }
  //过滤sdk自身上报url
  private fobiddenReportSdkResource(entry: PerformanceResourceTiming) {
    if (!entry?.name) {
      return false; // 没有name，不处理
    }
    try {
      //匹配过滤掉url的参数部分
      const entryName = new URL(entry.name);
      const pathName = `${entryName?.origin}${entryName?.pathname}`;
      // 自身url的过滤
      if (entryName && urlIncludes(pathName, this.params)) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      // 处理URL解析错误，比如无效的URL
      logReport("fobiddenReportSdkResource", e);
      return false;
    }
  }

  // 设置 XHR 拦截
  // todo 失败没有状态码的情况，状态码怎么标识 用failed?
  private setupXhrInterception() {
    // 新增：检查是否已劫持
    if (this.originalOpen && this.originalOpen._isHijackedBySDK) {
      return;
    }

    const proto = XMLHttpRequest.prototype;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.originalOpen = proto.open;
    this.originalSend = proto.send;

    // 防止重复监听
    this.originalOpen._isHijackedBySDK = true;

    proto.open = function (
      method: string,
      url: string,
      ...rest: (boolean | string | null | undefined)[]
    ) {
      try {
        this._method = method;
        this._url = url;
      } catch (error) {
        logReport("hijackXhrOpenError", error);
      }
      if (that.originalOpen) {
        return (
          that.originalOpen as (
            this: XMLHttpRequest,
            method: string,
            url: string,
            ...rest: any[]
          ) => any
        ).call(this, method, url, ...rest);
      }
    };

    proto.send = function (...args: any[]) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const xhr = this;
        if (!needSkipUrlCollect(xhr._url, that.params)) {
          if (xhr.addEventListener) {
            xhr.addEventListener("load", () => {
              that.updateXhrByResponseType(xhr);
            });
            xhr.addEventListener("error", () => {
              that.updateXhrByResponseType(xhr);
            });
          } else {
            xhr.onload = () => {
              that.updateXhrByResponseType(xhr);
            };
            xhr.onerror = () => {
              that.updateXhrByResponseType(xhr);
            };
          }
        }
      } catch (error) {
        logReport("hijackXhrSendError", error);
      }
      if (that.originalSend) {
        return that.originalSend.apply(
          this,
          args?.length > 0 ? [args?.[0]] : [],
        );
      }
    };
  }

  /**只有通过XMLHttpRequest.responseType为text||''时，才能通过responseText 获取响应体大小 */
  private updateXhrByResponseType(xhr: XMLHttpRequest) {
    try {
      /**是否采集上报异步接口的响应体大小 */
      const isCollectResponseBodySize = windowOrs.userConfig.responseBodySize;
      if (isCollectResponseBodySize) {
        if (xhr.responseType === "text" || xhr.responseType === "") {
          const bytes = xhr.responseText
            ? new TextEncoder().encode(xhr.responseText).length
            : null;
          this.updateXhrList(xhr, bytes);
        } else if (xhr.responseType === "json") {
          const s = JSON.stringify(xhr.response);
          const bytes = new TextEncoder().encode(s).length;
          this.updateXhrList(xhr, bytes);
        } else if (xhr.responseType === "arraybuffer") {
          const ab = xhr.response;
          const bytes = ab ? ab.byteLength : null;
          this.updateXhrList(xhr, bytes);
        } else if (xhr.responseType === "blob") {
          const blob = xhr.response;
          const bytes = blob.size;
          this.updateXhrList(xhr, bytes);
        } else {
          this.updateXhrList(xhr);
        }
      } else {
        this.updateXhrList(xhr);
      }
    } catch (error) {
      logReport("updateXhrByResponseType", error);
    }
  }

  // 更新 XHR 列表
  private updateXhrList(xhr: any, bytes?: number | null) {
    try {
      if (!this.isEnableReport) {
        return;
      }
      Logger.log("[log][updateXhrList]:", xhr);
      this.reportRequest({
        url: xhr?.responseURL || xhr?._url,
        method: xhr?._method,
        status: xhr?.status,
        responseBodySize: bytes ?? null,
      });
    } catch (error) {
      logReport("updateXhrList", error);
    }
  }

  // 设置 fetch 拦截
  private setupFetchInterception() {
    try {
      if (!window.fetch) return;

      if (!this.originalFetch) {
        this.originalFetch = window.fetch.bind(window);
      }

      if (this.originalFetch._isHijackedBySDK) {
        // 防止重复劫持
        return;
      }

      const safeFetch: typeof window.fetch & { _isHijackedBySDK?: boolean } = (
        input,
        init,
      ) => {
        try {
          const url =
            input instanceof Request
              ? input?.url
              : input instanceof URL
                ? input?.href
                : input;
          if (needSkipUrlCollect(url, this.selfReportUrl)) {
            return this.originalFetch(input, init);
          }

          let newRequest: RequestInfo | URL;

          if (input instanceof Request) {
            // 如果传的是 Request 对象，重新构造一个新的 Request
            const originalHeaders = input.headers
              ? Object.fromEntries(input.headers.entries())
              : {};
            newRequest = new Request(input, {
              ...init,
              headers: new Headers({
                ...originalHeaders,
              }),
            });
          } else {
            // 如果传的是 URL 字符串
            const originalHeaders =
              init && init.headers
                ? Object.fromEntries(new Headers(init.headers)?.entries())
                : {};
            newRequest = input;
            init = {
              ...init,
              headers: new Headers({
                ...originalHeaders,
              }),
            };
          }

          return this.originalFetch(newRequest, init)
            .then((response: Response) => {
              try {
                const status = response.status;
                this.updateFetchList(
                  {
                    url,
                    method:
                      input instanceof Request
                        ? input?.method
                        : (init?.method ?? "GET"),
                    status,
                  },
                  response,
                );
              } catch (err) {
                logReport("safeFetchResponse", err);
              }
              return response; //必须返回原始 response
            })
            .catch((err) => {
              throw err; //必须把错误抛回业务方
            });
        } catch (err) {
          //  如果SDK逻辑崩了，直接回退原生fetch
          logReport("safeFetch", err);
          return this.originalFetch(input, init);
        }
      };

      // 标记，防止重复劫持
      safeFetch._isHijackedBySDK = true;

      // 替换全局 fetch
      window.fetch = safeFetch;
    } catch (error) {
      logReport("setupFetchInterception", error);
    }
  }

  // 更新 fetch列表
  private updateFetchList(fetchInfo: FetchInfoType, response: Response) {
    try {
      if (!this.isEnableReport) {
        return;
      }
      /**是否采集上报异步接口的响应体大小 */

      const isCollectResponseBodySize = windowOrs.userConfig.responseBodySize;
      let responseBodySize: number | null = null;
      const updateReqInfo = {
        ...{
          ...fetchInfo,
          url: (fetchInfo.url && new URL(fetchInfo.url)?.href) || fetchInfo.url,
        },
        responseBodySize,
      };
      if (isCollectResponseBodySize) {
        // 1. 克隆 Response 对象，避免原始 response 被消耗
        const clonedResponse = response.clone();
        clonedResponse.blob().then((blob) => {
          responseBodySize = blob.size;
          this.reportRequest({ ...updateReqInfo, responseBodySize });
        });
      } else {
        this.reportRequest(updateReqInfo);
      }
    } catch (error) {
      logReport("updateFetchList", error);
    }
  }
}
