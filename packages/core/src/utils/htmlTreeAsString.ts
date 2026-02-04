import { logReport } from '@/config';
import { isString } from '@/utils/isType';
import { getGlobalObject } from './browserSupport';

const DEFAULT_MAX_STRING_LENGTH = 80;

type InternalGlobal = {
  navigator?: { userAgent?: string; maxTouchPoints?: number };
  console: Console;
  PerformanceObserver?: any;
  onerror?: {
    (event: object | string, source?: string, lineno?: number, colno?: number, error?: Error): any;
    __SENTRY_INSTRUMENTED__?: true;
  };
  onunhandledrejection?: {
    (event: unknown): boolean;
    __SENTRY_INSTRUMENTED__?: true;
  };
};

const GLOBAL_OBJ = getGlobalObject() as unknown as InternalGlobal;

const WINDOW = GLOBAL_OBJ as typeof GLOBAL_OBJ &
  // document is not available in all browser environments (webworkers). We make it optional so you have to explicitly check for it
  Omit<Window, 'document'> &
  Partial<Pick<Window, 'document'>>;

type SimpleNode = {
  parentNode: SimpleNode;
} | null;
function _htmlElementAsString(el: unknown, keyAttrs?: string[]): string {
  try {
    const elem = el as {
      tagName?: string;
      id?: string;
      className?: string;
      getAttribute(key: string): string;
    };

    const out = [];

    if (!elem?.tagName) {
      return '';
    }

    // @ts-expect-error WINDOW has HTMLElement
    if (WINDOW.HTMLElement) {
      // If using the component name annotation plugin, this value may be available on the DOM node
      if (elem instanceof HTMLElement && elem.dataset) {
        if (elem.dataset['sentryComponent']) {
          return elem.dataset['sentryComponent'];
        }
        if (elem.dataset['sentryElement']) {
          return elem.dataset['sentryElement'];
        }
      }
    }

    out.push(elem.tagName.toLowerCase());

    // Pairs of attribute keys defined in `serializeAttribute` and their values on element.
    const keyAttrPairs = keyAttrs?.length
      ? keyAttrs.filter((keyAttr) => elem.getAttribute(keyAttr)).map((keyAttr) => [keyAttr, elem.getAttribute(keyAttr)])
      : null;

    if (keyAttrPairs?.length) {
      keyAttrPairs.forEach((keyAttrPair) => {
        out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
      });
    } else {
      if (elem.id) {
        out.push(`#${elem.id}`);
      }

      const className = elem.className;
      if (className && isString(className)) {
        const classes = className.split(/\s+/);
        for (const c of classes) {
          out.push(`.${c}`);
        }
      }
    }
    const allowedAttrs = ['aria-label', 'type', 'name', 'title', 'alt'];
    for (const k of allowedAttrs) {
      const attr = elem.getAttribute(k);
      if (attr) {
        out.push(`[${k}="${attr}"]`);
      }
    }

    return out.join('');
  } catch (error) {
    logReport('_htmlElementAsString', error);
    return '';
  }
}
export function htmlTreeAsString(elem: unknown, options: string[] | { keyAttrs?: string[]; maxStringLength?: number } = {}): string {
  if (!elem) {
    return '<unknown>';
  }

  // try/catch both:
  // - accessing event.target (see getsentry/raven-js#838, #768)
  // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
  // - can throw an exception in some circumstances.
  try {
    let currentElem = elem as SimpleNode;
    const MAX_TRAVERSE_HEIGHT = 5;
    const out = [];
    let height = 0;
    let len = 0;
    const separator = ' > ';
    const sepLength = separator.length;
    let nextStr;
    const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
    const maxStringLength = (!Array.isArray(options) && options.maxStringLength) || DEFAULT_MAX_STRING_LENGTH;

    while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
      nextStr = _htmlElementAsString(currentElem, keyAttrs);
      // bail out if
      // - nextStr is the 'html' element
      // - the length of the string that would be created exceeds maxStringLength
      //   (ignore this limit if we are on the first iteration)
      if (nextStr === 'html' || (height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength)) {
        break;
      }

      out.push(nextStr);

      len += nextStr.length;
      currentElem = currentElem.parentNode;
    }

    return out.reverse().join(separator);
  } catch (error) {
    logReport('htmlTreeAsString', error);
    return '<unknown>';
  }
}
