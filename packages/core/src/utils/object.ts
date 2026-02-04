import { htmlTreeAsString } from "./htmlTreeAsString";
import { isElement, isError, isEvent, isInstanceOf } from "./is";
import { truncate } from "./string";
import { logReport } from "@/config";

/**
 * Transforms any `Error` or `Event` into a plain object with all of their enumerable properties, and some of their
 * non-enumerable properties attached.
 *
 * @param value Initial source that we have to transform in order for it to be usable by the serializer
 * @returns An Event or Error turned into an object - or the value argument itself, when value is neither an Event nor
 *  an Error.
 */
export function convertToPlainObject<V>(value: V):
  | {
      [ownProps: string]: unknown;
      type: string;
      target: string;
      currentTarget: string;
      detail?: unknown;
    }
  | {
      [ownProps: string]: unknown;
      message: string;
      name: string;
      stack?: string;
    }
  | V {
  if (isError(value)) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack,
      ...getOwnProperties(value),
    };
  } else if (isEvent(value)) {
    const newObj: {
      [ownProps: string]: unknown;
      type: string;
      target: string;
      currentTarget: string;
      detail?: unknown;
    } = {
      type: value.type,
      target: serializeEventTarget(value.target),
      currentTarget: serializeEventTarget(value.currentTarget),
      ...getOwnProperties(value),
    };

    if (
      typeof CustomEvent !== "undefined" &&
      isInstanceOf(value, CustomEvent)
    ) {
      newObj.detail = value.detail;
    }

    return newObj;
  } else {
    return value;
  }
}

/** Creates a string representation of the target of an `Event` object */
function serializeEventTarget(target: unknown): string {
  try {
    return isElement(target)
      ? htmlTreeAsString(target)
      : Object.prototype.toString.call(target);
  } catch (e) {
    logReport("serializeEventTarget", e);
    return "<unknown>";
  }
}

/** Filters out all but an object's own properties */
function getOwnProperties(obj: unknown): { [key: string]: unknown } {
  try {
    if (typeof obj === "object" && obj !== null) {
      const extractedProps: { [key: string]: unknown } = {};
      for (const property in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, property)) {
          extractedProps[property] = (obj as Record<string, unknown>)[property];
        }
      }
      return extractedProps;
    } else {
      return {};
    }
  } catch (e) {
    logReport("getOwnProperties", e);
    return {};
  }
}

/**
 * Given any captured exception, extract its keys and create a sorted
 * and truncated list that will be used inside the event message.
 * eg. `Non-error exception captured with keys: foo, bar, baz`
 */
export function extractExceptionKeysForMessage(
  exception: Record<string, unknown>,
  maxLength = 40,
): string {
  try {
    const keys = Object.keys(convertToPlainObject(exception));
    keys.sort();

    const firstKey = keys[0];

    if (!firstKey) {
      return "[object has no keys]";
    }

    if (firstKey.length >= maxLength) {
      return truncate(firstKey, maxLength);
    }

    for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
      const serialized = keys.slice(0, includedKeys).join(", ");
      if (serialized.length > maxLength) {
        continue;
      }
      if (includedKeys === keys.length) {
        return serialized;
      }
      return truncate(serialized, maxLength);
    }

    return "";
  } catch (e) {
    logReport("extractExceptionKeysForMessage", e);
    return "";
  }
}
