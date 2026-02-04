import Base from "../base";
import { onCLS, onINP, onFID, onLCP, onTTFB, onFCP } from "web-vitals";
import timeTranslate from "@/utils/timeTranslate";
import { onFP, onNavigation, htmlTreeAsString } from "@/utils";
import { windowOrs } from "@/store";
import { logReport } from "@/config";
import type {
  PageLoadVitalsData,
  NavigationVitalsData,
  PerformanceInitParams,
  ObservePerformanceOptions,
  VitalsName,
} from "@/types/performance";
import { MonitorDestroyReason } from "@/types/lifecycle";
import { Logger } from "@/utils/common";
import { PerformanceManagement } from "./management";
import { getViewInfo } from "@/store/viewInfoStore";
import { sdkLifeTimeEmitter } from "@/utils/mitt";

export default class PerformanceCollect extends Base {
  pageType: PerformanceInitParams["pageType"];
  viewId: PerformanceInitParams["viewId"];
  projectConfig: PerformanceInitParams["projectConfig"];
  navigationVitalsData: NavigationVitalsData;
  pageLoadVitalsData: PageLoadVitalsData;
  //当前这个性能指标监控是否未卸载
  private _isConnected: boolean;
  // 初始化监听后，可以记录下来，用于卸载的时候，清除所有的监听
  private _observeList: PerformanceObserver[] = [];
  private _disconnectTimer: NodeJS.Timeout | undefined;
  private _listenStartTime: number | undefined = undefined;
  private _listenEndTime: number | undefined = undefined;

  constructor(params: PerformanceInitParams) {
    const { pageType, viewId, projectConfig } = params;
    super(projectConfig);
    this.pageType = pageType;
    this.viewId = viewId;
    this.projectConfig = projectConfig;
    this._isConnected = true;
    this.navigationVitalsData = {
      FID: null,
      CLS: null,
      INP: null,
    };
    this.pageLoadVitalsData = {
      FP: null,
      FCP: null,
      LCP: null,
      TTFB: null,
      lcpElement: null,
      lcpId: null,
      lcpUrl: null,
      lcpLoadTime: null,
      lcpRenderTime: null,
      lcpSize: null,
      clsSource: null,
      inpEventType: null,
      inpElement: null,
      inpId: null,
      inpClassName: null,
      inpSrc: null,
      inpTextSnippet: null,
      perfromanceTimeOrigin: null,
      navigationTiming: null,
      perfromanceTiming: null,
      ...this.navigationVitalsData,
    };
    const performanceMgn = PerformanceManagement.getInstance();
    performanceMgn.addPerformanceCollect(this);
    this.monitorDestroy();
  }
  private monitorDestroy() {
    sdkLifeTimeEmitter.on("monitorDestroy", (reason: MonitorDestroyReason) => {
      switch (reason) {
        case "sdk:teardown":
          this.innerDisconnect();
          break;
        default:
          break;
      }
    });
  }
  //获取页面加载指标
  public getMetrics() {
    try {
      if (this.pageType === "pageload") {
        this.pageLoadVitalsData.perfromanceTimeOrigin = performance.timeOrigin;
        this.pageLoadVitalsData.navigationTiming =
          window.performance?.getEntriesByType("navigation")?.[0];
        this.pageLoadVitalsData.perfromanceTiming = performance.timing;
        return this.pageLoadVitalsData;
      }
      return this.navigationVitalsData;
    } catch (error) {
      logReport("getPageloadMetrics", error);
      return {};
    }
  }
  private checkIsNavigationMeticsKey(name: string) {
    return ["FID", "CLS", "INP"].includes(name);
  }
  // 监听web-vitails数据回调
  private observeVitals = (options: {
    [x: string]: any;
    name: string;
    value: number | string | null;
  }): any => {
    try {
      if (!this._isConnected) {
        return;
      }
      const name = options.name as VitalsName;
      const value = options.value;

      if (value === null) {
        return;
      }

      const vitalsStartTime =
        performance.timeOrigin + options?.entries?.[0]?.startTime;
      const vitalsStartTimeNs = vitalsStartTime * 1000 * 1000;
      if (vitalsStartTime && this.checkIsNavigationMeticsKey(name)) {
        if (this._listenEndTime && vitalsStartTimeNs > this._listenEndTime) {
          return;
        }
        if (
          this._listenStartTime &&
          vitalsStartTimeNs < this._listenStartTime
        ) {
          return;
        }
      }
      if (options && name) {
        Logger.log("[log][webVitals]:", options, name, value);
        const allowedNames = [
          "FP",
          "FCP",
          "LCP",
          "INP",
          "FID",
          "CLS",
          "TTFB",
        ] as VitalsName[];
        // cls行业基线是<0.1。质量分不做转换
        const optionsValue = allowedNames.includes(name)
          ? name === "CLS"
            ? parseFloat(Number(value).toFixed(2))
            : timeTranslate(Number(value))
          : value;
        //更新指标对象
        const baseObj =
          this.pageType === "navigation"
            ? this.navigationVitalsData
            : this.pageLoadVitalsData;
        (baseObj as Record<string, any>)[name] = optionsValue;

        //获取LCP，INP元素
        this.getSelector(options, baseObj);

        //获取vitailsViewPage并上报
        const vitailsViewPage = getViewInfo(this.viewId);
        if (!vitailsViewPage) {
          return;
        }
        (vitailsViewPage as Record<string, any>)[name] = optionsValue;
        //获取LCP，INP元素
        this.getSelector(options, vitailsViewPage);

        const needReportData = !!windowOrs.samplingConfig?.session;
        if (needReportData) {
          this.reportData([{ ...vitailsViewPage }]);
        }
      }
    } catch (error) {
      logReport("observeVitals", error);
    }
  };

