/** ORS SDK 标识 */
export const ORS_SDK_KEY = "ORS";

/** Logger 标识 */
export const ORS_SDK_LOGGER_KEY = ORS_SDK_KEY + "_Logger";

/** Logger 标识 */
export const ORS_ERROR_RETHROW = "_ors_error_rethrow_";

/** WindowExposeIntegration 集成的挂载点 */
export const ORS_WINDOW_EXPOSE_KEY = "_orsExpose";

/** ModuleMetadataIntegration 集成读取window数据的挂载点 */
export const ORS_WINDOW_METADATA_KEY = "_orsModuleMetadata";

/** console 拦截方法 */
export const CONSOLE_LEVEL = [
  "log",
  "info",
  "warn",
  "error",
  "debug",
  "assert",
  "trace",
] as const;

/** This may be mutated by the console instrumentation. */
export const originalConsoleLevel: Partial<{
  log(...args: Parameters<typeof console.log>): void;
  info(...args: Parameters<typeof console.info>): void;
  warn(...args: Parameters<typeof console.warn>): void;
  error(...args: Parameters<typeof console.error>): void;
  debug(...args: Parameters<typeof console.debug>): void;
  assert(...args: Parameters<typeof console.assert>): void;
  trace(...args: Parameters<typeof console.trace>): void;
}> = {};

// 浏览器 API 错误
export const DEFAULT_EVENT_TARGET = [
  "EventTarget",
  "Window",
  "Node",
  "ApplicationCache",
  "AudioTrackList",
  "BroadcastChannel",
  "ChannelMergerNode",
  "CryptoOperation",
  "EventSource",
  "FileReader",
  "HTMLUnknownElement",
  "IDBDatabase",
  "IDBRequest",
  "IDBTransaction",
  "KeyOperation",
  "MediaController",
  "MessagePort",
  "ModalWindow",
  "Notification",
  "SVGElementInstance",
  "Screen",
  "SharedWorker",
  "TextTrack",
  "TextTrackCue",
  "TextTrackList",
  "WebSocket",
  "WebSocketWorker",
  "Worker",
  "XMLHttpRequest",
  "XMLHttpRequestEventTarget",
  "XMLHttpRequestUpload",
];

/**
 * 错误类型枚举
 */
export class ErrorCategoryEnum {
  /**
   * js 错误
   */
  static get JS_ERROR() {
    return "js_error";
  }

  /**
   * 资源引用错误
   */
  static get RESOURCE_ERROR() {
    return "resource_error";
  }

  /**
   * Vue错误
   */
  static get VUE_ERROR() {
    return "vue_error";
  }

  /**
   * promise 错误
   */
  static get PROMISE_ERROR() {
    return "promise_error";
  }

  /**
   * ajax异步请求错误
   */
  static get AJAX_ERROR() {
    return "ajax_error";
  }

  /**
   * 控制台错误console.info
   */
  static get CONSOLE_INFO() {
    return "console_info";
  }

  /**
   * 控制台错误console.warn
   */
  static get CONSOLE_WARN() {
    return "console_warn";
  }

  /**
   * 控制台错误console.error
   */
  static get CONSOLE_ERROR() {
    return "console_error";
  }

  /**
   * 跨域js错误
   */
  static get CROSS_SCRIPT_ERROR() {
    return "cross_srcipt_error";
  }

  /**
   * 未知异常
   */
  static get UNKNOW_ERROR() {
    return "unknow_error";
  }

  /**
   * 性能上报
   */
  static get PERFORMANCE() {
    return "performance";
  }

  /**
   * 网速上报
   */
  static get NETWORK_SPEED() {
    return "network_speed";
  }
}

/**
 * 错误level枚举
 */
export class ErrorLevelEnum {
  /**
   * 错误信息
   */
  static get ERROR() {
    return "Error";
  }

  /**
   * 警告信息
   */
  static get WARN() {
    return "Warning";
  }

  /**
   * 日志信息
   */
  static get INFO() {
    return "Info";
  }
}

/**
 * Ajax库枚举
 */
export class AjaxLibEnum {
  static get AXIOS() {
    return "axios";
  }
  static get DEFAULT() {
    return "default";
  }
}

/**
 * DEFAULT_IGNORE_ERRORS
 */
// "Script error." is hard coded into browsers for errors that it can't read.
// this is the result of a script being pulled in from an external domain and CORS.
export const DEFAULT_IGNORE_ERRORS = [
  /^Script error\.?$/,
  /^Javascript error: Script error\.? on line 0$/,
  /^ResizeObserver loop completed with undelivered notifications.$/, // The browser logs this when a ResizeObserver handler takes a bit longer. Usually this is not an actual issue though. It indicates slowness.
  /^Cannot redefine property: googletag$/, // This is thrown when google tag manager is used in combination with an ad blocker
  /^Can't find variable: gmo$/, // Error from Google Search App https://issuetracker.google.com/issues/396043331
  /^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/, // Random error that happens but not actionable or noticeable to end-users.
  'can\'t redefine non-configurable property "solana"', // Probably a browser extension or custom browser (Brave) throwing this error
  "vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)", // Error thrown by GTM, seemingly not affecting end-users
  "Can't find variable: _AutofillCallbackHandler", // Unactionable error in instagram webview https://developers.facebook.com/community/threads/320013549791141/
  /^Non-Error promise rejection captured with value: Object Not Found Matching Id:\d+, MethodName:simulateEvent, ParamCount:\d+$/, // unactionable error from CEFSharp, a .NET library that embeds chromium in .NET apps
  /^Java exception was raised during method invocation$/, // error from Facebook Mobile browser (https://github.com/getsentry/sentry-javascript/issues/15065)
];
