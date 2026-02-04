window.onload = function () {
  /**测试load时间过长 */
  //   const start = performance.now();
  //   while (performance.now() < start + 10000) {}
  //   [1, 2].forEach((e) => {
  //     handleNetwork('http://172.17.50.20:3001', 'GET', { project: `ors${e}`, type: 'normal' });
  //   });

  //初始化操作
  init();
};

window.addEventListener("hashchange", () => {
  loadScript("https://cdn.example.com/external-script.js");
  loadScript("./js/apmPlus.js");
  [1, 2].forEach((e) => {
    handleNetwork("http://172.17.50.20:3002", "POST", {
      project: `ors${e}`,
      type: "normal",
    });
  });
});

function init() {
  // 浏览器API Error
  document
    .querySelector("#jsErrorAddEventListener")
    .addEventListener("click", () => {
      throw new Error("browwer-api: DOM error");
    });
  const obj = {
    handleEvent() {
      throw new Error("browwer-api: handleEvent error");
    },
  };
  document.querySelector("#jsErrorHandleEvent").addEventListener("click", obj);

  //cls
  getClsMetric();

  // 自定义标签
  const customerTagTextarea = document.querySelector("#customerTagTextarea");
  const defaultData = {
    terminalType: "小程序",
    MSEnvName: "test",
    ip_address: "10.0",
    userId: "123",
    lowcodePlatform: "低码平台",
    lowcodeProject: "所有应用",
    lowcodeProjectName: "应用1",
  };
  // 将对象转为格式化的 JSON 字符串（缩进2个空格，更美观）
  customerTagTextarea &&
    (customerTagTextarea.value = JSON.stringify(defaultData, null, 2));
}

/** CLS */
function getClsMetric() {
  setTimeout(() => {
    document.querySelector("#cls").style.position = "relative";
    document.querySelector("#cls").style.top = "40px";
  }, 500);
}

/** longtask */
function handleLongTask() {
  const statrt = performance.now();
  while (performance.now() - statrt < 1000) {
    //busy loop
  }
}

function loadScript(url, callback) {
  const script = document.createElement("script");
  script.src = url;
  script.crossorigin = "anonymous";
  script.onload = callback; // 加载成功回调
  script.onerror = () => console.error(`Failed to load script: ${url}`);
  document.head.appendChild(script);
}

function loadImg(url, callback) {
  const img = document.createElement("img");
  img.src = url;
  img.crossorigin = "anonymous";
  img.onload = callback; // 加载成功回调
  img.onerror = () => console.error(`Failed to load img: ${url}`);
  document.head.appendChild(img);
}

function loadCSS(href, callback) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = href;

  // 可选：监听加载成功事件（部分浏览器支持）
  link.onload = function () {
    console.log(`CSS 文件加载成功: ${href}`);
    if (typeof callback === "function") {
      callback(null, link); // 成功时，第一个参数为 null
    }
  };

  // 可选：监听加载失败事件（部分浏览器支持）
  link.onerror = function () {
    console.error(`CSS 文件加载失败: ${href}`);
    if (typeof callback === "function") {
      callback(new Error(`Failed to load CSS: ${href}`), link);
    }
  };

  // 将 <link> 标签插入到 <head> 中
  document.head.appendChild(link);
}

