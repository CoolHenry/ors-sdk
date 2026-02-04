import Base from '../base';
import { logReport, SamplingManager } from '@/config';
import getrandomNumber from '@/utils/getrandomNumber';
import { CONSOLE_LEVEL, originalConsoleLevel } from '@/constant';
import { ConsoleLevelType } from '@/types/init';
import { getGlobalObject } from '@/utils/browserSupport';
import { fill } from '@/utils/fill';
import highTime from '@/utils/highTime';
import { userInfoStore, windowOrs, Breadcrumbs } from '@/store';
import type { UserAttrsInfo, SessionInfosType, ViewAttrsType, ConsoleEventType, ConsoleInfoType, SessionParams } from '@/types/init';
import { MonitorDestroyReason } from '@/types/lifecycle';
import { ORS_SDK_LOGGER_KEY } from '@/constant';
import { isString } from '@/utils/isType';
import { sdkLifeTimeEmitter } from '@/utils/mitt';
import { truncate } from '@/utils/string';

export default class ConsoleCollect extends Base {
  public params = {};
  constructor(params: SessionParams) {
    super(params);
    this.params = params;
    this.monitorDestroy();
  }
  private monitorDestroy() {
    sdkLifeTimeEmitter.on('monitorDestroy', (reason: MonitorDestroyReason) => {
      switch (reason) {
        case 'sdk:teardown':
          this.destroyConsoleWrapper();
          break;
        default:
          break;
      }
    });
  }
  initConsole() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      const GLOBAL_OBJ = getGlobalObject();
      if (typeof window === 'undefined' || !('console' in GLOBAL_OBJ)) return;
      CONSOLE_LEVEL.forEach((level: ConsoleLevelType) => {
        if (!(level in GLOBAL_OBJ.console)) {
          return;
        }

        fill(GLOBAL_OBJ.console, level, function (originalConsoleMethod: (...args: any[]) => any): (...args: any[]) => void {
          originalConsoleLevel[level] = originalConsoleMethod;

          return function (...args: any[]): void {
            try {
              const startTime = highTime(performance.timeOrigin + performance.now());
              const log = originalConsoleLevel[level];
              log?.apply(GLOBAL_OBJ.console, args);
              const endTime = highTime(performance.timeOrigin + performance.now());
              // sdk内部日志不进行上报
              const isSdkLogger = args.some((e) => isString(e) && e?.includes(ORS_SDK_LOGGER_KEY));
              if (isSdkLogger) return;
              that.reportConsole(level, startTime, endTime, args);
            } catch (e) {
              logReport('consoleExecute', e);
            }
          };
        });
      });
    } catch (error) {
      logReport('initConsole', error);
    }
  }
  reportConsole(level: string, startTime: number, endTime: number, args: any[]) {
    try {
      const id = getrandomNumber(32);
      const consoleEvent: ConsoleEventType = {
        rumType: 'ors_console',
        id,
        level,
        args: this.serializeArgs(args),
        startTime,
        endTime,
      };
      const sessionInfo: SessionInfosType = this.getSessionInfo();
      const viewAttrs: ViewAttrsType = windowOrs.orsViewAttrs;
      const userInfo: UserAttrsInfo = userInfoStore.get() as UserAttrsInfo;
      const consoleInfo: ConsoleInfoType = {
        ...consoleEvent,
        ...userInfo,
        ...sessionInfo,
        ...viewAttrs,
        ...this.actionInfo(),
      };
      /** 根据采样率判断是否需要上报操作数据，如果需要就上报，否则只采集数据 */
      const isRateDrop = SamplingManager.decide({ rumType: 'ors_console' }) === 'drop';
      if (isRateDrop) {
        // 采集的数据存入store
        Breadcrumbs.add(consoleInfo);
      }
      this.reportData([consoleInfo]);
    } catch (e) {
      logReport('reportConsole', e);
    }
  }
  serializeArgs(args: any[]) {
    try {
      return args.map((arg) => this.safePreview(arg));
    } catch (error) {
      logReport('serializeArgs', error);
      return [];
    }
  }

  safePreview(value: any) {
    try {
      // Error 处理
      if (value instanceof Error) {
        return value.stack || value.message;
      }

      const type = typeof value;

      // 基础类型
      if (type === 'string') return truncate(value, 500);
      if (type === 'number' || type === 'boolean' || value == null) return String(value);

      // DOM 节点
      if (value instanceof Node) {
        // 新增类型判断
        if (value.nodeType === Node.ELEMENT_NODE && value instanceof Element) {
          return `<${value.nodeName.toLowerCase()} ` + `id="${value.id || ''}" ` + `class="${value.className || ''}">`;
        } else {
          return `[Node: ${value.nodeName}]`;
        }
      }

      // Event 对象
      if (value instanceof Event) {
        return `[${value.constructor.name} type="${value.type}"]`;
      }

      // Function
      if (typeof value === 'function') {
        return `[function ${value.name || 'anonymous'}]`;
      }

      // Promise / Map / Set / WeakMap 等不适合展开
      const tag = Object.prototype.toString.call(value);
      const simpleTags = ['[object Promise]', '[object Map]', '[object Set]', '[object WeakMap]', '[object WeakSet]'];
      if (simpleTags.includes(tag)) return tag;

      // 是否是全局对象
      if (value === window) return '[Window]';
      if (value === document) return '[Document]';
      if (value === Proxy) return '[Proxy]';

      // 对象：进行有限递归预览
      return this.previewObject(value);
    } catch (error) {
      logReport('safePreview', error);
      return '[unserializable]';
    }
  }

  // 仅预览对象前 N 个 key，防止遍历巨大结构导致 OOM
  previewObject(obj: any, depth = 0): string {
    try {
      const maxDepth = 2; // 限制最大深度
      const maxKeys = 5; // 限制 key 数量

      if (depth > maxDepth) return '...';

      if (obj == null) return 'null';

      const keys = Object.keys(obj).slice(0, maxKeys);

      const result: Record<string, any> = {};
      for (const key of keys) {
        try {
          const val = obj[key];

          if (typeof val === 'object' && val !== null) {
            result[key] = this.previewObject(val, depth + 1);
          } else {
            result[key] = truncate(String(val), 200);
          }
        } catch {
          result[key] = '[unserializable]';
        }
      }

      return JSON.stringify(result);
    } catch (error) {
      logReport('previewObject', error);
      return '[unserializable]';
    }
  }

  // 销毁监听
  destroyConsoleWrapper() {
    try {
      const GLOBAL_OBJ = getGlobalObject();
      if (typeof window === 'undefined' || !('console' in GLOBAL_OBJ)) return;
      CONSOLE_LEVEL.forEach((level: ConsoleLevelType) => {
        if (!(level in GLOBAL_OBJ.console)) {
          return;
        }
        GLOBAL_OBJ.console[level] = originalConsoleLevel[level];
      });
    } catch (error) {
      logReport('destroyConsoleWrapper', error);
    }
  }
}
