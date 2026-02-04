import { ResourceCollect } from '@/collect/resource';
import { RequestCollect } from '@/collect/request';
import ActionCollect from '@/collect/action';
import ConsoleCollect from '@/collect/console';
import { PromiseError, ResourceError, BrowserApiError, CaptureError } from '@/collect/error';
import { LongTaskCollect } from '@/collect/longTask';
import ViewCollect from '@/collect/view';
import timeTranslate from '@/utils/timeTranslate';
import { generateOrGetSessionId, getSessionParams } from '@/utils/sessionCalculate';
import { SamplingManager, logReport, initConfigData, initConfig } from '@/config';
import type { SessionParams, initObserveParams, initSubAppParams } from '@/types/init';
import browserSupport from '@/utils/browserSupport';
import { getBridgeData } from '@/utils/getJsBridgeData';
import { initUnloadListener } from '@/utils';
import { windowOrs } from '@/store/windowOrs';
import '@/utils/performancePolyfill'; // performance polyfill
import { sdkLifeTimeEmitter } from '@/utils/mitt';
import { OrsIntegrationSetupParams } from './types/integrations';
import { ORS_WINDOW_EXPOSE_KEY } from './constant';
import { Logger } from '@/utils/common';
import PerformanceCollect from '@/collect/performance';
import { integrationManager } from '@/integrations/utils';

let viewCollect: ViewCollect | null = null;

let performanceCollect: PerformanceCollect | null = null;

export const initObserve = async (params: initObserveParams) => {
  try {
    // 判断浏览器是否支持采集
    if (!browserSupport()) return;

    /** 初始化日志*/
    Logger.init({ debug: params.debug });
    // 在导入后，合并属性而不是替换整个变量：
    Object.assign(windowOrs, initConfigData);
    windowOrs.userConfig = params;

    // 获取jsBridge通信的数据
    getBridgeData();

    // 参数校验
    generateOrGetSessionId();
    const sessionParams: SessionParams = getSessionParams(params);
    // 初始化集成
    integrationManager.init(params);

    /**
     * view采集
     */
    viewCollect = new ViewCollect(sessionParams);
    if (viewCollect) {
      // 监听页面跳转事件
      viewCollect.setupPageListeners();
    }

    //performacen observer性能指标采集
    performanceCollect = new PerformanceCollect({
      pageType: 'pageload',
      viewId: windowOrs.orsViewAttrs.viewId,
      projectConfig: sessionParams,
    });

    /**
     * js错误采集
     */
    //全局错误
    const resourceErrorCollect: ResourceError = new ResourceError(sessionParams);
    resourceErrorCollect && resourceErrorCollect.openWhiteScreenMonitor();
    // browserApi回调错误
    new BrowserApiError(sessionParams);

    // promise错误
    const promiseErrorCollect: PromiseError = new PromiseError(sessionParams);
    promiseErrorCollect?.monitorError();

    // longTask错误
    const longTaskCollect: LongTaskCollect = new LongTaskCollect(sessionParams);
    longTaskCollect?.initLongAnimationFrameObserver();

    // 主动捕获错误
    windowOrs.CaptureError = CaptureError.getInstance(sessionParams);

    //初始化通信采集错误
    sdkLifeTimeEmitter.emit('matchJsErrorSampling', sessionParams);

    /**
     * 请求采集
     */
    const requestCollect: RequestCollect = new RequestCollect(sessionParams);
    requestCollect?.initMonitor();

    /**
     * 资源采集
     */
    const resourceCollect: ResourceCollect = ResourceCollect.getInstance(sessionParams);
    resourceCollect?.initMonitor();

    /**
     * action采集
     */
    const actionCollect: ActionCollect = new ActionCollect(sessionParams);
    actionCollect?.initListener();

    /**
     * console日志采集
     */
    const consoleCollect: ConsoleCollect | null = new ConsoleCollect(sessionParams);
    consoleCollect && consoleCollect.initConsole();

    //初始化采集通信
    sdkLifeTimeEmitter.emit('initCollect', sessionParams);

    // 初始化配置参数
    await initConfig(params);

    // 是否执行初始化
    let isInit = false;

    window.addEventListener('load', async () => {
      try {
        if (isInit) return;
        // 页面信息初始化放到最前,防止错误上报的时候不带view信息
        Logger.log('[log][addEventListenerLoad]');
        isInit = true;
        await initMonitor(sessionParams);
      } catch (error) {
        logReport('initMonitorLoad', error);
      }
    });
    if (!isInit && document.readyState === 'complete') {
      Logger.log('[log][complete]');
      isInit = true;
      await initMonitor(sessionParams);
    }
  } catch (error) {
    logReport('initObserve', error);
  }
};

