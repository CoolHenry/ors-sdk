import { logReport } from "@/config";
import { deviceInfo } from "@/utils/deviceInfo";
// 不支持的浏览器
export default function browserSupport(): boolean {
  try {
    let isSupport = true;
    // 不支持采集的浏览器列表
    const notBrowserList = ["Alipay"];
    if (notBrowserList.includes(deviceInfo.browser)) isSupport = false;
    return isSupport;
  } catch (error) {
    logReport("browserSupport", error);
    return true;
  }
}

export function getGlobalObject(): any {
  try {
    if (typeof globalThis !== "undefined") {
      return globalThis;
    }

    if (typeof self !== "undefined") {
      return self;
    }

    if (typeof window !== "undefined") {
      return window;
    }

    if (typeof global !== "undefined") {
      return global;
    }

    return {};
  } catch (error) {
    logReport("getGlobalObject", error);
  }
}