function loadImage(url) {
  // 创建 Image 对象
  const img = new Image();

  // 设置 GIF 路径
  img.src = url;

  // 可选：设置替代文本
  img.alt = "动态加载的GIF图片";

  // 加载完成回调
  img.onload = function () {
    console.log("GIF加载完成");
  };

  // 错误处理
  img.onerror = function () {
    console.error("GIF加载失败");
  };
}
function handleGetStatic() {
  // loadScript('index666.js', () => {
  //   console.log('Script loaded!');
  // });
  loadImage(
    "https://sadataapi.msxf.com/sa.gif?project=production&data=eyJpZGVudGl0aWVzIjp7IiRpZGVudGl0eV9jb29raWVfaWQiOiIxOThjYjM4ZThiYzgwNi0wMGVjNTVhZjNiNThkODU4LTI2MDAxYzUxLTEwMjQwMDAtMTk4Y2IzOGU4YmRkMiJ9LCJkaXN0aW5jdF9pZCI6IjE5OGNiMzhlOGJjODA2LTAwZWM1NWFmM2I1OGQ4NTgtMjYwMDFjNTEtMTAyNDAwMC0xOThjYjM4ZThiZGQyIiwibGliIjp7IiRsaWIiOiJqcyIsIiRsaWJfbWV0aG9kIjoiY29kZSIsIiRsaWJfdmVyc2lvbiI6IjEuMjYuNCJ9LCJwcm9wZXJ0aWVzIjp7IiR0aW1lem9uZV9vZmZzZXQiOi00ODAsIiRzY3JlZW5faGVpZ2h0Ijo5MTQsIiRzY3JlZW5fd2lkdGgiOjQxMiwiJHZpZXdwb3J0X2hlaWdodCI6OTE0LCIkdmlld3BvcnRfd2lkdGgiOjQxMiwiJGxpYiI6ImpzIiwiJGxpYl92ZXJzaW9uIjoiMS4yNi40IiwiJGxhdGVzdF90cmFmZmljX3NvdXJjZV90eXBlIjoi55u05o6l5rWB6YePIiwiJGxhdGVzdF9zZWFyY2hfa2V5d29yZCI6IuacquWPluWIsOWAvF%2Fnm7TmjqXmiZPlvIAiLCIkbGF0ZXN0X3JlZmVycmVyIjoiIiwicGFnZV9uYW1lIjoi5re75LiA56yU5rWL6K%2BE6aG1IiwiYXBwX2tleSI6IkFZSF9BTkRST0lEIiwiY2hhbm5lbF9jb2RlIjoiNTIwMDAwMDIiLCJwcm9kdWN0X2NvZGUiOiI1MTAzIiwibWVtYmVyX2lzX2xvZ2luIjoyLCJtZW1iZXJfdXNlcnR5cGUiOiLmnKrnn6UiLCJidXNpbmVzc190eXBlIjoi5rWL5LiA5rWLIiwicF9pZCI6InR5YmNweSIsIm1faWQiOiJ3MzA4MyIsInRfaWQiOiJ3MzM4MSIsInNfaWQiOiJ3MzM4OCIsImVfaWQiOiJ3MzI4NCIsInNjZW5lcyI6Iua1i%2BS4gOa1iyIsInNjZW5lX3N0YXRlIjoi5re75LiA56yU5rWL6K%2BEIiwibmV3X29yX29sZF9zeXN0ZW0iOiJuZXciLCIkaXNfZmlyc3RfZGF5Ijp0cnVlLCIkdXJsIjoiaHR0cHM6Ly9reS5tc3hmLmNvbS9yb3V0ZXIvcXVpei9ob21lL19oL2FkZFN0cm9rZSIsIiR0aXRsZSI6Iua3u%2BS4gOeslOa1i%2BivhOmhtSJ9LCJhbm9ueW1vdXNfaWQiOiIxOThjYjM4ZThiYzgwNi0wMGVjNTVhZjNiNThkODU4LTI2MDAxYzUxLTEwMjQwMDAtMTk4Y2IzOGU4YmRkMiIsInR5cGUiOiJ0cmFjayIsImV2ZW50IjoicGFnZV92aWV3IiwidGltZSI6MTc1NTc1NjYxNTUxMywiX3RyYWNrX2lkIjo0MTA1NjU1MTYsIl9mbHVzaF90aW1lIjoxNzU1NzU2NjE1NTE2fQ%3D%3D&ext=crc%3D-211412473",
  );
}
function simulateUnload() {
  let scriptEle = document.createElement("script");
  scriptEle.src = "http://xxx" + getRandomLetter() + ".index.js";
  document.head.appendChild(scriptEle);
  setTimeout(() => {
    window.dispatchEvent(new Event("beforeunload"));
    window.close(); // 尝试关闭页面（可能被浏览器阻止）
  }, 1000);
}

