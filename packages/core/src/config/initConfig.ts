import type { InitConfigData, ISampleData } from '@/types/init';
import pkg from '../../package.json';

const initConfigData: InitConfigData = {
  sdkVersion: pkg.version,
  isInit: false,
  orsDataInfo: {
    sessionInfo: {
      sessionId: '',
      sessionStartTime: 0,
    }, // session的信息
    FMPTime: '',
    actionId: '',
    resourceErrorList: [], // 加载资源错误url的资源列表
    resErrorList: [],
  },
  orsViewPage: {},
  orsViewAttrs: {},
  samplingConfig: {
    view: true,
    viewRate: 100,
    action: true,
    actionRate: 100,
    console: true,
    consoleRate: 100,
    session: true,
    sessionRate: 100,
    longtask: true,
    logRepRate: 100,
    jsError: true,
    logRep: true,
    resource: true,
    resourceRate: 100,
    resNorRate: 100,
    resErrRate: 100,
    trace: true,
    traceRate: 100,
    blResUrl: [],
    blJsErrMsg: [],
    featureFlags: {
      sdkGzipSwitch: 'A',
    },
  } as ISampleData,
  configData: {
    // 配置数据
    isSampling: true, // 采样率
  },
  extraConfig: {
    errorCount: 0, // 自身错误次数
  },
  plugins: {
    blankScreen: {
      autoDetect: false, // 白屏的自动检测
      rootSelector: [], // 根元素选择器
    },
  },
  integrations: {},
  ubsData: {
    // ubs需要的data数据
    scenes: '',
  },
  customInfo: {},
  nativeData: null,
};

export default initConfigData;
