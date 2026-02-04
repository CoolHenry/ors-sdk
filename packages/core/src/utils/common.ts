import { logReport } from "@/config";
import { InitLogType } from "@/types/init";
import { ORS_SDK_LOGGER_KEY } from "@/constant";
export function getPathName(pathname: string): string {
  return pathname && typeof pathname === "string"
    ? pathname.includes("#")
      ? pathname.replace(/^#\/?/, "/")
      : pathname
    : "";
}

export function parsePattern(pattern: string | RegExp) {
  try {
    if (pattern instanceof RegExp) {
      return pattern;
    }
    if (typeof pattern === "string") {
      // 匹配形如 `/xxx/flags`
      const regexMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
      if (regexMatch) {
        return new RegExp(regexMatch[1], regexMatch[2]); // 转成真正的正则
      }
      return pattern; // 普通字符串
    }
    return pattern;
  } catch (error) {
    logReport("parsePattern", error);
    return pattern;
  }
}

export function JSONstringify(data: unknown): string {
  try {
    if (data === undefined) {
      logReport("JSONstringify", "Unsupported type: undefined ");
      return ""; // 或者 return JSON.stringify(data); // null 是可以的，但 undefined 不行
    }
    // 手动处理不可序列化的类型
    if (typeof data === "symbol") {
      logReport("JSONstringify", "Unsupported type: symbol");
      return "";
    }
    // 手动处理不可序列化的类型
    if (typeof data === "function") {
      logReport("JSONstringify", "Unsupported type:  function");
      return "";
    }
    return JSON.stringify(data, getCircularReplacer());
  } catch (error) {
    logReport("JSONstringify", error);
    return "";
  }
}
function getCircularReplacer() {
  try {
    const seen = new WeakSet();
    return (_key: any, value: WeakKey | null) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    };
  } catch (error) {
    logReport("getCircularReplacer", error);
    // 返回默认的空replacer，确保必有返回值
    return (_key: any, value: any) => value;
  }
}

//包装console.log，让使用方自行控制是否打印日志
export class Logger {
  private static debug = false;
  private static initialized = false;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}
  // 新增公共访问方法
  public static getIsLog() {
    return this.debug;
  }
  public static setInitialized(value: boolean) {
    return (this.initialized = value);
  }
  static init(options?: InitLogType) {
    if (!this.initialized) {
      this.debug = options?.debug || false;
      this.initialized = true;
    }
  }
  static log(...attributes: any[]) {
    if (this.debug && Array.isArray(attributes)) {
      console.log(`${ORS_SDK_LOGGER_KEY}`, ...attributes);
    }
  }
  static warn(...attributes: any[]) {
    if (this.debug && Array.isArray(attributes)) {
      console.warn(`${ORS_SDK_LOGGER_KEY}`, ...attributes);
    }
  }
}