function getRandomLetter() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const randomIndex = Math.floor(Math.random() * letters.length);
  return letters[randomIndex];
}

function handleJsError(e) {
  console.log("错误日志2", window.b[getRandomLetter()]);
  // console.log('错误日志',window.a.b)
  console.log("11111111");
}

function handleJsError2(e) {
  // console.error('1213131')
  console.log("错误日志", window.a.b);
}
function handlePromiseError(err) {
  // console.error('1213131')
  Promise.reject(err);
}

function handleBrowserApiError(type) {
  let timer = null;
  if (type === "setTimeout") {
    timer = setTimeout(() => {
      clearTimeout(timer);
      throw new Error("browwer-api: timeout error");
      //   Promise.resolve().then(() => {
      //     throw new Error('browwer-api: promise in timer error');
      //   });
    });
  } else if (type === "setInterval") {
    timer = setInterval(() => {
      clearInterval(timer);
      throw new Error("browwer-api: interval error");
    }, 0);
  } else if (type === "requestAnimationFrame") {
    requestAnimationFrame(() => {
      JSON.parse("{");
      //   throw new Error('browwer-api: requestAnimationFrame error');
    });
  } else if (type === "xhrOnload") {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      xhr.response.a.b.c;
    };
    // xhr.onreadystatechange = function () {
    //   if (xhr.readyState === 4) {
    //     throw new Error('browwer-api: onreadystatechange error');
    //   }
    // };
    xhr.open("GET", "/api/v1/test/test");
    xhr.send();
  }
}
function handleJsError3(e) {
  const imageUrl =
    "http://ors-portal-ctest3.msxf.msxfyun.test/assets/ors_logo-BKKFNsT6.svg";
  const img = document.createElement("img");
  img.src = imageUrl; // 设置图片的源地址
  img.alt = "示例图片"; // 设置图片的描述
  img.style.width = "300px"; // 设置图片宽度（可选）
  img.style.height = "auto"; // 设置图片高度（可选）
  document.body.appendChild(img);
}

//同域请求404img
function handleJsError4() {
  loadImg("aaa.png");
}

//跨域域请求404img
function handleJsError6() {
  loadImg("http://localhost:3006/notfound");
}

function handleJsError5(e) {
  let appInfo = null;
  if (window.MDPWebViewJavascriptBridge) {
    console.log("有MDPWebViewJavascriptBridge");
    window.MDPWebViewJavascriptBridge.abc;
    console.log(
      "abcabc::",
      window.MDPWebViewJavascriptBridge.nativeInfo,
      "111",
      typeof window.MDPWebViewJavascriptBridge.abc,
    );
    if (typeof window.MDPWebViewJavascriptBridge.nativeInfo == "function") {
      appInfo = JSON.parse(
        window.MDPWebViewJavascriptBridge?.nativeInfo() || "{}",
      );
      console.log("调起了MDPWebViewJavascriptBridge", appInfo);
    } else {
      appInfo = window.MDPWebViewJavascriptBridge.nativeInfo;
    }
  } else {
    console.log("没有MDPWebViewJavascriptBridge");
  }
  console.log("appInfo::", appInfo);
}

function handleJsErrorReport(e) {
  // console.error('1213131')
  // window._ors.openWhiteScreen(
  //   (res) => {
  //     console.log('ressss::', res);
  //   },
  //   {
  //     skeletonProject: false,
  //     whiteBoxElements: ['.white'],
  //   }
  // );
  window._ors.logReport("toReport", new Error("handleJsErrorReport"));
}

