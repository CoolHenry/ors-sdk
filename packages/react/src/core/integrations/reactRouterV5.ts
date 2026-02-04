import { OrsIntegrationSetupParams, OrsIntegrationType, setOrsGlobalObject, logReport } from '@ors-sdk/web';
import type { AbstractPathMatcher } from '@ors-sdk/web';
import { ReactV5IntegrationConfig } from '../types/route';
import { RouterV5PathMatcher } from './router/v5';

export class ReactRouterV5Integrations implements OrsIntegrationType {
  name = 'react-router-v5-integration';
  private config: ReactV5IntegrationConfig;
  private pathMatcher: AbstractPathMatcher | undefined;
  private params: OrsIntegrationSetupParams | undefined;
  constructor(config: ReactV5IntegrationConfig) {
    this.config = config;
  }
  setup = (params: OrsIntegrationSetupParams) => {
    try {
      if (!this.config || !params) {
        return;
      }
      if (params?.isSubApp && params?.getOrsGlobalObject) {
        setOrsGlobalObject(params?.getOrsGlobalObject?.());
      }
      this.params = params;
      if (this.config.routes) {
        const key = this.config?.key || params?.subAppInfo?.projectId;
        this.pathMatcher = new RouterV5PathMatcher(this.config, key);
      }
      //主应用中处理逻辑
      if (!params.isSubApp && this.pathMatcher) {
        params.sdkLifeTimeEmitter.on('initPathMatcherList', (pathMatcherList) => {
          if (this.pathMatcher) {
            pathMatcherList.addPathMatcher(this.pathMatcher);
          }
        });
      }
      //子应用中处理逻辑
      if (params.isSubApp && this.pathMatcher) {
        params.sdkIntegrationEmitter.emit('addPathMatcher', this.pathMatcher);
      }
    } catch (error) {
      logReport('reactRouterV5SetUp', error);
    }
  };

  cleanup = () => {
    try {
      if (this.pathMatcher && this.params) {
        this.params.sdkIntegrationEmitter.emit('removePathMatcher', this.pathMatcher);
      }
    } catch (error) {
      logReport('reactRouterV5CleanUp', error);
    }
  };
}
