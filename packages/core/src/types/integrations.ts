import { sdkIntegrationEmitter, sdkLifeTimeEmitter } from '@/utils/mitt';
import { SessionParams } from './init';
import { WindowOrsType } from './windowOrs';

export type OrsIntegrationType = {
  /** integration的名称，用于追踪报错信息 */
  name: string;
  /** integration初始化函数，可以获取到sdk的生命周期，以及是否是子应用等关键信息 */
  setup: (IntegrationSetupParams: OrsIntegrationSetupParams) => void;
  /** integration清理函数，用于清理一些资源，如监听事件等 */
  cleanup?: () => void;
  /** 取消errorHandler的监听事件 */
  cleanupErrorHandler?: () => void;
};

export type OrsIntegrationSetupParams = {
  /** sdk的生命周期 */
  sdkLifeTimeEmitter: typeof sdkLifeTimeEmitter;
  /** sdk集成的触发事件 */
  sdkIntegrationEmitter: typeof sdkIntegrationEmitter;
  /** 获取ors全局数据 */
  getOrsGlobalObject: () => WindowOrsType;
  /** 当前是否是子应用 */
  isSubApp: boolean;
  /** 会话相关的信息 */
  sessionInfo: SessionParams;
  subAppInfo?: {
    /** 项目名称 */
    name?: string;
    /** 项目版本 */
    version?: string;
    /** 项目Id,由项目自动生成 */
    projectId?: number;
  };
};

export type DedupeIntegrationParamsType = {
  /** 单位为ms
   * 默认策略为同一错误不会连续上报，
   * 如果配置此项，则调整为同一连续错误在throttleWait时间间隔内不重复上报，超过时间间隔同一连续错误仍会上报
   * 并且在throttleWait时间间隔内，如果连续上报，则只上报一次，不会重复上报
   * */
  throttleWait?: number;
  /** 单位为ms
   * 默认策略为同一错误不会连续上报，
   * 如果配置此项，则同一连续错误使用debounce策略进行上报
   * */
  debounceWait?: number;
};