function getManualError() {
  const manualErrorSel = document.querySelector("#manualError-sel");
  const type = manualErrorSel.value;
  let manualError = null;

  switch (type) {
    case "Error":
      manualError = new Error("Manule Error");
      break;
    case "String":
      manualError = "to be or not to be this is a question";
      break;
    case "Number":
      manualError = 1234567889965551323558742123255998552321415455;
      break;
    case "Boolean":
      manualError = true;
      break;
    case "Object":
      manualError = { abc: 111 };
      break;
    default:
      manualError = new Error("Manule Error");
  }
  return manualError;
}
//主动上报异常
function orsCaptureException() {
  window._ors.withScope((scope) => {
    scope.setExtra("extraData", { version: "1.1.0", sdk: "ORS" });
    const manualError = getManualError();
    window._ors.captureException(manualError);
  });
}
function orsCaptureMessage() {
  const manualError = getManualError();
  window._ors.captureMessage(manualError);
}

//Sentry 主动上报异常exception
function sentryCaptureException() {
  //   Sentry.withScope((scope) => {
  Sentry.setExtra("extraData", { version: "1.1.1", sdk: "Sentry" });
  const manualError = getManualError();
  Sentry.captureException(manualError);
  //   });
}
//Sentry 主动上报异常Message
function sentryCaptureMessage() {
  const manualError = getManualError();
  Sentry.captureMessage(manualError);
}

function handleNetwork(url, method, params, requestType = "xhr") {
  // 将参数编码为查询字符串
  const queryString = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
    )
    .join("&");
  // 拼接完整 URL
  const reqUrl = method === "GET" ? `${url}?${queryString}` : url;

  //XMLrequest
  if (requestType === "xhr") {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open(method, reqUrl);
    // 添加响应处理逻辑
    xhr.onload = function () {
      if (xhr.status === 200) {
        console.log("响应数据:", xhr.response); // 打印完整响应对象
        console.log("状态码:", xhr.status);
        console.log("响应头:", xhr.getAllResponseHeaders());
      } else {
        console.error(
          "请求失败:",
          "xhr:",
          xhr,
          "status:",
          xhr.status,
          "statusText:",
          xhr.statusText,
        );
      }
    };

    // 添加错误处理
    xhr.onerror = function () {
      console.error("请求发生错误:", xhr.status, xhr.statusText);
    };
    xhr.send(method === "GET" ? null : JSON.stringify(params)); // GET 请求必须传 null
  } else {
    //fetch
    const body = method === "GET" ? {} : { body: JSON.stringify(params) };
    window
      .fetch(reqUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        ...body,
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("fetch-data::", data);
      })
      .catch((e) => {
        console.log("fetch-error::", e);
      });
  }
}

function handleNetworkError(e) {
  console.log("111111");
  axios({
    method: "get", // 1. 使用get的请求方式
    // url: 'http://ors-collector-ctest3.msxf.msxfyun.test/api/v2/configs/rum1333' + getRandomLetter(), // 2. 输入请求网址
    url: "http://ors-portal-ctest3.msxf.msxfyun.test/ors-boss/v1/rum/metric/h5_view/list",
  }).then((res) => {
    // 3.控制台输出请求结果
    console.log(res.data);
  });
}

function handleNetworkErrorPost(e) {
  axios({
    method: "post", // 1. 使用get的请求方式
    data: {
      aa: "1111",
      bb: "2222",
      cc: "3333",
    },
    url:
      "http://ors-collector-ctest3.msxf.msxfyun.test/api/v2/configs/rum2" +
      getRandomLetter(), // 2. 输入请求网址
  })
    .then((res) => {
      // 3.控制台输出请求结果
      console.log(res.data);
    })
    .catch((e) => {
      console.log("error::", e);
    });
}

function handleResErrorReport(e) {
  let scriptEle = document.createElement("script");
  scriptEle.src = "http://xxx" + getRandomLetter() + ".index.js";
  document.head.appendChild(scriptEle);
}

function handleCorsErrorReport(e) {
  axios({
    method: "post", // 1. 使用get的请求方式
    // url: 'https://ugw-marketing.msxf.com/participant/api/v1/divination/user/auth/query', // 2. 输入请求网址
    url: "http://172.17.50.20:3001", // 2. 输入请求网址
  })
    .then(() => {})
    .catch(() => {});
}

