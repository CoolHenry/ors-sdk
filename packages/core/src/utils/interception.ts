import { windowOrs } from "@/store";
import { SessionParams } from "@/types/init";
import { logReport, getEntity } from "@/config";

const selfReportPathName: string[] = [
  "/collector/v1/traces/rum",
  "/api/v2/configs/rum",
  "/collector/v1/logs/rum",
  "/collector/v2/logs/rum",
  "/collector/v1/data/web",
  "/collector/v2/traces/rum",
  "/collector/v2/traces/gzip/rum",
];
export const selfReportUrl = (params: SessionParams) => {
  return params
    ? selfReportPathName.map((pathname) => {
        return `${params.server || getEntity(params.entity)}${pathname}`;
      })
    : [];
};
// 判断资源是否在黑名单中
export const isResourceBlacklisted = (url: string): boolean => {
  try {
    const { blResUrl } = windowOrs.samplingConfig;
    return blResUrl
      ? blResUrl?.length > 0 &&
          blResUrl.some((item: string) => url.includes(item))
      : false;
  } catch (error) {
    logReport("isResourceBlacklisted", error);
    return false;
  }
};

export const urlIncludes = (
  entryName: string | undefined,
  params?: SessionParams,
): boolean => {
  try {
    const orsReportUrl = params && selfReportUrl(params);
    let target = entryName && entryName.trim();
    if (target && target.endsWith("/")) target = target.slice(0, -1);
    return !!(!!target && orsReportUrl && orsReportUrl.includes(target));
  } catch (error) {
    logReport("urlIncludes", error);
    return false;
  }
};

/** 是否应该上报过滤 */
export const needSkipUrlCollect = (
  url: string | undefined,
  params?: SessionParams,
): boolean => {
  try {
    const skipUrl = url && url.match(/^https?:\/\/[^/]+\/[^?]+/)?.[0];
    return skipUrl
      ? urlIncludes(skipUrl, params) || isResourceBlacklisted(skipUrl)
      : false;
  } catch (error) {
    logReport("needSkipUrlCollect", error);
    return false;
  }
};
