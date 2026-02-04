import Base from "../base";
import getrandomNumber from "@/utils/getrandomNumber";
import highTime from "@/utils/highTime";
import { logReport } from "@/config";
import { userInfoStore, windowOrs } from "@/store";
import type {
  SessionInfosType,
  ViewAttrsType,
  UserAttrsInfo,
  SessionParams,
  LongTaskEventType,
  LongTaskType,
  AttributesType,
  LongTaskLoadProcessType,
} from "@/types/init";
import { MonitorDestroyReason } from "@/types/lifecycle";
import timeTranslate from "@/utils/timeTranslate";
import { sdkLifeTimeEmitter } from "@/utils/mitt";

interface PerformanceEntry {
  readonly duration: number;
  readonly entryType: string;
  readonly name: string;
  readonly startTime: number;
  toJSON(): Record<string, unknown>;
}

interface PerformanceScriptTiming extends PerformanceEntry {
  sourceURL: string;
  sourceFunctionName: string;
  sourceCharPosition: number;
  invoker: string;
  invokerType: string;
}
export interface PerformanceLongAnimationFrameTiming extends PerformanceEntry {
  scripts: PerformanceScriptTiming[];
}

export class LongTaskCollect extends Base {
  private longTaskObserver: PerformanceObserver | null = null;
  constructor(params: SessionParams) {
    super(params);
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
  initLongAnimationFrameObserver() {
    if (
      !PerformanceObserver ||
      !PerformanceObserver.supportedEntryTypes?.includes("long-animation-frame")
    ) {
      return;
    }
    this.longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceLongAnimationFrameTiming[]) {
        if (!entry?.scripts?.[0]) {
          continue;
        }
        this.reportLongTask(entry as PerformanceLongAnimationFrameTiming);
      }
    });

    try {
      this.longTaskObserver.observe({
        type: "long-animation-frame",
        buffered: true,
      });
    } catch (e) {
      this.longTaskObserver.observe({ entryTypes: ["long-animation-frame"] });
    }
  }
  // 销毁长任务监控
  public destroyListenter() {
    try {
      this.longTaskObserver?.disconnect();
    } catch (error) {
      logReport("destroyLongTaskListenter", error);
    }
  }
  /**
   *
   * @param longTask
   * longTask枚举值
   */
  reportLongTask(entry: PerformanceLongAnimationFrameTiming) {
    try {
      const name = entry?.name;
      const duration = timeTranslate(entry?.duration);
      const startTime = highTime(performance.timeOrigin + entry?.startTime);
      const endTime = highTime(
        performance.timeOrigin + entry?.startTime + entry?.duration,
      );
      const attributes = {} as AttributesType;
      const initialScript = entry.scripts[0];
      const {
        invoker,
        invokerType,
        sourceURL,
        sourceFunctionName,
        sourceCharPosition,
      } = initialScript;
      attributes["invoker"] = invoker;
      attributes["invokerType"] = invokerType;
      if (sourceURL) {
        attributes["sourceURL"] = sourceURL;
      }
      if (sourceFunctionName) {
        attributes["sourceFunctionName"] = sourceFunctionName;
      }
      if (sourceCharPosition !== -1) {
        attributes["sourceCharPosition"] = sourceCharPosition;
      }
      const loadProcess: LongTaskLoadProcessType = {
        [entry?.name]: {
          duration,
          startTime,
          endTime,
        },
      };
      const userInfo: UserAttrsInfo = userInfoStore.get() as UserAttrsInfo;
      const sessionInfo: SessionInfosType = this.getSessionInfo();
      const viewAttrs: ViewAttrsType = windowOrs.orsViewAttrs;
      const LongTaskEvent: LongTaskEventType = {
        rumType: "ors_longtask",
        name,
        duration,
        loadProcess,
        attributes,
        sessionType: "user",
        id: getrandomNumber(32),
        longtaskStartTime: startTime,
        longtaskEndTime: endTime,
      };
      const collectData: LongTaskType = {
        ...LongTaskEvent,
        ...userInfo,
        ...viewAttrs,
        ...sessionInfo,
        ...this.actionInfo(),
      };
      this.reportData([collectData]);
    } catch (error) {
      logReport("reportLongTask", error);
    }
  }
}