function handleCustomerTagReport(e) {
  // 自定义标签
  const customerTagTextarea = document.querySelector("#customerTagTextarea");
  if (
    customerTagTextarea.value &&
    typeof customerTagTextarea.value === "string"
  ) {
    const customerTagTextareaVal = JSON.parse(customerTagTextarea.value);
    window._ors.setTag(customerTagTextareaVal);
  }
}

function handleRedictDuration() {
  const img = new Image();
  img.src = "http://172.17.50.20:3001/status/302";
  img.onload = () => {
    const entries = performance.getEntriesByType("resource");
    const entry = entries.find((e) => e.name.includes("/redirect"));
    if (entry) {
      console.log("redirectStart:", entry.redirectStart);
      console.log("redirectEnd:", entry.redirectEnd);
      console.log("重定向耗时:", entry.redirectEnd - entry.redirectStart, "ms");
    }
  };
}
function handleRetryStatic() {
  loadScript("../js/axios.min.js");
  loadCSS("../css/index.css");
}

function handleSendHttps() {
  axios({
    method: "POST", // 1. 使用get的请求方式
    data: {
      aa: "1111",
      bb: "2222",
      cc: "3333",
    },
    url: "https://172.17.50.20:8443", // 2. 输入请求网址
  });
}
function handleConsole(type, log) {
  const logSel = document.querySelector("#log-sel");
  const logType = logSel.value;

  let logMsg = null;

  switch (logType) {
    case "Error":
      logMsg = new Error("Cannot read properties of null (reading 'userId')");
      break;
    case "String":
      logMsg = "to be or not to be this is a question";
      break;
    case "Number":
      logMsg = 1234567889965551323558742123255998552321415455;
      break;
    case "Boolean":
      logMsg = true;
      break;
    case "Node":
      logMsg = document.querySelector("#app");
      break;
    case "Event":
      logMsg = new Event("click");
      break;
    case "Function":
      logMsg = new Function("getUser");
      break;
    case "Promise":
      logMsg = new Promise((resolve, reject) => {
        // Your async logic here
        resolve("Success");
      });
      break;
    case "Map":
      logMsg = new Map();
      break;
    case "Set":
      logMsg = new Set();
      break;
    case "WeakMap":
      logMsg = new WeakMap();
      break;
    case "WeakSet":
      logMsg = new WeakSet();
      break;
    case "Window":
      logMsg = window;
      break;
    case "Documnent":
      logMsg = document;
      break;
    case "Proxy":
      logMsg = new Proxy({ value: 123 }, {});
      break;
    default:
      logMsg = {
        name: type,
        value: {
          size: 1000,
        },
      };
  }
  console[type](`日志console-${type}: ${Date.now()}`, log || logMsg);
}

function updateSDKConfig() {
  window._ors.updateConfig({
    name: "ors-sdk-demo",
    version: localStorage.getItem("_orsVersion") || "1.0.3",
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
}

function updateSDKIntegrations() {
  window._ors.updateIntegrations({
    integrations: [],
  });
}
function setExtra(type) {
  if (type === "Sentry") {
    Sentry.setExtra("extraData", { version: "1.1.0", sdk: "Sentry" });
  } else {
    window._ors.setExtra("extraData", { version: "1.1.0", sdk: "ORS" });
  }
}
window.demo = {
  handleLongTask,
  loadScript,
  loadImg,
  loadCSS,
  loadImage,
  handleGetStatic,
  simulateUnload,
  getRandomLetter,
  handleJsError,
  handleJsError2,
  handlePromiseError,
  handleBrowserApiError,
  handleJsError3,
  handleJsError4,
  handleJsError6,
  handleJsError5,
  handleJsErrorReport,
  orsCaptureException,
  orsCaptureMessage,
  handleNetwork,
  handleNetworkError,
  handleNetworkErrorPost,
  handleResErrorReport,
  handleCorsErrorReport,
  handleCustomerTagReport,
  handleRedictDuration,
  handleRetryStatic,
  handleSendHttps,
  handleConsole,
  sentryCaptureException,
  sentryCaptureMessage,
  updateSDKConfig,
  updateSDKIntegrations,
  setExtra,
};
