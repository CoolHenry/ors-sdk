import getrandomNumber from "@/utils/getrandomNumber";
import { logReport } from "@/config";
import { getCurrentTime } from "@/utils/getCurTime";
import { windowOrs } from "@/store";
import type { SessionInfosType, initObserveParams } from "@/types/init";

const createSessionId = () => {
  try {
    const sessionInfo = {
      sessionId: "",
      sessionStartTime: 0,
    };
    const appInfo = windowOrs.nativeData;
    sessionInfo.sessionId = appInfo?.sessionId || getrandomNumber(32);
    sessionInfo.sessionStartTime =
      appInfo?.sessionStartTime || getCurrentTime();
    sessionStorage.setItem("orsSessionId", sessionInfo?.sessionId);
    sessionStorage.setItem(
      "orsSessionStartTime",
      sessionInfo?.sessionStartTime.toString(),
    );
    sessionStorage.setItem("orsSessionIdTime", Date.now().toString());
    windowOrs.orsDataInfo.sessionInfo.sessionId = sessionInfo?.sessionId;
    windowOrs.orsDataInfo.sessionInfo.sessionStartTime = Math.floor(
      Number(sessionInfo?.sessionStartTime),
    );
    const orsSessionSwitch = sessionStorage.getItem("orsSessionSwitch");
    if (orsSessionSwitch) sessionStorage.removeItem("orsSessionSwitch");
    // 控制session采样率,sessionId更换的时候需要重新计算session采样率
    if (windowOrs.samplingConfig.session) {
      sessionStorage.setItem(
        "orsSessionSwitch",
        String(windowOrs.samplingConfig.session),
      );
    }
    return sessionInfo;
  } catch (error) {
    logReport("createSessionId", error);
    return;
  }
};
const generateOrGetSessionId = () => {
  try {
    // 会话ID的过期时间（毫秒），4小时后
    const expirationTime = 4 * 60 * 60 * 1000;
    let sessionInfo: SessionInfosType = {
      sessionId: "",
      sessionStartTime: 0,
    };
    // 从localStorage获取会话ID和生成时间
    const sessionId = sessionStorage.getItem("orsSessionId");
    const storedSessionStartTime = sessionStorage.getItem(
      "orsSessionStartTime",
    );
    const storedSessionIdTime = sessionStorage.getItem("orsSessionIdTime");
    if (sessionId) sessionInfo.sessionId = sessionId;
    if (storedSessionStartTime)
      sessionInfo.sessionStartTime = Number(storedSessionStartTime);
    // 检查存储的会话ID是否存在且未过期
    if (sessionId && storedSessionIdTime) {
      const storedTime = Number(storedSessionIdTime);
      const currentTime = Date.now();

      // 如果存储的时间加上4小时大于当前时间，说明会话ID未过期
      if (currentTime - storedTime < expirationTime) {
        if (sessionInfo?.sessionId) {
          windowOrs.orsDataInfo.sessionInfo.sessionId = sessionInfo?.sessionId;
        }

        if (sessionInfo?.sessionStartTime) {
          windowOrs.orsDataInfo.sessionInfo.sessionStartTime = Math.floor(
            Number(sessionInfo?.sessionStartTime),
          );
        }
        // 如果会话采样率取过之后，复用上次的
        const orsSessionSwitch = sessionStorage.getItem("orsSessionSwitch");
        if (orsSessionSwitch)
          windowOrs.samplingConfig.session = JSON.parse(orsSessionSwitch);
        return sessionInfo; // 返回原会话ID
      } else {
        // 如果会话ID已过期，则移除sessionStorage中的存储
        sessionStorage.removeItem("orsSessionId");
        sessionStorage.removeItem("orsSessionIdTime");
        sessionStorage.removeItem("orsSessionStartTime");
        // 重新生成会话id与时间
        createSessionId();
      }
    }
    sessionInfo = createSessionId() as SessionInfosType;
    return sessionInfo;
  } catch (error) {
    logReport("generateOrGetSessionId", error);
    return;
  }
};

const getSessionParams = (params: initObserveParams) => {
  return {
    name: params.name,
    version: params.version,
    projectId: params.projectId || "",
    server: params.server,
    ignoreErrors: params.ignoreErrors || [],
    appId: params.appId || "",
    accessNo: params.accessNo || "",
    osName: params.osName || "",
    entity: params.entity,
    beforeSend: params.beforeSend,
  };
};

export { createSessionId, generateOrGetSessionId, getSessionParams };
