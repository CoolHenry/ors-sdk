import { IComponentData } from '@/types';
import { Base, getRandomNumber, logReport, userInfoStore, SessionParams, windowOrs } from '@ors-sdk/web';
import type { ProjectInfoType, UserAttrsInfo } from '@ors-sdk/web';
export class VueComponentMonitorCollect extends Base {
  constructor(params: SessionParams) {
    super(params);
  }

  // 处理组件数据
  handleCompData(comp: IComponentData, projectInfo?: ProjectInfoType) {
    try {
      const userInfo = userInfoStore.get() as UserAttrsInfo;
      const component = {
        id: getRandomNumber(32),
        rumType: 'ors_comp',
        name: comp.name,
        mark: comp.orsCompMark || '',
        status: comp.status || '1', // 1-- success  2--fail
        compStartTime: comp.beforeCreate,
        compEndTime: comp.mounted,
        ...userInfo,
        ...windowOrs.orsViewAttrs,
        ...this.getSessionInfo(),
        ...this.actionInfo(),
      };
      this.reportData([component], projectInfo);
    } catch (error) {
      logReport('handleCompData', error);
    }
  }
}
