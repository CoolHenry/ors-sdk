import { WrappedFunction } from "@/types/error";
import { logReport } from "@/config";

/**
 * Defines a non-enumerable property on the given object.
 *
 * @param obj The object on which to set the property
 * @param name The name of the property to be set
 * @param value The value to which to set the property
 */
export function addNonEnumerableProperty(
  obj: object,
  name: string,
  value: unknown,
): void {
  try {
    Object.defineProperty(obj, name, {
      // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
      value: value,
      writable: true,
      configurable: true,
    });
  } catch (error) {
    logReport("addNonEnumerableProperty", error);
  }
}
/**
 * Remembers the original function on the wrapped function and
 * patches up the prototype.
 *
 * @param wrapped the wrapper function
 * @param original the original function that gets wrapped
 */
export function markFunctionWrapped(
  wrapped: WrappedFunction,
  original: WrappedFunction,
): void {
  try {
    const proto = original.prototype || {};
    wrapped.prototype = original.prototype = proto;
    addNonEnumerableProperty(wrapped, "__ors_original__", original);
  } catch (error) {
    logReport("markFunctionWrapped", error);
  }
}
/**
 * Replace a method in an object with a wrapped version of itself.
 *
 * If the method on the passed object is not a function, the wrapper will not be applied.
 *
 * @param source An object that contains a method to be wrapped.
 * @param name The name of the method to be wrapped.
 * @param replacementFactory A higher-order function that takes the original version of the given method and returns a
 * wrapped version. Note: The function returned by `replacementFactory` needs to be a non-arrow function, in order to
 * preserve the correct value of `this`, and the original method must be called using `origMethod.call(this, <other
 * args>)` or `origMethod.apply(this, [<other args>])` (rather than being called directly), again to preserve `this`.
 * @returns void
 */
export function fill(
  source: { [key: string]: any },
  name: string,
  replacementFactory: (...args: any[]) => any,
): void {
  if (!(name in source)) {
    return;
  }

  // explicitly casting to unknown because we don't know the type of the method initially at all
  const original = source[name] as unknown;

  if (typeof original !== "function") {
    return;
  }

  const wrapped = replacementFactory(original) as WrappedFunction;

  // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
  // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
  if (typeof wrapped === "function") {
    markFunctionWrapped(wrapped, original);
  }

  try {
    source[name] = wrapped;
  } catch (error) {
    logReport("fill", error);
  }
}
/**
 * This extracts the original function if available.  See
 * `markFunctionWrapped` for more information.
 *
 * @param func the function to unwrap
 * @returns the unwrapped version of the function if available.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function getOriginalFunction<T extends Function>(
  func: WrappedFunction<T>,
): T | undefined {
  return func.__ors_original__;
}

/**
 * Safely extract function name from itself
 */
const defaultFunctionName = "<anonymous>";
export function getFunctionName(fn: unknown): string {
  try {
    if (!fn || typeof fn !== "function") {
      return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
  } catch (error) {
    // Just accessing custom props in some Selenium environments
    // can cause a "Permission denied" exception (see raven-js#495).
    logReport("getFunctionName", error);
    return defaultFunctionName;
  }
}
