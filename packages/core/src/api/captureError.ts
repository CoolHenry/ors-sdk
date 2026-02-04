// api/captureMessage.ts
import { windowOrs } from "@/store/windowOrs";
import type { ProjectInfoType } from "@/types/init";
import type { SeverityLevel, Mechanism } from "@/types/error";
import { logReport } from "@/config";
import { Logger } from "@/utils/common";
export function captureException(
  exception: unknown,
  options: {
    projectInfo?: ProjectInfoType;
    errorType?: string;
    mechanism?: Mechanism;
  } = {},
) {
  try {
    const instance = windowOrs.CaptureError;

    if (!instance) {
      Logger.warn("[ors-sdk] captureException called before init");
      return;
    }

    // 👇 只是转发
    return instance.captureException(exception, options);
  } catch (error) {
    logReport("captureException-api", error);
  }
}

export function captureMessage(
  message: string,
  options: {
    level?: SeverityLevel;
    projectInfo?: ProjectInfoType;
    errorType?: string;
    mechanism?: Mechanism;
  } = {},
) {
  try {
    const instance = windowOrs.CaptureError;

    if (!instance) {
      Logger.warn("[ors-sdk] captureMessage called before init");
      return;
    }

    // 👇 只是转发
    return instance.captureMessage(message, options);
  } catch (error) {
    logReport("captureMessage-api", error);
  }
}
