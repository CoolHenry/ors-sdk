import type {
  DedupeIntegrationParamsType,
  OrsIntegrationType,
} from "./integrations";
import type { PageLoadVitalsData, NavigationVitalsData } from "./performance";
import { CONSOLE_LEVEL } from "@/constant";
import type { Extras } from "@/types/scope";
import type { Mechanism } from "@/types/error";

export interface ISamplingRate {
  rumType: string;
  value: string;
}

export type SamplingEventStatusType = "unready" | "report" | "drop";

export type SamplingType =
  | "sessionRate"
  | "viewRate"
  | "actionRate"
  | "consoleRate"
  | "traceRate"
  | "resNorRate"
  | "resErrRate"
  | "logRepRate";

// 动态类型
export type SamplingRandomKey = `${SamplingType}Random`;

// 动态类型
type ISampleRandomData = {
  [K in `${SamplingRandomKey}`]?: number;
};

interface ISampleOriginData {
  view: boolean;
  viewRate: number;
  action: boolean;
  actionRate: number;
  console: boolean;
  consoleRate: number;
  session: boolean;
  sessionRate: number;
  longtask: boolean;
  logRepRate: number;
  jsError: boolean;
  logRep: boolean;
  resource: boolean;
  resourceRate: number;
  resNorRate: number;
  resErrRate: number;
  trace: boolean;
  traceRate: number;
  blResUrl?: string[];
  blJsErrMsg?: string[];
  featureFlags?: {
    sdkGzipSwitch?: "A" | "B";
  };
}

// 合并两个类型
export type ISampleData = ISampleOriginData & ISampleRandomData;

export interface pluginsBlankScreenType {
  autoDetect: boolean;
  rootSelector: string[]; // 根元素选择器
}

export interface pluginsType {
  blankScreen: pluginsBlankScreenType;
}

export interface initObserveParams {
  /** 项目名称 */
  name?: string;
  /** 项目版本 */
  version: string;
  /** 项目Id,由项目自动生成 */
  projectId: number | string;
  /**上报主体 马消or镜花缘 */
  entity?: "mx" | "jhy";
  /** 上报到平台域名 马消or镜花缘 生产or测试*/
  server?: string;
  /** 插件 */
  plugins?: pluginsType;
  /** 忽略上报的错误摘要 */
  ignoreErrors?: (string | RegExp)[];
  /** 原生端appId */
  appId?: string;
  /** 原生端accessNo */
  accessNo?: string;
  /** 操作系统 */
  osName?: string;
  /** 设置为false会关闭默认集成，也可以自己指定默认集成 */
  defaultIntegrations?: false | OrsIntegrationType[];
  /** 可以调整默认集成的参数配置 */
  defaultIntegrationProps?: {
    dedupe?: DedupeIntegrationParamsType;
  };
  /** 集成配置， 如果传入函数，则入参为默认集成数组，返回值将作为最终集成， 如果传入列表则将和默认集成合并作为最终集成列表 */
  integrations?:
    | OrsIntegrationType[]
    | ((defaultIntegrations: OrsIntegrationType[]) => OrsIntegrationType[]);
  /** 是否输出日志 */
  debug?: boolean;
  /** 上报前的数据处理函数，返回null时此条数据不会上报，注意根据 rumType区分数据类型 */
  beforeSend?: (data: CollectStoreType) => CollectStoreType | null;
}

export type IntegrationsParams = Partial<
  Pick<
    initObserveParams,
    "defaultIntegrations" | "defaultIntegrationProps" | "integrations"
  >
>;

export interface initSubAppParams {
  /** 项目名称 */
  name?: string;
  /** 项目版本 */
  version?: string;
  /** 项目Id,由项目自动生成 */
  projectId?: number;
  integrations?: OrsIntegrationType[];
}

export type SessionParams = Omit<
  initObserveParams,
  "plugins" | "integrations" | "debug"
> & { sessionInfo?: SessionInfosType };

// 初始化配置项的ts类型定义
interface SessionInfo {
  sessionId: string;
  sessionStartTime: number;
}

export interface UserAttrsInfo {
  isSign: number;
  userId: string;
  userEmail: string;
}

