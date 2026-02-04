import { IntegrationsParams } from "@/types/init";
export { default as Base } from "./collect/base";
export { generateOrGetSessionId } from "@/utils/sessionCalculate";
export type {
  SessionParams,
  ProjectInfoType,
  initObserveParams,
  UserAttrsInfo,
} from "@/types/init";
export type { MonitorDestroyReason } from "@/types/lifecycle";
export { default as ErrorBase } from "./collect/error/error";
export { logReport } from "@/config";
export { default as getRandomNumber } from "@/utils/getrandomNumber";
export { sdkLifeTimeEmitter } from "@/utils/mitt";
export { userInfoStore } from "@/store";
export { AbstractPathMatcher } from "@/collect/view/pathMatcher";
export { JSONstringify, Logger } from "@/utils/common";
export { windowOrs, setOrsGlobalObject, getOrsGlobalObject } from "@/store";
export * from "@/types/integrations";
export * from "@/integrations/export";
export {
  ORS_ERROR_RETHROW,
  ErrorCategoryEnum,
  ErrorLevelEnum,
} from "@/constant";
export * from "@/api";
export { getOrsIdMap } from "@/plugin/serviceObserve"; //添加ors的Id到ubs中
export {
  initObserve,
  initSubAppObserve,
  cleanupSubAppObserve,
  recordFMPTime,
} from "@/init";
import { integrationManager } from "@/integrations/utils";
export { updateConfig } from "@/config/samplingRate";

export const addIntegrations = (params: IntegrationsParams) =>
  integrationManager.add(params);
