import { samplingComputed } from '@/utils/samplingComputed';
import getrandomNumber from '@/utils/getrandomNumber';
import { deviceInfo } from '@/utils/deviceInfo';
import { getEntity } from '@/config/mapping';
import { windowOrs } from '@/store';
import { Logger } from '@/utils/common';
import tryGzip from '@/utils/gzip';
import pkg from '../../package.json';
import { SamplingType, XhrConfigResponse } from '@/types/init';
import { sdkLifeTimeEmitter } from '@/utils/mitt';

export class ByXHR {
  private retryAfterEnd: number;
  constructor() {
    this.retryAfterEnd = 0;
  }

  private buildRequestUrl(urlPath: string, accessNo?: string, webGroupId?: string | number) {
    return `${urlPath}?accessNo=${accessNo || webGroupId}&webGroupId=${webGroupId}`;
  }

  toReport(arg: { url: string; gzipUrl?: string; data?: Record<string, any>; accessNo?: string; webGroupId?: string | number }) {
    try {
      const { url, gzipUrl, data, accessNo, webGroupId } = arg ?? {};

      if (Date.now() < this.retryAfterEnd) {
        return;
      }
      const xhr = new XMLHttpRequest();
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;

      let finalGzip = false;
      let sendData: string | Uint8Array = '';
      if (data) {
        if (gzipUrl) {
          ({ data: sendData, gzip: finalGzip } = tryGzip(data));
        } else {
          sendData = JSON.stringify(data);
        }
      }

      if (finalGzip && gzipUrl) {
        xhr.open('POST', this.buildRequestUrl(gzipUrl, accessNo, webGroupId), true);
      } else {
        xhr.open('POST', this.buildRequestUrl(url, accessNo, webGroupId), true);
      }

      // 关键设置：告诉浏览器我们期望一个 text
      xhr.responseType = 'text';

      // 添加响应处理逻辑
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            if (xhr.responseType === 'text' || xhr.responseType === '') {
              const responseText = xhr?.responseText && JSON.parse(xhr?.responseText);
              if (!responseText) {
                return;
              }
              const code = responseText?.code;
              const isRetryAfter = code === 429;
              if (isRetryAfter) {
                const retryAfter = xhr?.getResponseHeader('Retry-After'); // 获取单个响应头
                that.retryAfterEnd = Date.now() + Number(retryAfter) * 1000;
              } else {
                that.retryAfterEnd = 0;
              }
            }
          } catch (error) {
            logReport('toReportXhrOnload', error);
          }
        } else {
          Logger.log('请求失败:', xhr?.status);
        }
      };

      xhr.send(sendData as XMLHttpRequestBodyInit);
    } catch (error) {
      logReport('toReport', error);
    }
  }
  request(
    url: string,
    data: {
      filters?: { sdkVersion: string; appVersion: string; deviceId: any };
      paramNames?: string[];
      resource?: Record<string, string>;
      logs?: { attributes: Record<string, string> }[];
    },
    appInfo: {
      accessNo?: string;
      webGroupId?: string | number;
    }
  ): Promise<XhrConfigResponse | null> {
    try {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.buildRequestUrl(url, appInfo.accessNo, appInfo.webGroupId), true);
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange = function () {
          // todo 加trycatch
          try {
            if (xhr.readyState === 4 && xhr.status === 200) {
              if (xhr.responseType === 'text' || xhr.responseType === '') {
                resolve(JSON.parse(xhr.responseText));
              }
            }
          } catch (error) {
            console.log('requeststatechange', error);
          }
        };
      });
    } catch (error) {
      console.log('requestError', error);
      return Promise.resolve(null);
    }
  }
}

let _instance: ByXHR;

/** 单例模式 */
export const XHR = () => {
  if (_instance) {
    return _instance;
  }
  _instance = new ByXHR();
  return _instance;
};
export const logReport = async (type: string, value: any) => {
  try {
    const logSamplate = samplingComputed('logRepRate' as SamplingType, Number(windowOrs?.samplingConfig?.logRepRate));
    if (windowOrs?.samplingConfig?.logRep && logSamplate) {
      const logReportXhr = XHR();

      const params = {
        resource: {
          'sdk.name': 'ors-web',
          'sdk.version': pkg.version,
          'web.groupName': windowOrs.userConfig?.name,
          'web.groupVersion': windowOrs.userConfig?.version,
          'app.env': windowOrs.userConfig?.env,
          'device.id': windowOrs.userConfig?.deviceId,
          'os.name': deviceInfo.os,
          'os.version': deviceInfo.osVersion,
          'os.versionMajor': deviceInfo.osVersionMajor,
          browser: deviceInfo.browser,
          'browser.version': deviceInfo.browserVersion,
          'browser.versionMajor': deviceInfo.browserVersionMajor,
          'session.id': windowOrs.orsDataInfo.sessionInfo.sessionId,
        },
        logs: [
          {
            timeUnixNano: Date.now() * 1000000,
            observedTimeUnixNano: Date.now() * 1000000,
            severityText: 'error',
            traceId: getrandomNumber(4),
            spanId: getrandomNumber(4),
            body: value.toString() + value?.stack?.toString(),
            attributes: {
              'log.id': getrandomNumber(32),
              'log.type': 'weblog',
              'log.name': type,
            },
          },
        ],
      };

      const logReportUrl = `${windowOrs.userConfig?.server || getEntity(windowOrs.userConfig?.entity)}${process.env.LOG_URL}`;
      await logReportXhr.request(logReportUrl, params, {
        webGroupId: windowOrs.userConfig?.projectId,
      });
      windowOrs.extraConfig.errorCount++;
      if (windowOrs.extraConfig.errorCount >= 3) {
        // 自身错误超过三次，将不再监控，销毁监听器
        sdkLifeTimeEmitter.emit('monitorDestroy', 'sdk:teardown');
      }
    }
  } catch (error) {
    console.log('logReport:', error);
  }
};
