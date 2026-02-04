import VueError from '@/common/error';
import { Vue3InitConfigType } from '@/types';
import { AbstractPathMatcher, OrsIntegrationSetupParams, OrsIntegrationType, setOrsGlobalObject, MonitorDestroyReason } from '@ors-sdk/web';
import Vue3ComponentMonitorCollect from './vue3Component';
import { VuePathMatcher } from '@/common/path';

export class Vue3Integrations implements OrsIntegrationType {
  name = 'vue3-integrations' as const;
  config: Vue3InitConfigType;
  pathMatcher: AbstractPathMatcher | undefined;
  setupParams: OrsIntegrationSetupParams | undefined;
  vueErrorStance: VueError | null;
  constructor(config: Vue3InitConfigType) {
    this.config = config;
    this.vueErrorStance = null;
  }

  setup = (setupParams: OrsIntegrationSetupParams) => {
    this.setupParams = setupParams;
    if (setupParams?.isSubApp && setupParams?.getOrsGlobalObject) {
      setOrsGlobalObject(setupParams?.getOrsGlobalObject?.());
    }
    if (this.config?.app) {
      this.initVueErrorTracing(this.config, setupParams);
    }
    if (this.config?.app && this.config?.getCurrentInstance) {
      this.initComponentMonitor(this.config, setupParams);
    }
    if (this.config?.router) {
      this.initVueRouter(this.config, setupParams);
    }
    this.monitorDestroy(setupParams);
  };
  monitorDestroy(setupParams: OrsIntegrationSetupParams) {
    const { sdkLifeTimeEmitter } = setupParams;
    sdkLifeTimeEmitter.on('monitorDestroy', (reason: MonitorDestroyReason) => {
      switch (reason) {
        case 'sdk:teardown':
          this.cleanupErrorHandler();
          break;
        default:
          break;
      }
    });
  }
  cleanupErrorHandler() {
    this.vueErrorStance && this.vueErrorStance.destroyErroHandler();
  }

  initVueErrorTracing = (config: Vue3InitConfigType, setupParams: OrsIntegrationSetupParams) => {
    const { app } = config;
    const { sdkLifeTimeEmitter, sdkIntegrationEmitter, isSubApp, getOrsGlobalObject, subAppInfo, sessionInfo } = setupParams;
    //主应用的处理逻辑
    if (!isSubApp) {
      sdkLifeTimeEmitter.on('matchJsErrorSampling', (params) => {
        this.vueErrorStance = new VueError(params);
        this.vueErrorStance.handleError(app);
      });
      sdkIntegrationEmitter.on('addIntegrations', (params) => {
        this.vueErrorStance = new VueError(params);
        this.vueErrorStance.handleError(app);
      });
    }
    //子应用的处理逻辑
    if (isSubApp && getOrsGlobalObject) {
      const matchJsErrorSampling = getOrsGlobalObject().samplingConfig.jsError;
      if (matchJsErrorSampling) {
        const combinedInfo = { ...sessionInfo, ...(subAppInfo || {}) };
        this.vueErrorStance = new VueError(combinedInfo);
        this.vueErrorStance.handleError(app);
      }
    }
  };

  initComponentMonitor = (config: Vue3InitConfigType, setupParams: OrsIntegrationSetupParams) => {
    const { app, getCurrentInstance } = config;
    const { sdkLifeTimeEmitter, sdkIntegrationEmitter, isSubApp, getOrsGlobalObject, sessionInfo, subAppInfo } = setupParams;
    if (getCurrentInstance && !!app.mixin) {
      if (!isSubApp) {
        sdkLifeTimeEmitter.on('initCollect', (params) => {
          new Vue3ComponentMonitorCollect(params).initComponentCollect(app, getCurrentInstance);
        });
        sdkIntegrationEmitter.on('addIntegrations', (params) => {
          new Vue3ComponentMonitorCollect(params).initComponentCollect(app, getCurrentInstance);
        });
      }
      if (isSubApp && getOrsGlobalObject) {
        const matchSessionSampling = getOrsGlobalObject().samplingConfig.session;
        if (matchSessionSampling) {
          const combinedInfo = { ...sessionInfo, ...(subAppInfo || {}) };
          new Vue3ComponentMonitorCollect(combinedInfo).initComponentCollect(app, getCurrentInstance);
        }
      }
    }
  };
  initVueRouter = (config: Vue3InitConfigType, setupParams: OrsIntegrationSetupParams) => {
    const { router, key, ignorePathPattern } = config;
    const { sdkLifeTimeEmitter, subAppInfo, isSubApp, sdkIntegrationEmitter } = setupParams;
    if (router) {
      const matcherKey = key || subAppInfo?.projectId;
      this.pathMatcher = new VuePathMatcher(router, ignorePathPattern, matcherKey);
    }
    if (!isSubApp && this.pathMatcher) {
      sdkLifeTimeEmitter.on('initPathMatcherList', (pathMatcherList) => {
        if (this.pathMatcher) {
          pathMatcherList.addPathMatcher(this.pathMatcher);
        }
      });
    }
    if (isSubApp && this.pathMatcher) {
      sdkIntegrationEmitter.emit('addPathMatcher', this.pathMatcher);
    }
  };
  cleanup = () => {
    if (this.pathMatcher && this.setupParams) {
      this.setupParams.sdkIntegrationEmitter.emit('removePathMatcher', this.pathMatcher);
    }
  };
}
