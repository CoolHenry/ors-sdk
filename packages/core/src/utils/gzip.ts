import { gzipSync, strToU8 } from "fflate";
import { Logger } from "./common";
import { logReport } from "@/config";

export default function tryGzip(data: Record<string, any>) {
  let strData = "";
  try {
    strData = JSON.stringify(data);
    const result = gzipSync(strToU8(strData));
    return {
      data: result,
      gzip: true,
    };
  } catch (error) {
    Logger.log("[log][gzip error]", error);
    logReport("tryGzip", error);
    return {
      data: strData,
      gzip: false,
    };
  }
}
