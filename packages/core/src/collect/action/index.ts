/* eslint-disable @typescript-eslint/ban-ts-comment */
import Base from '../base';
import getrandomNumber from '@/utils/getrandomNumber';
import timeTranslate from '@/utils/timeTranslate';
import highTime from '@/utils/highTime';
import { logReport, SamplingManager } from '@/config';
import { userInfoStore, windowOrs, Breadcrumbs } from '@/store';
import { ActionEventType, UserAttrsInfo, SessionInfosType, ViewAttrsType, ActionInfoType, SessionParams } from '@/types/init';
import { MonitorDestroyReason } from '@/types/lifecycle';
import { sdkLifeTimeEmitter } from '@/utils/mitt';
export default class ActionCollect extends Base {
  public params = {};
  private listenClickHandle: any;
  constructor(params: SessionParams) {
    super(params);
    this.params = params;
    this.listenClickHandle = this.listenClickEvent.bind(this);
    this.monitorDestroy();
  }
  private monitorDestroy() {
    sdkLifeTimeEmitter.on('monitorDestroy', (reason: MonitorDestroyReason) => {
      switch (reason) {
        case 'sdk:teardown':
          this.destroyMonitor();
          break;
        default:
          break;
      }
    });
  }
  listenClickEvent() {
    try {
      const actionId = getrandomNumber(32);
      const userInfo: UserAttrsInfo = userInfoStore.get() as UserAttrsInfo;
      const actionEvent: ActionEventType = {
        actionId: actionId,
        rumType: 'ors_action',
        type: 'click',
        sessionType: 'user',
        name: '',
        duration: timeTranslate(performance.now() - (event?.timeStamp || 0)), // action的操作时间
        actionStartTime: highTime(performance.timeOrigin + (event?.timeStamp || 0)),
        actionEndTime: highTime(performance.timeOrigin + performance.now()),
      };
      const sessionInfo: SessionInfosType = this.getSessionInfo();
      const viewAttrs: ViewAttrsType = windowOrs.orsViewAttrs;
      const actionInfo: ActionInfoType = {
        ...actionEvent,
        ...userInfo,
        ...sessionInfo,
        ...viewAttrs,
      };
      windowOrs.orsDataInfo.actionId = actionId;
      let actionName = null;
      //@ts-ignore
      if (event.target?.innerText?.length > 80) {
        //@ts-ignore
        actionName = event.target?.innerText?.slice(0, 80);
      } else {
        //@ts-ignore
        actionName = event.target?.innerText || '';
      }
      //@ts-ignore
      actionName = actionName ? actionName.replace(/\n/, '') : '';
      actionInfo.name = actionName;

      /** 根据采样率判断是否需要上报操作数据，如果需要就上报，否则只采集数据 */
      const isRateDrop = SamplingManager.decide({ rumType: 'ors_action' }) === 'drop';
      if (isRateDrop) {
        // 采集的数据存入store
        Breadcrumbs.add(actionInfo);
      }
      this.reportData([actionInfo]);
    } catch (error) {
      logReport('initClickListener', error);
    }
  }
  // 初始化监听
  initListener() {
    window.addEventListener('click', this.listenClickHandle);
  }
  // 销毁监听
  destroyMonitor() {
    window.removeEventListener('click', this.listenClickHandle);
  }
}
