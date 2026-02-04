/* eslint-disable @typescript-eslint/ban-ts-comment */
import Base from '../base';
import urlParse from '@/utils/urlParse';
import getrandomNumber from '@/utils/getrandomNumber';
import timeTranslate from '@/utils/timeTranslate';
import highTime from '@/utils/highTime';
import { logReport, eventBus, SamplingManager } from '@/config';
import { userInfoStore, windowOrs, Breadcrumbs } from '@/store';
import { isAllTrue, needSkipUrlCollect } from '@/utils';
import { Logger } from '@/utils/common';
import type {
  ActionInfoType,
  SessionParams,
  ResourceAndRequestEventType,
  ResourceAndRequestInfoType,
  SessionInfosType,
  ViewAttrsType,
} from '@/types/init';
import { MonitorDestroyReason } from '@/types/lifecycle';
import { sdkLifeTimeEmitter } from '@/utils/mitt';

export class ResourceCollect extends Base {
  static instance: ResourceCollect;
  public params: SessionParams;
  private resourceObserver: PerformanceObserver | null = null;

  constructor(params: SessionParams) {
    super(params);
    this.params = params;
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
  public static getInstance(params?: SessionParams) {
    if (!ResourceCollect.instance) {
      if (!params) {
        Logger.warn('[ors-sdk] ResourceCollect not initialized');
      } else {
        ResourceCollect.instance = new ResourceCollect(params);
      }
    }
    return ResourceCollect.instance;
  }

  // 初始化资源监控
  public initMonitor() {
    try {
      if (!window.performance || !window.PerformanceObserver) {
        console.warn('该浏览器不支持performance.getEntries 以及PerformanceObserver方法');
        return;
      }
      // 设置资源观察器
      this.setupResourceObserver();
    } catch (error) {
      logReport('initMonitor', error);
    }
  }

  // 设置资源观察器
  private setupResourceObserver() {
    try {
      this.resourceObserver = new PerformanceObserver((entryList) => {
        const entryListEntries = entryList.getEntries();
        entryListEntries.forEach((entry) => {
          this.handleResourceEntry(entry);
        });
      });
      this.resourceObserver.observe({ type: 'resource', buffered: true });
    } catch (error) {
      logReport('setupResourceObserver', error);
    }
  }

  // 处理资源条目
  private handleResourceEntry(entry: PerformanceEntry) {
    try {
      if (this.isPerformanceResourceTiming(entry)) {
        this.handleStaticResource(entry);
      }
    } catch (error) {
      logReport('handleResourceEntry', error);
    }
  }
  private isPerformanceResourceTiming(entry: PerformanceEntry): entry is PerformanceResourceTiming {
    return (
      entry.entryType === 'resource' &&
      'initiatorType' in entry &&
      typeof (entry as PerformanceResourceTiming).nextHopProtocol === 'string' &&
      entry.initiatorType !== 'fetch' &&
      entry.initiatorType !== 'xmlhttprequest'
    );
  }

  // 处理静态资源
  private handleStaticResource(entry: PerformanceEntry) {
    try {
      setTimeout(() => {
        const errorResList = windowOrs.orsDataInfo.resourceErrorList;
        const failStaticResIndex = errorResList.findIndex((item: string) => item === entry.name);

        if (failStaticResIndex !== -1) {
          const resourceData = this.handleResourceData(entry, {
            method: 'GET',
            netType: 'static',
            status: 404,
          });
          if (resourceData) {
            this.reportRequestData(resourceData);
          }
          eventBus.emit('errorStaticRes', resourceData);
          windowOrs.orsDataInfo.resourceErrorList.splice(failStaticResIndex, 1);
          return;
        }

        const resourceData = this.handleResourceData(entry, {
          method: 'GET',
          netType: 'static',
        });
        if (resourceData) {
          this.reportRequestData(resourceData);
        }
      }, 50);
    } catch (error) {
      logReport('handleStaticResource', error);
    }
  }

  private reportRequestData(resourceData: ResourceAndRequestInfoType) {
    /** 根据采样率判断是否需要上报操作数据，如果需要就上报，否则只采集数据 */
    const isRateDrop = SamplingManager.decide({ rumType: 'ors_resource' }) === 'drop';
    if (isRateDrop) {
      // 采集的数据存入store
      Breadcrumbs.add(resourceData);
    }
    this.reportData([resourceData]);
  }

  // 销毁资源监控
  public destroyMonitor() {
    try {
      this.resourceObserver?.disconnect();
    } catch (error) {
      logReport('destroyResourceMonitor', error);
    }
  }

  // 处理资源数据
  public handleResourceData(
    item: any,
    options?: {
      method: string;
      netType: string;
      responseBodySize?: number | null;
      status?: number;
    }
  ) {
    try {
      Logger.log('[log][handleResourceData]:', item?.name, item, options);
      // 自身url的过滤
      if (item.name && needSkipUrlCollect(item.name, this.params)) return null;
      const { method = 'GET', netType = 'static', responseBodySize = 0, status } = options || {};
      const urlObj = urlParse(item.name).getParse();
      const name = item.name.length > 256 ? item.name.slice(0, 256) : item.name;
      const userInfo = userInfoStore.get() as ActionInfoType;
      const sessionInfo: SessionInfosType = this.getSessionInfo();
      const viewAttrs: ViewAttrsType = windowOrs.orsViewAttrs;
      const resourceAndRequestEvent: ResourceAndRequestEventType = {
        rumType: 'ors_resource',
        id: getrandomNumber(32),
        url: name,
        host: urlObj.Host,
        path: urlObj.Path,
        query: urlObj.QueryString,
        protocol: urlObj.Protocol,
        type: item.initiatorType,
        method,
        status: status || item.responseStatus,
        transferSize: item.transferSize,
        size: item.decodedBodySize || responseBodySize,
        dns: timeTranslate(item.domainLookupEnd - item.domainLookupStart),
        tcp: timeTranslate(item.connectEnd - item.connectStart),
        ssl: item.secureConnectionStart === 0 ? 0 : timeTranslate(item.connectEnd - item.secureConnectionStart),
        ttfb: timeTranslate(item.responseStart - item.requestStart),
        trans: timeTranslate(item.responseEnd - item.responseStart),
        firstbyte: timeTranslate(item.responseStart - item.domainLookupStart),
        loadType: 'network',
        duration: timeTranslate(item.duration),
        request: timeTranslate(item.responseStart - item.requestStart),
        response: isAllTrue(item.responseEnd, item.responseStart) ? timeTranslate(item.responseEnd - item.responseStart) : null,
        cache: timeTranslate(item.domainLookupStart - item.fetchStart),
        redirect: timeTranslate(item.redirectEnd - item.redirectStart),
        netType,
        nextHopProtocol: item?.nextHopProtocol,
        sessionType: 'user',
        resourceStartTime: highTime(performance.timeOrigin + item.startTime),
        resourceEndTime: highTime(performance.timeOrigin + item.startTime + item.duration),
        resourceTiming: item,
      };
      const resourceData: ResourceAndRequestInfoType = {
        ...resourceAndRequestEvent,
        ...userInfo,
        ...viewAttrs,
        ...sessionInfo,
        ...this.actionInfo(),
      };

      if (windowOrs.ubsData.scenes && status !== 200) {
        resourceData.scenes = windowOrs.ubsData.scenes;
      }
      return resourceData;
    } catch (error) {
      logReport('handleResourceData', error);
      return null;
    }
  }
}
