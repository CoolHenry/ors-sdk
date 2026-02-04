import { AbstractPathMatcher, OrsIntegrationSetupParams, OrsIntegrationType, setOrsGlobalObject, logReport } from '@ors-sdk/web';
import { ReactV6IntegrationConfig } from '../types/route';
import { RouterV6PathMatcher } from './router/v6';

export class ReactRouterV6Integrations implements OrsIntegrationType {
  name = 'react-router-v6-integration';
  private config: ReactV6IntegrationConfig;
  private pathMatcher: AbstractPathMatcher | undefined;
  private params: OrsIntegrationSetupParams | undefined;

  constructor(config: ReactV6IntegrationConfig) {
    this.config = config;
  }

  setup = (params: OrsIntegrationSetupParams) => {
    try {
      if (!this.config || !params) {
        return;
      }
      this.params = params;
      if (params?.isSubApp && params?.getOrsGlobalObject) {
        setOrsGlobalObject(params?.getOrsGlobalObject?.());
      }
      if (this.config.routes) {
        const key = this.config?.key || params?.subAppInfo?.projectId;
        this.pathMatcher = new RouterV6PathMatcher(this.config, key);
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
      logReport('reactRouterV6SetUp', error);
    }
  };

  cleanup = () => {
    try {
      if (this.pathMatcher && this.params) {
        this.params.sdkIntegrationEmitter.emit('removePathMatcher', this.pathMatcher);
      }
    } catch (error) {
      logReport('reactRouterV6CleanUp', error);
    }
  };
}
