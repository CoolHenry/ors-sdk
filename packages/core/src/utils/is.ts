/* eslint-disable @typescript-eslint/no-explicit-any */

import type { PolymorphicEvent } from '../types/error';

// eslint-disable-next-line @typescript-eslint/unbound-method
const objectToString = Object.prototype.toString;

/**
 * Checks whether given value's type is one of a few Error or Error-like
 * {@link isError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isError(wat: unknown): wat is Error {
  switch (objectToString.call(wat)) {
    case '[object Error]':
    case '[object Exception]':
    case '[object DOMException]':
    case '[object WebAssembly.Exception]':
      return true;
    default:
      return isInstanceOf(wat, Error);
  }
}

/**
 * 检查是否是ErrorLike对象，包含error和message属性并且是字符串
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isErrorLike(wat: any): wat is {
  error: string;
  message: string;
} {
  if (typeof wat?.error === 'string' && typeof wat?.message === 'string') {
    return true;
  }

  return false;
}

/**
 * Checks whether given value is an instance of the given built-in class.
 *
 * @param wat The value to be checked
 * @param className
 * @returns A boolean representing the result.
 */
function isBuiltin(wat: unknown, className: string): boolean {
  return objectToString.call(wat) === `[object ${className}]`;
}

/**
 * Checks whether given value's type is ErrorEvent
 * {@link isErrorEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isErrorEvent(wat: unknown): boolean {
  return isBuiltin(wat, 'ErrorEvent');
}

/**
 * Checks whether given value's type is DOMError
 * {@link isDOMError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isDOMError(wat: unknown): boolean {
  return isBuiltin(wat, 'DOMError');
}

/**
 * Checks whether given value's type is DOMException
 * {@link isDOMException}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isDOMException(wat: unknown): boolean {
  return isBuiltin(wat, 'DOMException');
}

/**
 * Checks whether given value's type is a string
 * {@link isString}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isString(wat: unknown): wat is string {
  return isBuiltin(wat, 'String');
}

/**
 * Checks whether given value's type is an object literal, or a class instance.
 * {@link isPlainObject}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isPlainObject(wat: unknown): wat is Record<string, unknown> {
  return isBuiltin(wat, 'Object');
}

/**
 * Checks whether given value's type is an Event instance
 * {@link isEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isEvent(wat: unknown): wat is PolymorphicEvent {
  return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
}

/**
 * Checks whether given value's type is an Element instance
 * {@link isElement}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isElement(wat: unknown): boolean {
  return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
}

/**
 * Checks whether given value's type is an regexp
 * {@link isRegExp}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isRegExp(wat: unknown): wat is RegExp {
  return isBuiltin(wat, 'RegExp');
}

/**
 * Checks whether given value has a then function.
 * @param wat A value to be checked.
 */
export function isThenable(wat: any): wat is PromiseLike<any> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return Boolean(wat?.then && typeof wat.then === 'function');
}

/**
 * Checks whether given value's type is a SyntheticEvent
 * {@link isSyntheticEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isSyntheticEvent(wat: unknown): boolean {
  return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
}

/**
 * Checks whether given value's type is an instance of provided constructor.
 * {@link isInstanceOf}.
 *
 * @param wat A value to be checked.
 * @param base A constructor to be used in a check.
 * @returns A boolean representing the result.
 */
export function isInstanceOf(wat: any, base: any): boolean {
  try {
    return wat instanceof base;
  } catch {
    return false;
  }
}

interface VueViewModel {
  // Vue3
  __isVue?: boolean;
  // Vue2
  _isVue?: boolean;
}
/**
 * Checks whether given value's type is a Vue ViewModel.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isVueViewModel(wat: unknown): boolean {
  // Not using Object.prototype.toString because in Vue 3 it would read the instance's Symbol(Symbol.toStringTag) property.
  return !!(typeof wat === 'object' && wat !== null && ((wat as VueViewModel).__isVue || (wat as VueViewModel)._isVue));
}

/**
 * Checks whether the given parameter is a Standard Web API Request instance.
 *
 * Returns false if Request is not available in the current runtime.
 */
export function isRequest(request: unknown): request is Request {
  return typeof Request !== 'undefined' && isInstanceOf(request, Request);
}
