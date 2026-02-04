import { initObserveParams, SessionParams, IntegrationsParams } from '@/types/init';
import { DedupeIntegration } from './DedupeIntegration';
import { logReport } from '@/config';
import { OrsIntegrationType } from '@/types/integrations';
import { getOrsGlobalObject } from '@/store/windowOrs';
import { sdkLifeTimeEmitter, sdkIntegrationEmitter } from '@/utils/mitt';
import { getSessionParams } from '@/utils/sessionCalculate';

export const getDefaultIntegrations = (params: initObserveParams | IntegrationsParams) => {
  try {
    if (params.defaultIntegrations === false) {
      return [];
    }
    if (Array.isArray(params.defaultIntegrations)) {
      return params.defaultIntegrations;
    }
    return [
      DedupeIntegration({
        throttleWait: params.defaultIntegrationProps?.dedupe?.throttleWait,
      }),
    ];
  } catch (error) {
    logReport('getDefaultIntegrations', error);
    return [DedupeIntegration()];
  }
};

/** 获取完整的集成列表 */
export const getCombinedIntegrations = (params: initObserveParams | IntegrationsParams) => {
  try {
    const defaultIntegrations = getDefaultIntegrations(params);
    let userIntegrations: OrsIntegrationType[] = [];
    if (Array.isArray(params.integrations)) {
      userIntegrations = params.integrations;
    }
    if (typeof params.integrations === 'function') {
      userIntegrations = params.integrations(defaultIntegrations);
    }
    return [...defaultIntegrations, ...userIntegrations];
  } catch (error) {
    return [];
  }
};

class IntegrationManager {
  private sessionParams?: SessionParams;
  private setupedIntegrationsName: string[] = []; //已经setup的集成

  init(params: initObserveParams) {
    if (!this.sessionParams) {
      this.sessionParams = getSessionParams(params);
    }
    const combinedIntegrations = getCombinedIntegrations(params);

    this.setupIntegrations(combinedIntegrations);
  }

  add(params: IntegrationsParams) {
    if (!this.sessionParams) {
      console.error('请先初始化SDK！');
      return;
    }

    const combinedIntegrations = getCombinedIntegrations(params);
    const unSetupIntegrations = combinedIntegrations.filter((e) => !this.setupedIntegrationsName.includes(e.name));
    this.setupIntegrations(unSetupIntegrations);
    //增量pathMatcher
    sdkIntegrationEmitter.emit('addPathMatcherList');
    //增量集成
    sdkIntegrationEmitter.emit('addIntegrations', this.sessionParams);
  }
  updateSetupedIntegrationsName(integrations: initObserveParams['integrations']) {
    const combinedIntegrationsName = integrations && Array.isArray(integrations) ? integrations.map((i) => i.name) : [];
    this.setupedIntegrationsName.push(...combinedIntegrationsName);
  }

  private setupIntegrations(integrations?: initObserveParams['integrations']) {
    if (Array.isArray(integrations)) {
      integrations?.forEach((i) => {
        i.setup?.({
          sdkLifeTimeEmitter,
          sdkIntegrationEmitter,
          getOrsGlobalObject,
          isSubApp: false,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          sessionInfo: this.sessionParams!,
        });
      });
    }
  }
}

export const integrationManager = new IntegrationManager();
