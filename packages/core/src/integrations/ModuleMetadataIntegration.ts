import { logReport } from "@/config";
import { ORS_WINDOW_METADATA_KEY } from "@/constant";
import { JsErrorInfoType, ProjectInfoType } from "@/types/init";
import {
  OrsIntegrationSetupParams,
  OrsIntegrationType,
} from "@/types/integrations";
import { browserStackParser } from "@/utils/browserStackParser";

type ModuleMetadataIntegrationParams = {
  /** data为用户配置的metadata， 可以自定义转换成projectInfo */
  metadataToProjectInfo?: (data: any) => ProjectInfoType;
  debug?: boolean;
};

export const ModuleMetadataIntegration = (
  p?: ModuleMetadataIntegrationParams,
) => {
  //为了兼容低版本浏览器，这里没有使用map
  const parsedKey: Record<string, true> = {};
  const filenameMapper: Record<string, any> = {};

  const integrationName = "module-metadata-integration";

  function logDebug(info: string) {
    if (p?.debug) {
      console.log(`[ModuleMetadataIntegration]：${info}`);
    }
  }

  function parseWindowMetadata() {
    const metadata: Record<string, any> = (window as any)[
      ORS_WINDOW_METADATA_KEY
    ];
    if (!metadata) {
      return;
    }
    Object.keys(metadata).forEach((key: string) => {
      if (parsedKey[key]) {
        return;
      }
      parsedKey[key] = true;
      if (typeof key !== "string") {
        return;
      }
      const value = metadata[key];
      const stacktrace = browserStackParser(key);
      if (Array.isArray(stacktrace) && stacktrace.length > 0) {
        for (let i = stacktrace.length - 1; i >= 0; i--) {
          const filename = stacktrace[i].filename;
          if (filename) {
            filenameMapper[filename] = value;
            break;
          }
        }
      }
    });
  }

  const result: OrsIntegrationType = {
    name: integrationName,
    setup: (params: OrsIntegrationSetupParams) => {
      // 防止多次调用时被覆盖
      if (!(window as any)[ORS_WINDOW_METADATA_KEY]) {
        (window as any)[ORS_WINDOW_METADATA_KEY] = {};
      }
      if (params.sdkLifeTimeEmitter) {
        params.sdkLifeTimeEmitter.on("reportError", (err: JsErrorInfoType) => {
          try {
            if (p?.debug) {
              logDebug(`监听到error对象：${JSON.stringify(err)}`);
              logDebug(
                `获取window对象：${JSON.stringify((window as any)[ORS_WINDOW_METADATA_KEY])}`,
              );
            }
            const stackStr = err.errorObj;
            if (
              !(window as any)[ORS_WINDOW_METADATA_KEY] ||
              (!err.filename && !stackStr)
            ) {
              return;
            }
            // 增加兼容，如果error对象没有文件名，则从堆栈信息里面读取
            let filename = err.filename;
            //微前端下，error对象的filename可能不准，需要优先取error stack中解析的值
            if (stackStr) {
              const stack = browserStackParser(stackStr).filter(
                (i) => !!i.filename,
              );
              if (Array.isArray(stack) && stack.length > 0) {
                filename = stack[stack.length - 1]?.filename || "";
                err.filename = filename;
              }
            }
            if (!filename) {
              return;
            }
            parseWindowMetadata();
            if (p?.debug) {
              logDebug(
                `解析后的filenameMapper数据：${JSON.stringify(filenameMapper)}`,
              );
            }
            const metadata = filenameMapper[err.filename];
            if (metadata && typeof metadata === "object") {
              const projectInfo =
                typeof p?.metadataToProjectInfo === "function"
                  ? p.metadataToProjectInfo(metadata)
                  : metadata;
              if (projectInfo && typeof projectInfo === "object") {
                err.projectInfo = projectInfo;
              }
            }
          } catch (error) {
            logReport(`${integrationName}中处理错误异常`, error);
          }
        });
      }
    },
  };
  return result;
};
