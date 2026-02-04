/* eslint-disable @typescript-eslint/ban-ts-comment */
import Base from "../base";
import getrandomNumber from "@/utils/getrandomNumber";
import { getPathName } from "@/utils/common";
import URL from "@/utils/URL";
import { logReport, eventBus } from "@/config";
import { getTimeOrigin } from "@/utils/getCurTime";
import { userInfoStore, windowOrs } from "@/store";
import type { SessionParams, ViewAttrsType, ViewInfoType } from "@/types/init";
import { MonitorDestroyReason } from "@/types/lifecycle";
import { sdkLifeTimeEmitter, sdkIntegrationEmitter } from "@/utils/mitt";
import { PathMatcherList } from "./pathMatcherList";
import { AbstractPathMatcher } from "./pathMatcher";
import PerformanceCollect from "@/collect/performance";
import { setViewInfo } from "@/store/viewInfoStore";
import { PerformanceManagement } from "../performance/management";
import { ActionInfoType } from "@/types/init";

//TODO 这里的类型缺失，git上没有类型定义，需要确认原因
type PerformanceMetrics = any;

export default class ViewCollect extends Base {
  public params: SessionParams;
  public isFirstLoad = true;
  //通过插件来注入
  private _pathMatcherList: PathMatcherList;
  private pageLoadViewInfo: any;
  private lastUrl: string;
  private viewReferrer: string;
  private beforeUnloadHandler: {
    (): void;
    (this: Window, ev: BeforeUnloadEvent): any;
  } | null = null;
  private routeChangeHandler: EventListener | null;
  constructor(params: SessionParams) {
    super(params);
    this.params = params;
    this.lastUrl = "";
    this.viewReferrer = "";
    this._pathMatcherList = new PathMatcherList();
    this.beforeUnloadHandler = null;
    this.routeChangeHandler = null;
    this.initPathMatcherList();
    sdkLifeTimeEmitter.emit("beforeInitViewCollect", this);
    sdkIntegrationEmitter.on("addPathMatcher", this.reportViewData);
    this.initViewAttrs();
    //监听取消监听
    this.monitorDestroy();
  }
  public initPathMatcherList() {
    //监听是否存在增量集成pathMatcherList
    sdkIntegrationEmitter.on("addPathMatcherList", () => {
      sdkLifeTimeEmitter.emit("initPathMatcherList", this._pathMatcherList);
    });
    sdkLifeTimeEmitter.emit("initPathMatcherList", this._pathMatcherList);
  }

  private monitorDestroy() {
    sdkLifeTimeEmitter.on("monitorDestroy", (reason: MonitorDestroyReason) => {
      switch (reason) {
        case "sdk:teardown":
          this.removeListeners();
          break;
        default:
          break;
      }
    });
  }
  private parseUrlInfo(forwardInfo: any) {
    try {
      const currentUrl =
        forwardInfo?.target?.location.href || window.location.href;
      const url = URL(currentUrl);
      // @ts-ignore
      const urlPath = url.hash ? url.hash : url.pathname;
      const pathname = getPathName(urlPath);
      const matcher = this.getPathMatcherList();
      const { pattern: viewName = "", name: viewPageTitle } =
        matcher?.matchPath?.(pathname) || {};
      const timeOrigin =
        getTimeOrigin(forwardInfo ? "navigation" : "pageload") * 1000;
      // 添加ts类型
      const viewReferrer =
        forwardInfo?.oldURL || document.referrer || this.viewReferrer || "";
      this.viewReferrer = url?.href;
      const viewInfo: ViewAttrsType = {
        viewId: getrandomNumber(32),
        viewType: "h5",
        viewSubType: forwardInfo ? "navigation" : "pageload",
        viewReferrer,
        viewUrl: url?.href,
        viewHost: url?.host,
        viewPath: urlPath,
        viewName,
        viewPageTitle: viewPageTitle ? encodeURIComponent(viewPageTitle) : "",
        viewPathGroup: urlPath && urlPath?.split("/")[1],
        viewQuery: url?.search,
        viewEventType: forwardInfo ? forwardInfo?.type : "pageloadState",
        viewStartTime: timeOrigin,
        viewEndTime: timeOrigin,
      };
      return viewInfo;
    } catch (error) {
      logReport("parseUrlInfo", error);
      return {} as ViewAttrsType;
    }
  }

