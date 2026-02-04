import { logReport } from "@/config";
import { getVisibilityWatcher } from "./web-vitals/lib/getVisibilityWatcher";
import { JSONstringify } from "./common";

type FirstInputPolyfillEntry = Omit<PerformanceEventTiming, "processingEnd">;

type NavigationTimingPolyfillEntry = Omit<
  PerformanceNavigationTiming,
  | "initiatorType"
  | "nextHopProtocol"
  | "redirectCount"
  | "transferSize"
  | "encodedBodySize"
  | "decodedBodySize"
  | "type"
> & {
  type: PerformanceNavigationTiming["type"];
};
interface PerformanceEntryMap {
  event: PerformanceEventTiming[];
  paint: PerformancePaintTiming[];
  "layout-shift": LayoutShift[];
  "largest-contentful-paint": LargestContentfulPaint[];
  "first-input": PerformanceEventTiming[] | FirstInputPolyfillEntry[];
  navigation: PerformanceNavigationTiming[] | NavigationTimingPolyfillEntry[];
  resource: PerformanceResourceTiming[];
}

export const observe = <K extends keyof PerformanceEntryMap>(
  type: K,
  callback: (entries: PerformanceEntryMap[K]) => void,
  opts?: PerformanceObserverInit,
): PerformanceObserver | undefined => {
  try {
    if (PerformanceObserver?.supportedEntryTypes?.includes(type)) {
      const po = new PerformanceObserver((list) => {
        // Delay by a microtask to workaround a bug in Safari where the
        // callback is invoked immediately, rather than in a separate task.
        // See: https://github.com/GoogleChrome/web-vitals/issues/277
        Promise.resolve().then(() => {
          callback(list.getEntries() as PerformanceEntryMap[K]);
        });
      });
      po.observe(
        Object.assign(
          {
            type,
            buffered: true,
          },
          opts || {},
        ) as PerformanceObserverInit,
      );
      return po;
    }
    return;
  } catch (error) {
    logReport("observe", error);
    return;
  }
};

export const onFP = (
  cb: (arg0: { name: string; value: number | null }) => void,
): PerformanceObserver | undefined => {
  try {
    const visibilityWatcher = getVisibilityWatcher();
    const observer = observe("paint", (list) => {
      try {
        const entry = list.find((entry) => entry.name === "first-paint");
        if (entry && entry.startTime) {
          observer?.disconnect();
          if (entry.startTime < visibilityWatcher.firstHiddenTime) {
            cb({ name: "FP", value: entry.startTime });
          }
        }
      } catch (error) {
        logReport("onFPCallback", error);
        return;
      }
    });
    return observer;
  } catch (error) {
    logReport("onFP", error);
    return;
  }
};

/** 监听navigationTiming */
export const onNavigation = (
  cb: (arg0: { name: string; value: string }) => void,
) => {
  try {
    const observer = observe("navigation", (list) => {
      try {
        const entry = list?.[0];
        if (entry) {
          observer?.disconnect();
          cb({
            name: "navigationTiming",
            value: entry ? JSONstringify(entry) : "",
          });
        }
      } catch (error) {
        logReport("onNavigationCallback", error);
        const entry = window.performance?.getEntriesByType("navigation")?.[0];
        cb({
          name: "navigationTiming",
          value: entry ? JSONstringify(entry) : "",
        });
        return;
      }
    });
    return observer;
  } catch (error) {
    logReport("onNavigation", error);
    const entry = window.performance?.getEntriesByType("navigation")?.[0];
    cb({ name: "navigationTiming", value: entry ? JSONstringify(entry) : "" });
    return;
  }
};
export const isAllTrue = (...args: any[]) => {
  try {
    // 检查每个参数是否严格等于 true
    return args.every((arg) => typeof arg === "number" && arg > 0);
  } catch (error) {
    logReport("isAllTrue", error);
    return false;
  }
};
