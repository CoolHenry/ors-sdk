import { VueComponentMonitorCollect } from '@/common/component';
import { ICompData, Vue3 } from '@/types';
import { logReport, ProjectInfoType, SessionParams } from '@ors-sdk/web';

export default class Vue3ComponentMonitorCollect extends VueComponentMonitorCollect {
  constructor(params: SessionParams) {
    super(params);
  }
  initComponentCollect(app: Vue3, getCurrentInstance: () => Vue3, projectInfo?: ProjectInfoType) {
    this.vue3CompMonitor(app, getCurrentInstance, projectInfo);
  }
  // 获取vue3组件名称
  getVue3CompName(instance: any) {
    try {
      // 由于部分声明组件的习惯用index.vue,组件名称不好区分,这种的组件页面中会有大量重复的，故取上一位的index的父文件名
      let compName = instance?.type?.__name;
      if (compName === 'index') {
        const fileName = instance.type?.__file;
        if (fileName.indexOf('/') === -1) return compName;
        const fileSplit = fileName?.split('/');
        compName = fileSplit?.[fileSplit?.length - 2] || compName;
        return compName;
      } else {
        return compName;
      }
    } catch (error) {
      logReport('getVue3CompName', error);
      return instance?.type?.__name || null;
    }
  }
  // vue3组件监控
  vue3CompMonitor(vue: any, curInstance: any, projectInfo?: ProjectInfoType) {
    try {
      const compData: ICompData = {};
      const navigationStart = performance.timeOrigin;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      // 定义全局 Mixin
      const globalMixin = {
        beforeCreate() {
          try {
            // 因为view属性100ms之后执行,组件记录的时间,每个加100ms
            const instance = curInstance();
            if (instance?.attrs?.orsCompMonitor) {
              const compName = that.getVue3CompName(instance);
              if (!compName) return;
              compData[compName + instance?.uid] = {
                componentId: instance?.uid,
                beforeCreate: (performance.now() + navigationStart + 100) * 1000000,
                name: compName,
                mounted: 0, // 补充缺失的属性
                status: '', // 补充缺失的属性
              };
              if (instance?.attrs?.orsCompMark) {
                compData[compName + instance?.uid].orsCompMark = instance?.attrs?.orsCompMark;
              }
            }
          } catch (error) {
            logReport('compBeforeCreate', error);
          }
        },
        mounted() {
          try {
            const instance = curInstance();
            if (instance?.attrs?.orsCompMonitor) {
              const compName = that.getVue3CompName(instance);
              if (!compName) return;
              const curComponent = compData[compName + instance?.uid];
              if (!curComponent) return;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              curComponent.mounted = (performance.now() + navigationStart + 100) * 1000000;
              that.handleCompData(curComponent, projectInfo);
              // 上报完这条组件数据之后将这条数据删除
              delete compData[compName + instance?.uid];
            }
          } catch (error) {
            logReport('compMounted', error);
          }
        },
      };
      // 添加全局 Mixin
      vue.mixin(globalMixin);
    } catch (error) {
      logReport('vue3CompMonitor', error);
    }
  }
}
