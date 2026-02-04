import ErrorBase from './error';
import { logReport } from '@/config';
import type { ProjectInfoType, SessionParams } from '@/types/init';
import { windowOrs } from '@/store/windowOrs';
import { extractExceptionKeysForMessage } from '@/utils/object';
import { isError, isErrorEvent, isErrorLike, isPlainObject } from '@/utils/is';
import type { SeverityLevel, Mechanism } from '@/types/error';
import { isString } from '@/utils/isType';
/**
 * 手动捕获异常
 */
class CaptureError extends ErrorBase {
  private static instance: CaptureError;
  constructor(params: SessionParams) {
    super(params);
  }

  public static getInstance(params?: SessionParams) {
    if (!CaptureError.instance) {
      if (!params) {
        throw new Error('[ors-sdk] CaptureError not initialized');
      }
      CaptureError.instance = new CaptureError(params);
    }
    return CaptureError.instance;
  }
  // 手动上报Exception
  captureException(
    exception: unknown,
    options: {
      projectInfo?: ProjectInfoType;
      errorType?: string;
      mechanism?: Mechanism;
    } = {}
  ) {
    try {
      const { message, error } = this.normalizeException(exception);
      const errorSubType = options.errorType || 'generic'; // 错误类型
      const mechanism = options.mechanism || {
        handled: true,
        type: 'generic',
      };
      // 根据采样率判断是否上报
      if (windowOrs.samplingConfig?.jsError) {
        this.recordError({
          message,
          error,
          errorSubType,
          mechanism,
          projectInfoParams: options.projectInfo,
        });
      }
    } catch (err) {
      logReport('captureException', err);
    }
  }

  normalizeException(exception: unknown): {
    message: string;
    error?: Error | string | object | undefined;
    mechanism?: Mechanism;
  } {
    try {
      // 1. Error 实例
      if (isError(exception)) {
        return {
          message: exception?.message || exception?.name,
          error: exception,
        };
      }

      if (isErrorLike(exception)) {
        return {
          message: exception?.message,
          error: exception,
        };
      }

      // 2. 对象
      if (isPlainObject(exception)) {
        const errorFromProp = this.getErrorPropertyFromObject(exception);
        if (errorFromProp) {
          return { message: errorFromProp?.message, error: errorFromProp };
        }
        const message = this.getMessageForObject(exception);
        const error = new Error(message);
        return {
          message,
          error,
        };
      }

      // 3. string / boolean / null / undefined / 其他
      return {
        message: `${exception}`,
      };
    } catch (e) {
      logReport('normalizeException', e);
      return {
        message: `${exception}`,
      };
    }
  }

  getMessageForObject(exception: Record<string, unknown>): string {
    try {
      if ('name' in exception && typeof exception.name === 'string') {
        let message = `'${exception.name}' captured as exception`;

        if ('message' in exception && typeof exception.message === 'string') {
          message += ` with message '${exception.message}'`;
        }

        return message;
      } else if ('message' in exception && typeof exception.message === 'string') {
        return exception.message;
      }

      const keys = extractExceptionKeysForMessage(exception);

      // Some ErrorEvent instances do not have an `error` property, which is why they are not handled before
      // We still want to try to get a decent message for these cases
      if (isErrorEvent(exception)) {
        return `Event \`ErrorEvent\` captured as exception with message \`${exception.message}\``;
      }

      const className = this.getObjectClassName(exception);

      return `${className && className !== 'Object' ? `'${className}'` : 'Object'} captured as exception with keys: ${keys}`;
    } catch (e) {
      logReport('getMessageForObject', e);
      return 'Object captured as exception with keys';
    }
  }

  getObjectClassName(obj: unknown): string | undefined | void {
    try {
      const prototype: unknown | null = Object.getPrototypeOf(obj);
      return prototype ? prototype.constructor.name : undefined;
    } catch (e) {
      logReport('getObjectClassName', e);
      return undefined;
    }
  }

  /** If a plain object has a property that is an `Error`, return this error. */
  getErrorPropertyFromObject(obj: Record<string, unknown>): Error | undefined {
    try {
      for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          const value = obj[prop];
          if (value instanceof Error) {
            return value;
          }
        }
      }

      return undefined;
    } catch (e) {
      logReport('getErrorPropertyFromObject', e);
      return undefined;
    }
  }

  // 手动上报Message
  captureMessage(
    message: string,
    options: {
      level?: SeverityLevel;
      projectInfo?: ProjectInfoType;
      errorType?: string;
      mechanism?: Mechanism;
    } = {}
  ) {
    try {
      const { message: msg, error } = isString(message) ? { message } : this.normalizeException(message);
      const mechanism = options.mechanism || {
        handled: true,
        type: 'generic',
      };
      // 根据采样率判断是否上报
      if (windowOrs.samplingConfig?.jsError) {
        this.recordError({
          message: msg,
          error,
          errorSubType: options.errorType || 'generic',
          mechanism,
          level: options?.level,
          projectInfoParams: options.projectInfo,
        });
      }
    } catch (e) {
      logReport('captureMessage', e);
    }
  }
}
export default CaptureError;