interface OrsDataInfo {
  sessionInfo: SessionInfo;
  FMPTime: string;
  actionId: string;
  resourceErrorList: string[]; // 加载资源错误url的资源列表
  resErrorList: string[];
}

interface OrsViewPage {
  [key: string]: any;
}

interface OrsViewAttrs {
  [key: string]: any;
}

interface SamplingConfig {
  [key: string]: any;
}

interface ConfigData {
  isSampling: boolean; // 采样率
}

interface ExtraConfig {
  errorCount: number; // 自身错误次数
}

interface Plugins {
  blankScreen: {
    autoDetect: boolean; // 白屏的自动检测
    rootSelector: string[]; // 根元素选择器
  };
}

interface UbsData {
  scenes: string;
}

interface CustomInfo {
  [key: string]: any;
}

export interface InitConfigData {
  sdkVersion: string;
  isInit: boolean; // sdk是否执行初始化
  orsDataInfo: OrsDataInfo;
  orsViewPage: OrsViewPage;
  orsViewAttrs: OrsViewAttrs;
  samplingConfig: SamplingConfig;
  configData: ConfigData;
  extraConfig: ExtraConfig;
  plugins: Plugins;
  ubsData: UbsData;
  customInfo: CustomInfo;
  nativeData: null | any;
  integrations: any;
}

export interface RouterMatchType {
  pattern: string;
  name: string;
}

export interface ActionIdType {
  actionId: string;
}

export interface ViewAttrsType {
  viewId: string;
  viewType: string;
  viewSubType: "navigation" | "pageload";
  viewReferrer: string;
  viewUrl: string;
  viewHost: string;
  viewPath: string;
  viewName: string;
  viewPageTitle: string;
  viewPathGroup: string;
  viewQuery: string;
  viewEventType: string;
  viewStartTime: number;
  viewEndTime: number;
}

export interface ViewEventType {
  rumType: "ors_view";
  sessionType: string;
  spentDuration: number;
  FMP: number;
}
export type ViewInfoBaseType = ViewEventType &
  ViewAttrsType &
  UserAttrsInfo &
  SessionInfosType &
  ActionIdType;

export type ViewInfoType =
  | (ViewInfoBaseType & PageLoadVitalsData)
  | (ViewInfoBaseType & NavigationVitalsData);

export interface CollectStoreConfigType {
  collectStoreLimit: number;
}

export interface ActionEventType {
  actionId: string;
  rumType: "ors_action";
  type: string;
  sessionType: string;
  name: string | null;
  duration: number | null;
  actionStartTime: number;
  actionEndTime: number;
}

export interface SessionInfosType {
  sessionStartTime: number;
  sessionId: string;
}

export type ActionInfoType = ActionEventType &
  UserAttrsInfo &
  SessionInfosType &
  ViewAttrsType;

export interface AttributesType {
  invoker: string;
  invokerType: string;
  sourceURL: string;
  sourceFunctionName: string;
  sourceCharPosition: number;
}

interface ProcessInfo {
  duration: number | null; // 假设 duration 是数字类型
  startTime: number; // 根据实际时间格式调整
  endTime: number; // 根据实际时间格式调整
}

export type LongTaskLoadProcessType = {
  [key: string]: ProcessInfo;
};

export interface LongTaskEventType {
  rumType: "ors_longtask";
  name: string | null;
  duration: number | null;
  id: string;
  loadProcess: LongTaskLoadProcessType;
  attributes: AttributesType;
  sessionType: string;
  longtaskStartTime: number;
  longtaskEndTime: number;
}

export type LongTaskType = LongTaskEventType &
  UserAttrsInfo &
  SessionInfosType &
  ViewAttrsType &
  ActionIdType;

export interface ResourceAndRequestEventType {
  rumType: string;
  id: string;
  url: string;
  host: string;
  path: string;
  query: string;
  protocol: string;
  type: string;
  method: string;
  status: number;
  transferSize: number;
  size: number;
  dns: number | null;
  tcp: number | null;
  ssl: number | null;
  ttfb: number | null;
  trans: number | null;
  firstbyte: number | null;
  loadType: string;
  duration: number | null;
  request: number | null;
  response: number | null;
  cache: number | null;
  redirect: number | null;
  netType: string;
  nextHopProtocol: string | null;
  sessionType: string;
  resourceStartTime: number;
  resourceEndTime: number;
  resourceTiming: PerformanceResourceTiming;
  scenes?: string;
}

