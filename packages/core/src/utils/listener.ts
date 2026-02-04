import { logReport } from "@/config";
import { SessionParams } from "@/export";
import { CollectStore } from "@/store";
import { deviceInfo } from "@/utils/deviceInfo";
import { ReportClient } from "@/report/reportClient";
let hasEnteredVisible = false;
const sdkStartTIme = Date.now();
export const initUnloadListener = (sessionParams: SessionParams) => {
  try {
    ["beforeunload", "unload", "pagehide"].forEach((e) => {
      // 监听页面卸载事件
      window.addEventListener(e, handleUnload.bind(undefined, sessionParams));
    });
    document.addEventListener("visibilitychange", () => {
      const state = document.visibilityState;
      if (!hasEnteredVisible && state === "visible") {
        hasEnteredVisible = true;
        return;
      }
      if (hasEnteredVisible && state === "hidden") {
        // 监听页面卸载事件
        handleUnload(sessionParams);
      }
    });
  } catch (error) {
    logReport("initUnloadListener", error);
  }
};
const handleUnload = (sessionParams: SessionParams) => {
  try {
    if (Date.now() - sdkStartTIme < 300) {
      return;
    }
    const reportClient = ReportClient.getInstance({
      sessionParams,
      webGroupId: sessionParams.projectId,
      server: sessionParams.server,
      entity: sessionParams.entity,
    });

    const reportData = CollectStore.get();
    const { browser, browserVersionMajor } = deviceInfo;
    // 由于chrome低于81版本，出于安全策略方式不允许sendBeacon发送pb流格式数据
    const isNotSupportBeaconSendPbType =
      browser === "Chrome" && Number(browserVersionMajor) < 81;
    if (reportData.length) {
      // 强制清空数据（即使上报失败）
      CollectStore.clear();
      // 尝试用 Beacon 上报
      const success = isNotSupportBeaconSendPbType
        ? false
        : reportClient.sendBeaconData(reportData);
      // 如果 Beacon 失败，降级到同步 XHR
      if (!success) {
        reportClient.sendData(reportData);
      }
    }
  } catch (error) {
    logReport("handleUnload", error);
  }
};
