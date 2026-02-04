/**
 * 通过 Navigator 发送信息
 */
import { logReport } from "@/config";
import isSupportBeaconSend from "@/utils/isSupportBeaconSend";
export default class ByNavigator {
  toReport(url: string | URL, data: Record<string, any>) {
    try {
      if (isSupportBeaconSend()) {
        return navigator.sendBeacon(url, JSON.stringify(data));
      } else {
        return false;
      }
    } catch (error) {
      logReport("ByNavigator", error);
      return false;
    }
  }
}