export type ResourceAndRequestInfoType = ResourceAndRequestEventType &
  UserAttrsInfo &
  SessionInfosType &
  ViewAttrsType &
  ActionIdType;

export interface ConsoleEventType {
  rumType: "ors_console";
  id: string;
  level: string;
  args: any[];
  startTime: number;
  endTime: number;
}

export type ConsoleInfoType = ConsoleEventType &
  UserAttrsInfo &
  SessionInfosType &
  ViewAttrsType &
  ActionIdType;

interface BaseErrorEventType {
  id: string;
  rumType: "ors_error";
  type: "blank_screen" | "js";
  subtype: string;
  mechanism: Mechanism;
  msg: string;
  source: "network" | "js";
  errorObj: string | undefined;
  catId: string;
  sessionType: "user";
  filename: string;
  componentName?: string;
  orsCompMark?: string;
  scenes?: string;
  projectInfo?: ProjectInfoType;
}

export interface JsErrorEventType extends BaseErrorEventType {
  type: "js";
}

export type JsErrorInfoType = JsErrorEventType &
  UserAttrsInfo &
  SessionInfosType &
  ViewAttrsType &
  ActionIdType &
  Extras;

export interface BlankScreenErrorEventType extends BaseErrorEventType {
  type: "blank_screen";
  reasonId?: string;
  resourceUrl?: string;
  resourceMethod?: string;
  resourceStatus?: number;
}

export type BlankScreenErrorInfoType = BlankScreenErrorEventType &
  UserAttrsInfo &
  SessionInfosType &
  ViewAttrsType &
  ActionIdType;

type JsErrorInfoTypeProject =
  | JsErrorInfoType
  | (JsErrorInfoType & ProjectInfoType);
// 采集store类型
export type CollectStoreType =
  | ActionInfoType
  | ConsoleInfoType
  | LongTaskType
  | ResourceAndRequestInfoType
  | ViewInfoType
  | JsErrorInfoTypeProject
  | BlankScreenErrorInfoType;

export const isJsErrorWithProject = (
  item: CollectStoreType,
): item is JsErrorInfoType & ProjectInfoType => {
  return (
    item.rumType === "ors_error" &&
    item.type === "js" &&
    "projectInfo" in item &&
    !!item.projectInfo?.projectId
  );
};

export interface SamplingManagerDecideParamsType {
  rumType: "ors_view" | "ors_action" | "ors_resource" | "ors_console";
}

export interface whiteScreenMonitorParamsType {
  errorInfo?: JsErrorInfoType;
  projectInfo?: ProjectInfoType | undefined;
}

/** 通过integrations方式补充的项目相关信息 */
export type ProjectInfoType = {
  projectId: number | string;
  version: string;
  name?: string;
};
export interface InitLogType {
  debug: boolean | undefined;
}

/** rousource fetch数据类型 */
export interface FetchInfoType {
  url: string;
  method: string;
  status: number;
}

/**alias base type */
export interface AliasBaseType {
  appId: string;
  name: string;
  projectName: string;
  projectVersion: string;
  version: string;
  sdkName: string;
  sdkVersion: string;
  osName: string;
  osVersion: string;
  osVersionMajor: string;
  networkType: string;
  deviceId: string;
  deviceScreen: string;
  browser: string;
  browserVersion: string;
  browserVersionMajor: string;
  orsSdkVersion: string;
  webviewId: string;
  webviewStartTime: string;
  deviceModel: string;
  instanceId: string;
  createTime: string;
  customTags: string;
  userAgent: string;
}

export interface RequestItem {
  url: string;
  method: string;
  status: number;
  responseBodySize: number | null;
}
// 在使用时，定义联合类型
export type ConsoleLevelType = (typeof CONSOLE_LEVEL)[number];

export interface XhrConfigResponse {
  data: ISampleData;
  code: number;
  msg: string;
}
