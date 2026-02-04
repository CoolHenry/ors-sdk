import { logReport } from '@/config';
import { JsErrorInfoType } from '@/types/init';
import { DedupeIntegrationParamsType, OrsIntegrationSetupParams, OrsIntegrationType } from '@/types/integrations';
import { markErrorAsDiscarded } from '@/utils/error';

export const DedupeIntegration = (p?: DedupeIntegrationParamsType) => {
  let previousError: JsErrorInfoType | null = null;

  let lastErrorTime: null | number = null;

  const integrationName = 'dedupe-integration';

  const result: OrsIntegrationType = {
    name: integrationName,
    setup: (params: OrsIntegrationSetupParams) => {
      if (params.sdkLifeTimeEmitter) {
        params.sdkLifeTimeEmitter.on('reportError', (err: JsErrorInfoType) => {
          try {
            const throttleWait = typeof p?.throttleWait === 'number' && p.throttleWait > 0 ? p.throttleWait : null;
            const debounceWait = typeof p?.debounceWait === 'number' && p.debounceWait > 0 ? p.debounceWait : null;
            // 格式错误的err类型不作处理
            if (!err || err.rumType !== 'ors_error') {
              return;
            }
            if (err && previousError && isSameError(err, previousError)) {
              // 没有配置throttleWait，则直接丢弃
              if (!throttleWait && !debounceWait) {
                markErrorAsDiscarded(err);
                return;
              }
              // 配置throttleWait，如果在有效时间内需要忽略
              if (throttleWait && lastErrorTime && performance.now() - lastErrorTime < throttleWait) {
                markErrorAsDiscarded(err);
                return;
              }
              // 配置debounceWait，如果在有效时间内需要忽略,并且更新lastErrorTime
              if (debounceWait && lastErrorTime && performance.now() - lastErrorTime < debounceWait) {
                lastErrorTime = performance.now();
                markErrorAsDiscarded(err);
                return;
              }
            }
            lastErrorTime = performance.now();
            previousError = err;
          } catch (error) {
            logReport(`${integrationName}中处理错误异常`, error);
          }
        });
      }
    },
  };
  return result;
};

function isSameError(currentError: JsErrorInfoType, previousError: JsErrorInfoType) {
  if (currentError.type !== previousError.type) {
    return false;
  }
  // js \ promise \ vue \ react 错误
  if (currentError.mechanism?.type !== previousError.mechanism?.type) {
    return false;
  }
  // 错误标题
  if (currentError.msg !== previousError.msg) {
    return false;
  }
  //   堆栈字符串信息
  if (currentError.errorObj !== previousError.errorObj) {
    return false;
  }
  return true;
}
