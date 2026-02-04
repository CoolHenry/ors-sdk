import { ORS_WINDOW_EXPOSE_KEY } from '@/constant';
import { OrsIntegrationSetupParams, OrsIntegrationType } from '@/types/integrations';

export const WindowExposeIntegration = () => {
  const result: OrsIntegrationType = {
    name: 'window-expose-integration',
    setup: (params: OrsIntegrationSetupParams) => {
      (window as any)[ORS_WINDOW_EXPOSE_KEY] = params;
    },
  };
  return result;
};
