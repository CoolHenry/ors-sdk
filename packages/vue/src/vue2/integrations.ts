import VueError from '@/common/error';
import { Vue2InitConfigType } from '@/types';
import { AbstractPathMatcher, OrsIntegrationSetupParams, OrsIntegrationType, setOrsGlobalObject, MonitorDestroyReason } from '@ors-sdk/web';
import Vue2ComponentMonitorCollect from './vue2Component';
import { VuePathMatcher } from '@/common/path';

export class Vue2Integrations implements OrsIntegrationType {
  name = 'vue2-integrations' as const;
  config: Vue2InitConfigType;
  pathMatcher: AbstractPathMatcher | undefined;
  setupParams: OrsIntegrationSetupParams | undefined;
  vueErrorStance: VueError | null;
  constructor(config: Vue2InitConfigType) {
    this.config = config;
    this.vueErrorStance = null;
  }

  setup(setupParams: OrsIntegrationSetupParams) {
    if (!setupParams || !this.config) {
      return;
    }
    if (setupParams?.isSubApp && setupParams?.getOrsGlobalObject) {
      setOrsGlobalObject(setupParams?.getOrsGlobalObject?.());
    }
    if (this.config?.app) {
      this.initVueErrorTracing(this.config, setupParams);
      this.initComponentMonitor(this.config, setupParams);
    }
    if (this.config.router) {
      this.initVueRouter(this.config, setupParams);
    }
    this.monitorDestroy(setupParams);
  }

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
  initVueErrorTracing(config: Vue2InitConfigType, setupParams: OrsIntegrationSetupParams) {
    const { app } = config;
    const { sdkLifeTimeEmitter, sdkIntegrationEmitter, isSubApp, sessionInfo, getOrsGlobalObject, subAppInfo } = setupParams;
    if (app) {
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
    }
  }
  initComponentMonitor(config: Vue2InitConfigType, setupParams: OrsIntegrationSetupParams) {
    const { app } = config;
    const { isSubApp, getOrsGlobalObject, subAppInfo, sdkLifeTimeEmitter, sdkIntegrationEmitter, sessionInfo } = setupParams;
    if (app && !!app.mixin) {
      if (!isSubApp) {
        sdkLifeTimeEmitter.on('initCollect', (params) => {
          new Vue2ComponentMonitorCollect(params).initComponentCollect(app);
        });
        sdkIntegrationEmitter.on('addIntegrations', (params) => {
          new Vue2ComponentMonitorCollect(params).initComponentCollect(app);
        });
      }
      if (isSubApp && getOrsGlobalObject) {
        const matchSessionSampling = getOrsGlobalObject().samplingConfig.session;
        if (matchSessionSampling) {
          const combinedInfo = { ...sessionInfo, ...(subAppInfo || {}) };
          new Vue2ComponentMonitorCollect(combinedInfo).initComponentCollect(app);
        }
      }
    }
  }
  initVueRouter(config: Vue2InitConfigType, setupParams: OrsIntegrationSetupParams) {
    const { router, key, ignorePathPattern } = config;
    const { isSubApp, sdkIntegrationEmitter, sdkLifeTimeEmitter, subAppInfo } = setupParams;
    if (router) {
      const matcherKey = key || subAppInfo?.projectId;
      this.pathMatcher = new VuePathMatcher(router, ignorePathPattern, matcherKey);
      if (!isSubApp) {
        sdkLifeTimeEmitter.on('initPathMatcherList', (pathMatcherList) => {
          if (this.pathMatcher) {
            pathMatcherList.addPathMatcher(this.pathMatcher);
          }
        });
      }
      if (isSubApp && this.pathMatcher) {
        sdkIntegrationEmitter.emit('addPathMatcher', this.pathMatcher);
      }
    }
  }
  cleanup = () => {
    if (this.pathMatcher && this.setupParams) {
      this.setupParams.sdkIntegrationEmitter.emit('removePathMatcher', this.pathMatcher);
    }
  };
}
