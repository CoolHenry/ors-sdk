import { XHR } from "../report/byXHR";
import pkg from "../../package.json";
import getDeviceId from "@/utils/getDeviceId";
import type {
  ISampleData,
  SamplingEventStatusType,
  CollectStoreType,
  SamplingManagerDecideParamsType,
  initObserveParams,
} from "@/types/init";
import { logReport } from "@/config/logReport";
import { getEntity } from "@/config/mapping";
import { windowOrs } from "@/store";
import { deviceInfo } from "@/utils/deviceInfo";
import { samplingComputed } from "@/utils/samplingComputed";
import { Logger } from "@/utils/common";
import { ReportClient } from "@/report/reportClient";
import { sdkLifeTimeEmitter, sdkLifeTimeUpdateEmitter } from "@/utils/mitt";

// 采样率规则：
// session采样率控制 view、action、resource
// js error采样率规则：目前只控制开关js error, 不设置采样率
// 长任务采样率：目前只控制开关，不设置采样率
interface Ioptions {
  appName: string | undefined;
  appVersion: string;
  projectId: number | string;
  server: string | undefined;
  entity: string | undefined;
}

const sampleConfigData = (config: ISampleData) => {
  try {
    Object.assign(windowOrs.samplingConfig, config);
  } catch (error) {
    logReport("sampleConfigData", error);
  }
};

export const samplingRate = async (options: Ioptions): Promise<ISampleData> => {
  getDeviceId();

  let sample: ISampleData = windowOrs.samplingConfig;

  try {
    const xhr = XHR();

    const params = {
      filters: {
        sdkVersion: pkg.version,
        appVersion: options.appVersion,
        deviceId: windowOrs.userConfig.deviceId,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
      },
      paramNames: ["samplingRate", "blackList", "rumSwitch", "longtaskSetting"],
    };

    const SAMPLE_URL = `${options.server || getEntity(options.entity)}${process.env.CONFIG_URL}`;

    const res = await xhr.request(SAMPLE_URL, params, {
      webGroupId: options.projectId,
    });

    // 类型 & 空值保护
    if (res && res?.data && typeof res.data === "object") {
      sample = {
        ...res.data,
      };
    }
  } catch (error) {
    // 只记录，不影响业务
    logReport("samplingRate", error);
  }

  // 永远喂一个完整结构
  sampleConfigData(sample);

  return sample;
};

export class SamplingManager {
  private static ready = false;
  private static rules: Record<string, boolean> = {};

  public static init(rateConfig: ISampleData) {
    // 是否命中session采样率控制
    windowOrs.samplingConfig.session = samplingComputed(
      "sessionRate",
      Number(rateConfig.sessionRate),
    );
    const isHitSessionRate = windowOrs.samplingConfig.session;
    this.rules = {
      ors_view:
        isHitSessionRate &&
        rateConfig.view &&
        samplingComputed("viewRate", Number(rateConfig.viewRate)),
      ors_action:
        isHitSessionRate &&
        rateConfig.action &&
        samplingComputed("actionRate", Number(rateConfig.actionRate)),
      ors_resource:
        isHitSessionRate &&
        rateConfig.resource &&
        samplingComputed("actionRate", Number(rateConfig.resourceRate)),
      ors_error: rateConfig.jsError,
      ors_longtask: rateConfig.longtask,
      ors_console:
        isHitSessionRate &&
        rateConfig.console &&
        samplingComputed("consoleRate", Number(rateConfig.consoleRate)),
    };
    this.ready = true;
    Logger.log("[log][rate-rules]:", this.rules);
  }

  public static decide(
    item: CollectStoreType | SamplingManagerDecideParamsType,
  ): SamplingEventStatusType {
    if (!this.ready) return "unready";
    return this.rules[item.rumType] ? "report" : "drop";
  }
}

// 和业务方的参数合并初始化项的默认配置参数
export const initConfig = (params: initObserveParams) => {
  //配置接口更新
  sdkLifeTimeUpdateEmitter.on(
    "updateConfigRequest",
    (params: initObserveParams) => {
      getConfig(params);
    },
  );
  return new Promise((resolve, reject) => {
    try {
      getConfig(params).then((rate) => {
        resolve(rate);
        sdkLifeTimeEmitter.emit("configRequestFinished", rate);
      });
    } catch (error) {
      reject(error);
    }
  });
};
export const updateConfig = (params: initObserveParams) => {
  //配置接口更新
  sdkLifeTimeUpdateEmitter.emit("updateConfigRequest", params);
};
const getConfig = async (params: initObserveParams) => {
  // todo 白屏校验参数类型
  // 赋值白屏信息
  if (params?.plugins?.blankScreen)
    windowOrs.plugins.blankScreen = params.plugins.blankScreen;
  // 赋值采样率
  const rate: ISampleData = await samplingRate({
    appName: params.name,
    appVersion: params.version,
    projectId: params.projectId,
    server: params.server,
    entity: params.entity,
  });
  SamplingManager.init({
    // 先默认上采样率，后面再根据config接口返回的配置进行覆盖
    ...{
      view: true,
      viewRate: 100,
      action: true,
      actionRate: 100,
      console: true,
      consoleRate: 100,
      resourceRate: 100,
    },
    ...rate,
  });
  // flush config 之前缓存的数据
  const reportClient = ReportClient.getInstance({
    sessionParams: params,
    webGroupId: params.projectId,
    server: params.server,
    entity: params.entity,
  });
  reportClient.flush();
  return rate;
};
