// 代替window存储对象，最后统一在构建时使用IIFE格式挂载在全局window下
import { WindowOrsType } from "@/types/windowOrs";
import type { ISampleData } from "@/types/init";
export const windowOrs: WindowOrsType = {
  samplingConfig: {} as ISampleData,
};
export const getOrsGlobalObject = () => windowOrs;

/** 覆盖全局windowOrs对象，outerWindowOrs 可能是子应用中通过外部传入 */
export const setOrsGlobalObject = (outerWindowOrs: typeof windowOrs) => {
  if (outerWindowOrs && typeof outerWindowOrs === "object") {
    Object.assign(windowOrs, outerWindowOrs);
  }
};