  private initViewAttrs(forwardInfo: Event | null = null) {
    try {
      const viewAttrs: ViewAttrsType = this.parseUrlInfo(forwardInfo);
      // 兼容app属性
      if (!viewAttrs.viewReferrer && window.MDPWebViewJavascriptBridge) {
        const appInfo = windowOrs.nativeData;
        viewAttrs.viewReferrer = appInfo?.referrer || "";
      }
      windowOrs.orsViewAttrs = viewAttrs;
      return viewAttrs;
    } catch (error) {
      logReport("initViewAttrs", error);
      return {};
    }
  }

  // 获取view信息
  public getViewInfo(performance?: PerformanceCollect | null): any {
    try {
      const viewAttrs = windowOrs.orsViewAttrs;
      const { viewSubType } = viewAttrs;
      const performanceMetrics = performance ? performance.getMetrics() : {};
      const viewInfo = this.getBaseViewInfo(performanceMetrics);
      // @ts-ignore
      const baseViewInfo = { ...viewInfo, ...viewAttrs };
      windowOrs.orsViewPage = baseViewInfo;
      if (viewSubType === "pageload") {
        this.pageLoadViewInfo = baseViewInfo;
      }
      // 计算页面停留时间
      this.updateViewEndTime();
      baseViewInfo.spentDuration = windowOrs.orsViewPage.spentDuration;
      setViewInfo(baseViewInfo);
      return baseViewInfo;
    } catch (error) {
      logReport("getViewInfo", error);
      return {} as ViewInfoType;
    }
  }

  // 获取基础view信息
  private getBaseViewInfo(performance: PerformanceMetrics): ViewInfoType {
    const userInfo = userInfoStore.get() as ActionInfoType;
    return performance
      ? {
          ...userInfo,
          ...performance,
          ...this.getSessionInfo(),
          ...this.actionInfo(),
          rumType: "ors_view",
          sessionType: "user",
          spentDuration: 0,
          FMP: windowOrs.orsViewPage?.FMP || 0,
        }
      : ({} as ViewInfoType);
  }

  // 页面事件监听
  public setupPageListeners(): void {
    try {
      // DOMContentLoaded处理
      const handleDOMContentLoaded = () => {
        setTimeout(() => {
          this.isFirstLoad = false; // 页面加载完成时置位
        }, 2 * 1000);
      };

      if (document.readyState === "loading") {
        // 文档仍在加载，监听DOMContentLoaded
        document.addEventListener("DOMContentLoaded", handleDOMContentLoaded, {
          once: true,
        });
      } else {
        // 文档已加载完成，直接执行
        handleDOMContentLoaded();
      }
      this.beforeUnloadHandler = () => this.handlePageUnload();
      this.routeChangeHandler = (event: Event) => this.handlePageChange(event);
      // 绑定原生事件
      window.addEventListener("beforeunload", this.beforeUnloadHandler);
      this.listenRouteChange(this.routeChangeHandler);
    } catch (error) {
      logReport("setupPageListeners", error);
    }
  }

  // 处理页面卸载
  private handlePageUnload(): void {
    try {
      if (!windowOrs.orsViewPage?.viewId) return;
      this.updateViewEndTime();
      const reportDataInfo = [windowOrs.orsViewPage];
      this.reportData(reportDataInfo);
    } catch (error) {
      logReport("handlePageUnload", error);
    }
  }

  // 路由切换的处理函数
  private handlePageChange(event: Event): void {
    try {
      if (this.isFirstLoad) return; // 首次加载时直接返回
      if (this.isPageNotChange()) {
        return;
      }
      // 暂存一次当前页面url作比对
      this.lastUrl = location?.href;
      if (!windowOrs.orsViewAttrs.viewId) {
        // 进入新页面的时候需要先上报一次之前页面的结束时间,计算停留时间
        // 避免新进入页面的时候，触发上报空数据
        return;
      }
      // 每次更新路由的时候,触发白屏检测，检测是否白屏
      eventBus.emit("pageChange", windowOrs.orsViewPage);
      /** 当前是否需要上报页面切换数据，如果需要的话，切换就调用接口上报，否则只更新数据 */
      const needReportPageChangeData = !!windowOrs.samplingConfig?.session;
      if (needReportPageChangeData) {
        // 初始化采集新页面的信息
        //updateViewEndTime和window._ors.orsViewPage是为了更新上一个页面的信息，比如停留时长
        this.updateViewEndTime();
        this.reportData([windowOrs.orsViewPage]);
        const performanceMgn = PerformanceManagement.getInstance();
        const viewAttr = this.initViewAttrs(event);
        performanceMgn.disconnectAllPerformanceCollect(
          (viewAttr as any).viewStartTime,
        );
        const performance = new PerformanceCollect({
          viewId: (viewAttr as any).viewId,
          pageType: "navigation",
          projectConfig: this.params,
        });
        performance.observePerformance({
          viewStartTime: (viewAttr as any).viewStartTime,
        });
        // 更新上报目标页面

        const viewInfo = this.getViewInfo(performance);
        this.reportData([viewInfo]);
      } else {
        // TODO 这里需要和后端沟通看如何才能做到上报页面消息，但是不作为具体的性能页面展示性能
        this.initViewAttrs(event);
        this.getViewInfo(); // 如果未命中采样率时，只更新view信息，不上报
      }
    } catch (error) {
      logReport("routeChangeListener", error);
    }
  }

