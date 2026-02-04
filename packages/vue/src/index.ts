import { App } from 'vue';
import orsSdk, { ORSSDK } from '@ors-sdk/core';

export interface VueOptions {
  dsn?: string;
  environment?: string;
  release?: string;
}

export const createORSPlugin = (options?: VueOptions) => {
  return {
    install(app: App) {
      // Initialize SDK if options are provided
      if (options) {
        console.log('Initializing ORS SDK with options:', options);
      }
      
      // Add SDK to app config
      app.config.globalProperties.$ors = orsSdk;
      
      // Add error handler
      app.config.errorHandler = (err, instance, info) => {
        orsSdk.captureException(err, { 
          component: instance?.$options?.name || 'unknown',
          info,
          context: 'vue-error-handler'
        });
      };
    }
  };
};

// Export the plugin and SDK
export default createORSPlugin;
export { orsSdk, ORSSDK };