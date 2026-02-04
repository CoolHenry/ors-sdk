// eventFilter.ts
import { needSkipUrlCollect } from "@/utils";
import { needSkipError } from "@/utils/error";
import type {
  CollectStoreType,
  JsErrorInfoType,
  SessionParams,
} from "@/types/init";

export class EventFilter {
  static shouldDrop(item: CollectStoreType, options?: SessionParams): boolean {
    switch (item.rumType) {
      case "ors_resource":
        return !!item.url && needSkipUrlCollect(item.url, options);

      case "ors_error":
        return needSkipError((item as JsErrorInfoType).msg, options);

      default:
        return false;
    }
  }
}
