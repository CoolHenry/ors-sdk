/** 检测传入参数是否是字符串
 *
 * @param {*} arg 传入参数
 * @returns {Boolean} 是否是字符串
 * @category Util
 * @function isString
 * @example
 * isString('1234') //=> true
 */
export function isString(arg: any): boolean {
  return Object.prototype.toString.call(arg) == "[object String]";
}

/** 检测传入参数是否是数组类型
 * @category Util
 * @param {*} arg 传入参数
 * @function isArray
 * @returns {Boolean} 是否是数组类型
 *
 * @example
 * isArray([])//=> true
 */
export function isArray(arg: any): boolean {
  if (Array.isArray && isFunction(isArray)) {
    return Array.isArray(arg);
  }
  return Object.prototype.toString.call(arg) === "[object Array]";
}

/** 检测传入参数是否是函数
 * @category Util
 * @param {*} arg 传入参数
 * @returns 是否是函数
 * @function isFunction
 * @example
 * isFunction (function(){}) //=> true
 */
export function isFunction(arg: any) {
  if (!arg) {
    return false;
  }
  const type = Object.prototype.toString.call(arg);
  return (
    type == "[object Function]" ||
    type == "[object AsyncFunction]" ||
    type == "[object GeneratorFunction]"
  );
}

/** 检测传入参数是否是数字
 * @category Util
 * @param {*} arg 传入参数
 * @returns {Boolean} 是否是数字类型
 * @function isNumber
 *
 * @example
 * isNumber(1234) //=> true
 */
export function isNumber(arg: any): boolean {
  /* eslint-disable-next-line */
  return (
    Object.prototype.toString.call(arg) == "[object Number]" &&
    /[\d\.]+/.test(String(arg))
  );
}

/** 检测传入参数是否是对象类型
 * @category Util
 * @param {*} arg 传入参数
 * @returns {Boolean} 是否是对象类型
 * @function isObject
 * @example
 * isObject({}) //=> true
 * isObject(1) //=> false
 */
export function isObject(arg: any): boolean {
  if (arg == null) {
    return false;
  } else {
    return Object.prototype.toString.call(arg) == "[object Object]";
  }
}
