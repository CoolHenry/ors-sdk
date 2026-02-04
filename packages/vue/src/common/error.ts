import type { CommonVue, UnknownFunc, ViewModel } from '@/types';
import { ErrorBase, ErrorCategoryEnum, ErrorLevelEnum, SessionParams, JSONstringify, ProjectInfoType, Logger, ORS_ERROR_RETHROW } from '@ors-sdk/web';
/**
 * vue错误
 */
class VueError extends ErrorBase {
  originalErrorHandler: ((err: Error, vm: ViewModel, info: string) => void) | undefined;
  isEnableReport: boolean;
  constructor(params: SessionParams) {
    super(params);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.originalErrorHandler == undefined;
    // 是否开启上报
    this.isEnableReport = true;
  }

  /**
   * 处理Vue错误提示
   */
  handleError(Vue: CommonVue, projectInfo?: ProjectInfoType) {
    if (!Vue || !Vue.config) {
      return;
    }
    this.originalErrorHandler = Vue.config.errorHandler;
    Vue.config.errorHandler = (error: Error, vm, info: string) => {
      //   try {
      const errorObj = {
        message: error?.message,
        stack: error?.stack,
        info: info,
        componentName: '',
        orsCompMark: '',
        propsData: '',
      };

      if (Object.prototype.toString.call(vm) === '[object Object]') {
        errorObj.componentName = vm.$options?.__name || vm.$options?.name || '';
        try {
          const propsData = vm.$options?.propsData || vm.$options?.props;
          errorObj.propsData = propsData && JSON.parse(JSON.stringify(propsData));
        } catch {
          errorObj.propsData = '[unserializable propsData]';
        }
        errorObj.orsCompMark = vm?.$attrs?.orsCompMark;
      }
      this.level = ErrorLevelEnum.WARN;
      this.msg = JSONstringify(errorObj);
      this.category = ErrorCategoryEnum.VUE_ERROR;
      const errorType = 'vue';
      this.isEnableReport &&
        this.recordError({
          message: error?.message,
          error: errorObj,
          errorSubType: errorType,
          mechanism: {
            handled: false,
            type: 'auto.function.vue.error_handler',
          },
          projectInfoParams: projectInfo,
        });
      Logger.log('[log][errorEvent-vueError]:', error);
      // Check if the current `app.config.errorHandler` is explicitly set by the user before calling it.
      if (typeof this.originalErrorHandler === 'function' && this.originalErrorHandler) {
        (this.originalErrorHandler as UnknownFunc).call(Vue, error, vm, info);
      } else {
        // 将error throw出去，方便业务侧观测处理
        if (!(error as any)?.[ORS_ERROR_RETHROW]) {
          (error as any)[ORS_ERROR_RETHROW] = true;
          throw error;
        }
      }
      //   } catch (error) {
      //     logReport('vueErrorInit', error);
      //   }
      return true;
    };
  }
  destroyErroHandler() {
    this.isEnableReport = false;
  }
}
export default VueError;
