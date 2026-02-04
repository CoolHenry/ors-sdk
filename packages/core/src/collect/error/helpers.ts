import type { Mechanism, WrappedFunction } from '@/types/error';
import { addNonEnumerableProperty, getOriginalFunction, markFunctionWrapped } from '@/utils/fill';
import { getGlobalObject } from '@/utils/browserSupport';

/** Get's the global object for the current JavaScript runtime */
const GLOBAL_OBJ = getGlobalObject() as unknown;

export const WINDOW = GLOBAL_OBJ as typeof GLOBAL_OBJ & Window;

let ignoreOnError = 0;

/**
 * @hidden
 */
export function shouldIgnoreOnError(): boolean {
  return ignoreOnError > 0;
}

/**
 * @hidden
 */
export function ignoreNextOnError(): void {
  // onerror should trigger before setTimeout
  ignoreOnError++;
  setTimeout(() => {
    ignoreOnError--;
  });
}

// eslint-disable-next-line @typescript-eslint/ban-types
type WrappableFunction = Function;

export interface ReportInfo {
  message: string;
  error: string | object | undefined;
  errorType: string;
  mechanism: Mechanism;
}

type WrapOptions =
  | {
      mechanism?: Mechanism;
      reportCallback?: undefined;
    }
  | {
      mechanism: Mechanism;
      reportCallback: (info: ReportInfo) => void;
    };

export function wrap<T extends WrappableFunction>(fn: T, options?: WrapOptions): WrappedFunction<T>;
export function wrap<NonFunction>(fn: NonFunction, options?: WrapOptions): NonFunction;
/**
 * Instruments the given function and sends an event to Sentry every time the
 * function throws an exception.
 *
 * @param fn A function to wrap. It is generally safe to pass an unbound function, because the returned wrapper always
 * has a correct `this` context.
 * @returns The wrapped function.
 * @hidden
 */
export function wrap<T extends WrappableFunction, NonFunction>(fn: T | NonFunction, options: WrapOptions = {}): NonFunction | WrappedFunction<T> {
  // for future readers what this does is wrap a function and then create
  // a bi-directional wrapping between them.
  //
  // example: wrapped = wrap(original);
  //  original.__ors_wrapped__ -> wrapped
  //  wrapped.__ors_original__ -> original

  function isFunction(fn: T | NonFunction): fn is T {
    return typeof fn === 'function';
  }

  if (!isFunction(fn)) {
    return fn;
  }

  try {
    // if we're dealing with a function that was previously wrapped, return
    // the original wrapper.
    const wrapper = (fn as WrappedFunction<T>).__ors_wrapped__;
    if (wrapper) {
      if (typeof wrapper === 'function') {
        return wrapper;
      } else {
        // If we find that the `__ors_wrapped__` function is not a function at the time of accessing it, it means
        // that something messed with it. In that case we want to return the originally passed function.
        return fn;
      }
    }

    // We don't wanna wrap it twice
    if (getOriginalFunction(fn)) {
      return fn;
    }
  } catch {
    // Just accessing custom props in some Selenium environments
    // can cause a "Permission denied" exception (see raven-js#495).
    // Bail on wrapping and return the function as-is (defers to window.onerror).
    return fn;
  }

  // Wrap the function itself
  // It is important that `orsWrapped` is not an arrow function to preserve the context of `this`
  const orsWrapped = function (this: unknown, ...args: unknown[]): unknown {
    try {
      // Also wrap arguments that are themselves functions
      const wrappedArguments = args.map((arg) => wrap(arg, options));

      // Attempt to invoke user-land function
      // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
      //       means the sentry.javascript SDK caught an error invoking your application code. This
      //       is expected behavior and NOT indicative of a bug with sentry.javascript.
      return fn.apply(this, wrappedArguments);
    } catch (error: any) {
      ignoreNextOnError();
      const errorType = options?.mechanism?.data?.function as string;
      options?.reportCallback &&
        options?.reportCallback({
          message: error?.message,
          error,
          errorType,
          mechanism: options?.mechanism,
        });
      throw error;
    }
  } as unknown as WrappedFunction<T>;

  // Wrap the wrapped function in a proxy, to ensure any other properties of the original function remain available
  try {
    for (const property in fn) {
      if (Object.prototype.hasOwnProperty.call(fn, property)) {
        orsWrapped[property as keyof T] = fn[property as keyof T];
      }
    }
  } catch {
    // Accessing some objects may throw
    // ref: https://github.com/getsentry/sentry-javascript/issues/1168
  }

  // Signal that this function has been wrapped/filled already
  // for both debugging and to prevent it to being wrapped/filled twice
  markFunctionWrapped(orsWrapped, fn);

  addNonEnumerableProperty(fn, '__ors_wrapped__', orsWrapped);

  // Restore original function name (not all browsers allow that)
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const descriptor = Object.getOwnPropertyDescriptor(orsWrapped, 'name')!;
    if (descriptor.configurable) {
      Object.defineProperty(orsWrapped, 'name', {
        get(): string {
          return fn.name;
        },
      });
    }
  } catch {
    // This may throw if e.g. the descriptor does not exist, or a browser does not allow redefining `name`.
    // to save some bytes we simply try-catch this
  }

  return orsWrapped;
}
