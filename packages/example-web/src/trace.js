//火山引擎
// window?.apmPlus('init', {
//   aid: 710428,
//   token: 'ded66e493950417b86d5d7c260cf78eb',
//   plugins: {
//     pageview: {
//       routeMode: 'hash',
//     },
//     blankScreen: {
//       autoDetect: true,
//       rootSelector: '#app',
//     },
//   },
// });
// window?.apmPlus('start');

// setTimeout(() => {
//   window._ors.getNowTime('FMP');
// }, 2000);

// initSentry();
// Sentry
function initSentry() {
  Sentry &&
    Sentry.init({
      dsn: "https://7a074fe0b35f479288926b947fec91cf@sentry-relay.msxf.com/309",
      // environment: 'dev',
      // 缺少关键配置会导致手动捕获失效
      // attachStacktrace: true, // 必须开启
      debug: true, // 开启内部日志
      // release: process.env.SENTRY_VERSION,
      integrations: [
        new Sentry.BrowserTracing({
          idleTimeout: 5000,
          finalTimeout: 10000,
          //   routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        }),
      ],
      //   integrations: function (integrations) {
      //     // integrations will be all default integrations
      //     return integrations.filter(function (integration) {
      //       return integration.name !== 'Dedupe';
      //     });
      //   },
      sampleRate: 1,
      tracesSampleRate: 1,
      // 忽略异常chunk加载异常、fetch请求异常
    });
}

// ORS
initOrs();

initSentry10();

function initOrs() {
  window._ors.initObserve({
    name: "ors-sdk-demo",
    version: localStorage.getItem("_orsVersion") || "1.0.2",
    projectId: localStorage.getItem("_orsProjectId") || 13100085,
    server:
      localStorage.getItem("_orsServer") ||
      "http://ors-collector-ctest3.msxf.msxfyun.test",
    responseBodySize: true,
    plugins: {
      blankScreen: {
        autoDetect: true,
        rootSelector: [".white"], // 根元素选择器
      },
    },
    debug: true,
  });

  window._ors.setUser({ userEmail: "hs@xly.com", userId: "1234567" });
}
initPromiseErrorBeforeInitSdk();

initErrorBeforeInitSdk();
function initErrorBeforeInitSdk() {
  eventBeforeInitSdk.error;
}
function initPromiseErrorBeforeInitSdk() {
  Promise.reject("eventBeforeInitSdk.promiseError");
}

// Sentry
function initSentry10() {
  Sentry.setTag("envName", "dev");

  Sentry &&
    Sentry.init({
      dsn: "https://7a074fe0b35f479288926b947fec91cf@sentry-relay.msxf.com/309",
      integrations: [Sentry.browserTracingIntegration()],
      sampleRate: 1,
      tracesSampleRate: 1.0,
      // 忽略异常chunk加载异常、fetch请求异常
    });
}
