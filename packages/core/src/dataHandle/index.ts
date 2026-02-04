/* eslint-disable @typescript-eslint/ban-ts-comment */
// import { Tracer } from "@opentelemetry/api";
import getrandomNumber from '../utils/getrandomNumber';
import alias from '../alias';
import pkg from '../../package.json';
import { logReport } from '@/config';
import { ProjectInfoType, AliasBaseType, CollectStoreType } from '@/types/init';
import isKeyOfObject from '@/utils/isKeyOfObject';

const viewInfoKeys = [
  'view.type',
  'view.sub.type',
  'view.referrer',
  'view.url',
  'view.host',
  'view.path',
  'view.name',
  'view.page.title',
  'view.path.group',
  'view.url.query',
  'view.startTime',
  'view.endTime',
  'view.eventType',
];

export default class DataHandle {
  // public resourceSpans: any[] = [];
  private resource: Record<string, string> = {};
  private spanDataAttrs: any[] = [];
  // public currentSpanType = '';
  private projectInfo: ProjectInfoType | undefined;
  constructor(options: any) {
    this.initCommon(options);
  }
  // 初始化公共数据模板
  private initCommon(options: AliasBaseType) {
    for (const item in options) {
      if (isKeyOfObject(item, alias.base)) {
        this.resource[alias.base[item]] = options[item];
      }
    }
  }

  composeData(originSpan: readonly CollectStoreType[]) {
    try {
      const traceId = getrandomNumber(4);
      const spans: any[] = [];
      const viewInfoMap: Record<string, any> = {};

      originSpan.forEach((span) => {
        if (!span?.rumType) return;
        const attributes: Record<string, string> = {};
        const spanType = span.rumType.split('_')[1] as keyof typeof alias;
        let startTime = '';
        let endTime = '';
        // 将多条数据中的view信息提取出来
        const viewInfo: Record<string, string> = {};
        for (const key in span) {
          const singleAttr = this.transformSpanAttr(spanType, key, span[key as keyof typeof span]);

          if (viewInfoKeys.includes(singleAttr.key)) {
            viewInfo[singleAttr.key] = singleAttr.value;
          } else {
            attributes[singleAttr.key] = singleAttr.value;
          }

          if (singleAttr.key === 'view.id') {
            viewInfo['view.id'] = singleAttr.value;
          }

          if (!startTime && this.isTime(spanType, singleAttr.key, 'start')) {
            startTime = singleAttr.value;
          }

          if (!endTime && this.isTime(spanType, singleAttr.key, 'end')) {
            endTime = singleAttr.value;
          }
        }

        if (viewInfo['view.id']) {
          viewInfoMap[viewInfo['view.id']] = viewInfo;
        }

        if (!startTime) {
          startTime = String(Date.now() * 1000000);
        }

        if (!endTime) {
          endTime = String(Date.now() * 1000000);
        }

        spans.push({
          traceId: traceId,
          spanId: getrandomNumber(4),
          parentSpanId: getrandomNumber(4),
          name: attributes['rum.type'],
          startTimeUnixNano: startTime,
          endTimeUnixNano: endTime,
          attributes,
        });
      });

      return {
        resource: this.resource,
        spans,
        viewInfos: Object.keys(viewInfoMap).map((key) => viewInfoMap[key]),
      };
    } catch (error) {
      logReport('composeData', error);
      return;
    }
  }

  private isTime(type: string, key: string, timeType: 'start' | 'end') {
    if (timeType === 'start') {
      return key === `${type}.startTime` || key === `${type}.start.time`;
    } else {
      return key === `${type}.endTime` || key === `${type}.end.time`;
    }
  }

  spanData(spans: Array<any>) {
    try {
      this.spanDataAttrs = [];
      spans.forEach((span: any) => {
        const tempSpanAttrs: any[] = [];
        for (const key in span) {
          // this.currentSpanType = span.rumType;
          if (!span?.rumType) return;
          const spanType = span.rumType.split('_')[1];
          const singleAttr = this.spanFormatter(spanType, key, span[key]);
          tempSpanAttrs.push(singleAttr);
        }
        this.spanDataAttrs.push(tempSpanAttrs);
      });
    } catch (error) {
      logReport('spanData', error);
    }
  }

  // 单个span的格式化
  private transformSpanAttr(type: keyof typeof alias = 'resource', key: string, value: any) {
    return {
      key: (alias[type] as Record<string, string>)[key],
      value: typeof value === 'number' ? String(value) : value,
    };
  }

  spanFormatter(type: keyof typeof alias = 'resource', key: string, value: string) {
    const spanAttr = {
      key: (alias[type] as Record<string, string>)[key],
      value: {
        stringValue: typeof value === 'number' ? String(value) : value,
      },
    };
    return spanAttr;
  }

  dataConcat() {
    try {
      const spansData: any = [];
      const traceId = getrandomNumber(4);
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      this.spanDataAttrs.forEach((attr: []) => {
        const curentspanAttr = attr.find((item: any) => item.key === 'rum.type');
        // @ts-ignore
        const curentspanTypeAttr = curentspanAttr.value.stringValue;
        const startTimeAndEndTime = that.calculateTime(curentspanTypeAttr, attr);
        const spanAttr = {
          traceId: traceId,
          spanId: getrandomNumber(4),
          traceState: '',
          parentSpanId: getrandomNumber(4),
          name: curentspanTypeAttr,
          kind: 'SPAN_KIND_CLIENT',
          // @ts-ignore
          startTimeUnixNano: startTimeAndEndTime.startTime,
          // @ts-ignore
          endTimeUnixNano: startTimeAndEndTime.endTime,
        };
        spansData.push({
          ...spanAttr,
          attributes: attr,
        });
      });
      const baseScopeSpan = {
        scope: {
          name: 'ors_web',
          version: pkg.version,
          attributes: [],
        },
        spans: [],
        schemaUrl: '',
      };
      baseScopeSpan.spans = spansData;
      const baseData = {
        resource: this.resource,
        scopeSpans: [] as any[],
        schemaUrl: '',
      };
      baseData.scopeSpans.push(baseScopeSpan);
      return baseData;
    } catch (error) {
      logReport('dataConcat', error);
      return;
    }
  }
  calculateTime(type: string, dataAttrs: any[]) {
    try {
      let getType = '';
      if (type) {
        getType = type.split('_')[1];
      }
      const findStartTime = dataAttrs.find((item) => item.key === `${getType}.startTime` || item.key === `${getType}.start.time`);
      const findEndTime = dataAttrs.find((item) => item.key === `${getType}.endTime` || item.key === `${getType}.end.time`);
      let startTime: number | null = null;
      let endTime: number | null = null;
      findStartTime ? (startTime = findStartTime.value.stringValue) : (startTime = Date.now() * 1000000);
      findEndTime ? (endTime = findEndTime.value.stringValue) : (endTime = Date.now() * 1000000);

      return {
        startTime,
        endTime,
      };
    } catch (error) {
      logReport('calculateTime', error);
      return;
    }
  }

  setProjectInfo(projectInfo?: ProjectInfoType) {
    if (projectInfo) {
      this.projectInfo = projectInfo;
    }
  }
  getProjectInfo() {
    return this.projectInfo;
  }
}
