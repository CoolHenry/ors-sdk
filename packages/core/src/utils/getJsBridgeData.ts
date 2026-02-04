import pkg from '../../package.json';
import { logReport } from '@/config';
import { isFunction } from '@/utils/isType';
import { userInfoStore, windowOrs } from '@/store';
export function getBridgeData() {
  try {
    if (window.MDPWebViewJavascriptBridge) {
      let nativeInfo = null;
      if (isFunction(window.MDPWebViewJavascriptBridge.nativeInfo)) {
        // android的获取方式
        nativeInfo = JSON.parse(window.MDPWebViewJavascriptBridge?.nativeInfo() || '{}');
      } else {
        // ios的获取方式
        nativeInfo = window.MDPWebViewJavascriptBridge?.nativeInfo;
        window.MDPWebViewJavascriptBridge.sdkInfo = {
          sdkName: 'ors_web',
          sdkVersion: pkg.version,
        };
      }
      windowOrs.nativeData = nativeInfo;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      userInfoStore.set('userId', nativeInfo?.userId || '');
    }
  } catch (error) {
    logReport('getBridgeData', error);
  }
}
