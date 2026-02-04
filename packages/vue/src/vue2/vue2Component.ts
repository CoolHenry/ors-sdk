/* eslint-disable @typescript-eslint/ban-ts-comment */
import { VueComponentMonitorCollect } from '@/common/component';
import { ICompData, Vue2 } from '@/types';
import { logReport, ProjectInfoType, SessionParams, Logger } from '@ors-sdk/web';

export default class Vue2ComponentMonitorCollect extends VueComponentMonitorCollect {
  constructor(params: SessionParams) {
    super(params);
  }
  initComponentCollect(app: Vue2, projectInfo?: ProjectInfoType) {
    this.vue2CompMonitor(app, projectInfo);
  }

  // 获取vue2组件名称
  getVue2CompName(vueThis: any) {
    try {
      let compName = vueThis.$options?.name || vueThis.$options?.__name;
      const compFileAddress = vueThis.$options?.__file;
      if (!compName && !compFileAddress) return;
      if (!compName) {
        if (vueThis.$options?.__file) {
          const filePath = vueThis.$options?.__file;
          const files = filePath.split('/');
          const fileName = files[files.length - 1];
          if (fileName.indexOf('.')) {
            const compFileName = fileName.split('.');
            compName = compFileName[0];
          }
        }
      }
      return compName;
    } catch (error) {
      logReport('getVue2CompName', error);
      return vueThis.$options?.name || vueThis.$options?.__name || null;
    }
  }
  // vue2组件监控
  vue2CompMonitor(vue: any, projectInfo?: ProjectInfoType) {
    try {
      const compData: ICompData = {};
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      const navigationStart = performance.timeOrigin;
      const globalMixin = {
        beforeCreate() {
          try {
            // @ts-ignore
            if (this?.$attrs?.orsCompMonitor) {
              const compName = that.getVue2CompName(this);
              if (!compName) return;
              //@ts-ignore
              compData[compName + this?._uid] = {
                //@ts-ignore
                componentId: this?._uid,
                beforeCreate: (performance.now() + navigationStart + 100) * 1000000,
                name: compName,
              };
              //@ts-ignore
              if (this?.$attrs?.orsCompMark) {
                //@ts-ignore
                compData[compName + this?._uid].orsCompMark = this.$attrs.orsCompMark;
              }
            }
          } catch (error) {
            Logger.log('[log][vue2beforeCreateError]:', error);
          }
        },
        mounted() {
          try {
            //@ts-ignore
            if (this?.$attrs?.orsCompMonitor) {
              const compName = that.getVue2CompName(this);
              if (!compName) return;
              //@ts-ignore
              const curComponent = compData[compName + this?._uid];
              if (!curComponent) return;
              //@ts-ignore
              curComponent.mounted = (performance.now() + navigationStart + 100) * 1000000;
              that.handleCompData(curComponent, projectInfo);
              // 上报完这条组件数据之后将这条数据删除
              //@ts-ignore
              delete compData[compName + this?._uid];
            }
          } catch (error) {
            Logger.log('[log][vue2mountedError]:', error);
          }
        },
      };
      // 添加全局 Mixin
      vue.mixin(globalMixin);
    } catch (error) {
      logReport('vue2CompMonitor', error);
    }
  }
}