// 初始化监控类
const initMonitor = async (sessionParams: SessionParams) => {
  try {
    sdkLifeTimeEmitter.emit('beforeInitMonitor', sessionParams);
    const isRate = SamplingManager.decide({ rumType: 'ors_view' }) === 'report';
    if (isRate) {
      if (performanceCollect) {
        performanceCollect.observePerformance();
      }
      if (viewCollect) {
        viewCollect.reportData([viewCollect.getViewInfo(performanceCollect)]);
      }
    }

    windowOrs.isInit = true;
    sdkLifeTimeEmitter.emit('initObserveFinished', windowOrs);
    // 初始化监听页面卸载事件
    setTimeout(() => {
      // 监听页面卸载事件
      initUnloadListener(sessionParams);
    }, 3 * 1000);
  } catch (error) {
    logReport('initMonitor', error);
  }
};

// to do 换个新名称

// FMP的时间
// const getNowTime = (type: string) => {
//   if (type === 'FMP' && windowOrs.isInit) {
//     windowOrs.orsViewPage.FMP = timeTranslate(performance.now());
//     setTimeout(() => {
//       try {
//         viewCollect && viewCollect.reportData([windowOrs.orsViewPage]);
//       } catch (error) {
//         logReport('getNowTime', error);
//       }
//     }, 1);
//   }
// };
export const recordFMPTime = (type: string) => {
  if (type === 'FMP' && windowOrs.isInit) {
    windowOrs.orsViewPage.FMP = timeTranslate(performance.now());
    setTimeout(() => {
      try {
        viewCollect && viewCollect.reportData([windowOrs.orsViewPage]);
      } catch (error) {
        logReport('getNowTime', error);
      }
    }, 1);
  }
};

let subAppCleanupFn: undefined | (() => void);

function setupSubApp(params: initSubAppParams, mainAppInfo: OrsIntegrationSetupParams) {
  const { integrations, ...subAppInfo } = params;
  if (integrations && Array.isArray(params.integrations)) {
    integrations.forEach((i) => {
      if (i.setup) {
        try {
          i.setup({
            ...mainAppInfo,
            isSubApp: true,
            subAppInfo,
          });
        } catch (error) {
          logReport(`initSubAppObserve方法中，${i.name || '未知插件名'}初始化错误`, error);
        }
      }
    });
  }
  subAppCleanupFn = () => {
    if (params.integrations) {
      params.integrations.forEach((i) => {
        i?.cleanup?.();
      });
    }
  };
  return subAppCleanupFn;
}

/** 请确保在主应用中添加 WindowExposeIntegration集成 */
export const initSubAppObserve = (params: initSubAppParams): undefined | (() => void) => {
  try {
    const mainAppInfo: OrsIntegrationSetupParams = (window as any)[ORS_WINDOW_EXPOSE_KEY];
    if (!mainAppInfo || typeof mainAppInfo !== 'object') {
      return;
    }
    const orsWindow = mainAppInfo?.getOrsGlobalObject?.();
    if (!orsWindow) {
      return;
    }

    //主应用初始化完了直接执行
    if (orsWindow.isInit) {
      return setupSubApp(params, mainAppInfo);
      //主应用未初始化完成，需要作监听
    } else {
      mainAppInfo.sdkLifeTimeEmitter.on('initObserveFinished', () => {
        setupSubApp(params, mainAppInfo);
      });
      return () => {
        if (subAppCleanupFn) {
          subAppCleanupFn();
        }
      };
    }
  } catch (error) {
    logReport('initSubAppObserve', error);
    return;
  }
};

// 子系统清空副作用的函数
export const cleanupSubAppObserve = () => {
  if (subAppCleanupFn) {
    subAppCleanupFn();
  }
};
