import { logReport } from '@/config';
import PerformanceCollect from '.';

export class PerformanceManagement {
  static instance: PerformanceManagement;

  private _performanceCollectList: PerformanceCollect[] = [];
  private _performanceCollectListMapper: Record<string, PerformanceCollect> = {};

  //单例模式，对外界不可实例化
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance() {
    if (!PerformanceManagement.instance) {
      PerformanceManagement.instance = new PerformanceManagement();
    }
    return PerformanceManagement.instance;
  }

  getLastPerformanceCollect() {
    try {
      if (!this._performanceCollectList.length) {
        return null;
      }
      return this._performanceCollectList[this._performanceCollectList.length - 1];
    } catch (error) {
      logReport('getLastPerformanceCollect', error);
      return null;
    }
  }
  getPerformanceCollectList() {
    return this._performanceCollectList;
  }

  addPerformanceCollect(performanceCollect: PerformanceCollect) {
    try {
      if (performanceCollect.viewId && !this._performanceCollectListMapper[performanceCollect.viewId]) {
        this._performanceCollectList.push(performanceCollect);
        this._performanceCollectListMapper[performanceCollect.viewId] = performanceCollect;
      }
    } catch (error) {
      logReport('addPerformanceCollect', error);
    }
  }
  removePerformanceCollect(performanceCollect: PerformanceCollect) {
    try {
      if (this._performanceCollectListMapper[performanceCollect.viewId]) {
        delete this._performanceCollectListMapper[performanceCollect.viewId];
        const index = this._performanceCollectList.indexOf(performanceCollect);
        if (index !== -1) {
          this._performanceCollectList.splice(index, 1);
        }
      }
    } catch (error) {
      logReport('removePerformanceCollect', error);
    }
  }
  disconnectAllPerformanceCollect(endTime: number) {
    try {
      this._performanceCollectList.forEach((performanceCollect) => {
        performanceCollect.disconnect(endTime);
      });
      this._performanceCollectList = [];
      this._performanceCollectListMapper = {};
    } catch (error) {
      logReport('disconncetAllPerformanceCollect', error);
    }
  }
}