  // 处理路由变化的监听
  private listenRouteChange(handler: EventListener) {
    try {
      // 先绑定 pushState和replaceState的监听
      history.pushState = this.bindEventListener("pushState");
      history.replaceState = this.bindEventListener("replaceState");

      //todo hash判断是否有问题？
      if (!window.location.hash) {
        // hash模式下
        window.addEventListener("hashchange", handler);
      } else {
        window.addEventListener("popstate", handler);
      }

      window.addEventListener("replaceState", handler);
      window.addEventListener("pushState", handler);
    } catch (error) {
      logReport("listenRouteChange", error);
    }
  }

  //判断url是否变化
  private isPageNotChange() {
    try {
      return location?.href === this.lastUrl;
    } catch (error) {
      logReport("isPageNotChange", error);
      return false;
    }
  }
  // 清理历史记录监听
  public removeListeners(): void {
    try {
      this.beforeUnloadHandler &&
        window.removeEventListener("beforeunload", this.beforeUnloadHandler);
      ["hashchange", "popstate", "pushState", "replaceState"].forEach(
        (event) => {
          this.routeChangeHandler &&
            window.removeEventListener(event, this.routeChangeHandler);
        },
      );
    } catch (error) {
      logReport("removeListeners", error);
    }
  }

  private bindEventListener(type: "pushState" | "replaceState") {
    try {
      const historyEvent = history[type];
      return function () {
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        const newEvent = historyEvent.apply(this, arguments);
        // 正常情况下：pushState,replaceState,popState,hashChange事件触发都会在url更新前，这就会导致parseUrlInfo取值URL会拿到旧的，数据对不上
        // 所以这里加上setTimeout异步延迟，会让监听函数在URL更新后触发，保证数据一致
        setTimeout(() => {
          const e = new Event(type);
          //@ts-ignore
          // eslint-disable-next-line prefer-rest-params
          e.arguments = arguments;
          window.dispatchEvent(e);
        }, 0);
        return newEvent;
      };
    } catch (error) {
      logReport("bindEventListener", error);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return function () {};
    }
  }

  getPathMatcherList() {
    return this._pathMatcherList;
  }

  reportViewData = (pathMatcher: AbstractPathMatcher) => {
    try {
      this._pathMatcherList.addPathMatcher(pathMatcher);
      const matcher = this.getPathMatcherList();
      const prevPageLoadViewInfoViewName = this.pageLoadViewInfo?.viewName;
      //同时更新3个对象的viewName，防止未匹配
      const needUpdateList = [
        this.pageLoadViewInfo,
        windowOrs.orsViewAttrs,
        windowOrs.orsViewPage,
      ];
      needUpdateList.forEach((item) => {
        if (!item) {
          return;
        }
        //取直接加载的数据进行匹配
        const pathname = getPathName(item.viewPath);

        const { pattern: viewName = "", name: viewPageTitle } =
          matcher?.matchPath?.(pathname) || {};
        if (viewName && viewName !== item.viewName) {
          const computedPageTile = viewPageTitle
            ? encodeURIComponent(viewPageTitle)
            : "";
          item.viewName = viewName;
          item.viewPageTitle = computedPageTile;
          this.updateViewEndTime(item);
        }
      });
      if (this.pageLoadViewInfo?.viewName !== prevPageLoadViewInfoViewName) {
        this.reportData([this.pageLoadViewInfo]);
      }
    } catch (error) {
      logReport("reportViewData", error);
    }
  };
}