  /** 获取 LCP、INP 相关的 DOM 元素信息，并更新到 pageLoadVitalsData 中 */
  private getSelector = (options: any, targetMetrics: any): void => {
    try {
      if (!options?.entries) return;

      if (options.name === "LCP") {
        this.extractLCPInfo(options, targetMetrics);
      } else if (options.name === "INP") {
        this.extractINPInfo(options, targetMetrics);
      } else if (options.name === "CLS") {
        this.extractCLSInfo(options, targetMetrics);
      }
    } catch (error) {
      logReport("getSelector", error);
    }
  };

  /** 提取 LCP 相关元素信息 */
  private extractLCPInfo = (options: any, targetMetrics: any): void => {
    try {
      const entries = options.entries;
      if (!Array.isArray(entries) || entries.length === 0) return;

      const entry = entries[entries.length - 1]; // 最大元素
      if (entry?.element) {
        targetMetrics.lcpElement = htmlTreeAsString(entry?.element);
      }
      if (entry?.id) {
        targetMetrics.lcpId = entry?.id;
      }
      if (entry?.url) {
        // Trim URL to the first 200 characters.
        targetMetrics.lcpUrl = entry?.url.trim().slice(0, 200);
      }
      if (entry?.loadTime != null) {
        // loadTime is the time of LCP that's related to receiving the LCP element response..
        targetMetrics.lcpLoadTime = entry?.loadTime;
      }
      if (entry?.renderTime != null) {
        // renderTime is loadTime + rendering time
        // it's 0 if the LCP element is loaded from a 3rd party origin that doesn't send the
        // `Timing-Allow-Origin` header.
        targetMetrics.lcpRenderTime = entry?.renderTime;
      }
      targetMetrics.lcpSize = entry?.size;
    } catch (e) {
      logReport("extractLCPInfo", e);
    }
  };

  /** 提取 INP 相关交互元素信息 */
  private extractINPInfo = (options: any, targetMetrics: any): void => {
    try {
      const entries = options.entries;
      if (!Array.isArray(entries) || entries.length === 0) return;

      const entry = entries[0]; // 通常取第一个用户交互
      const target = entry?.target;
      if (entry?.name) {
        targetMetrics.inpEventType = entry.name;
      }
      if (entry?.target) {
        targetMetrics.inpElement = htmlTreeAsString(entry?.target);
      }
      if (target?.id) {
        targetMetrics.inpId = target.id;
      }
      if (target?.className) {
        targetMetrics.inpClassName = target.className;
      }
      if (target?.src) {
        targetMetrics.inpSrc = target.src || null;
      }
      if (target?.innerText) {
        targetMetrics.inpTextSnippet = target.innerText?.slice(0, 50) || null;
      }
    } catch (e) {
      logReport("extractINPInfo", e);
    }
  };

  /** 提取 CLS 相关元素信息 */
  private extractCLSInfo = (options: any, targetMetrics: any): void => {
    try {
      const entries = options.entries;
      if (!Array.isArray(entries) || entries.length === 0) return;

      const _clsEntry = entries[0]; // 通常取第一个用户交互
      // Only add CLS attributes if CLS is being recorded on the pageload span
      if (_clsEntry?.sources) {
        const clsSource = _clsEntry.sources
          .map((source: { node: unknown }) => htmlTreeAsString(source.node))
          ?.join(",");
        targetMetrics.clsSource = clsSource;
      }
    } catch (e) {
      logReport("extractCLSInfo", e);
    }
  };

  observePerformance = ({ viewStartTime }: ObservePerformanceOptions = {}) => {
    try {
      if (this.pageType === "pageload") {
        const fpObserver = onFP(this.observeVitals);
        const navigationObserver = onNavigation(this.observeVitals);
        if (fpObserver) {
          this._observeList.push(fpObserver);
        }
        if (navigationObserver) {
          this._observeList.push(navigationObserver);
        }
        onFCP(this.observeVitals, { reportAllChanges: true });
        onLCP(this.observeVitals, { reportAllChanges: true });
        onFID(this.observeVitals, { reportAllChanges: true });
        onTTFB(this.observeVitals, { reportAllChanges: true });
        onCLS(this.observeVitals, { reportAllChanges: true });
        onINP(this.observeVitals, { reportAllChanges: true });
      }
      if (this.pageType === "navigation") {
        //navigation才区分上报到哪个页面
        if (viewStartTime) {
          this._listenStartTime = viewStartTime;
        }
        onCLS(this.observeVitals, { reportAllChanges: true });
        onFID(this.observeVitals, { reportAllChanges: true });
        onINP(this.observeVitals, { reportAllChanges: true });
      }
    } catch (error) {
      logReport("observePerformance", error);
    }
  };

  public innerDisconnect() {
    try {
      //不再执行回调
      this._isConnected = false;
      if (this._observeList) {
        this._observeList.forEach((item) => {
          if (item && typeof item.disconnect === "function") {
            item.disconnect();
          }
        });
      }
      const performanceMgn = PerformanceManagement.getInstance();
      performanceMgn.removePerformanceCollect(this);
    } catch (err) {
      logReport("Performance innerDisconnect", err);
    }
  }

  disconnect(endTime?: number) {
    try {
      if (this._disconnectTimer) {
        return;
      }
      //navigation才区分    上报到哪个页面
      this._listenEndTime = endTime;
      if (this.pageType === "pageload") {
        this._disconnectTimer = setTimeout(() => {
          this.innerDisconnect();
        }, 5000);
      }
      if (this.pageType === "navigation") {
        this._disconnectTimer = setTimeout(() => {
          this.innerDisconnect();
        }, 500);
      }
    } catch (err) {
      logReport("Performance disconnect", err);
    }
  }
}
