import ViewCollect from "@/collect/view";
import { PathMatcherList } from "@/collect/view/pathMatcherList";
import { AbstractPathMatcher, windowOrs } from "@/export";
import {
  JsErrorInfoType,
  ISampleData,
  SessionParams,
  initObserveParams,
} from "@/types/init";
import { MonitorDestroyReason } from "@/types/lifecycle";
import mitt from "mitt";

type SdkLifeTimeEventsType = {
  /** 初始化采集时，执行配置接口请求前 */
  initCollect: SessionParams;
  /** 读取完接口的配置信息 */
  configRequestFinished: ISampleData;
  /** 初始化各类监听器之前执行 */
  beforeInitMonitor: SessionParams;
  /** 初始化监听器时，成功命中jsError采样率 */
  matchJsErrorSampling: SessionParams;
  /** 初始化视图收集之前执行 */
  beforeInitViewCollect: ViewCollect;
  /** 初始化PathMatcherList之前执行 */
  initPathMatcherList: PathMatcherList;
  /** 单个错误上报时触发，此生命周期会多次触发，可以拿到与错误相关的完整信息，直接修改会影响上报的错误信息逻辑 */
  reportError: JsErrorInfoType;
  /** initObserve执行完毕 */
  initObserveFinished?: typeof windowOrs;
  /** 销毁监听 */
  monitorDestroy: MonitorDestroyReason;
};

type SdkLifeTimeUpdateEventsType = {
  /** 更新配置接口 */
  updateConfigRequest: initObserveParams;
};

type SdkIntegrationEventsType = {
  /** ViewCollect新增一个pathMatcher，可用于子应用集成 */
  addPathMatcher: AbstractPathMatcher;
  /** ViewCollect删除pathMatcher，可用于子应用卸载时去除 */
  removePathMatcher: AbstractPathMatcher;
  /** 增量集成 */
  addIntegrations: SessionParams;
  /** 增量添加路由匹配pathMatcher*/
  addPathMatcherList: unknown;
};

/** ors-sdk主动抛出执行中的处理事件，集成可以监听相关事件  */
export const sdkLifeTimeEmitter = mitt<SdkLifeTimeEventsType>();

/** ors-sdk 主动监听特定事件，便于集成中通过触发消息来改变sdk的默认行为 */
export const sdkIntegrationEmitter = mitt<SdkIntegrationEventsType>();

/** ors-sdk 生命周期中存在更新事件，便于集成中通过触发消息来改变sdk的默认行为 */
export const sdkLifeTimeUpdateEmitter = mitt<SdkLifeTimeUpdateEventsType>();
