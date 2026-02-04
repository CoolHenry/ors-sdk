const hasOwnProperty = Object.prototype.hasOwnProperty;

/**检测是否是函数内部 arguments 对象
 * @category Util
 * @param {*} arg 传入参数
 * @returns {Boolean} 是否是函数内部 arguments 对象
 * @function isArguments
 *
 * @example
 * (
 * function(){
 * var v = isArguments(arguments);
 * console.log(v) //=> true
 * }()
 * )
 */
export default function isArguments(
  arg:
    | string
    | number
    | boolean
    | symbol
    | IArguments
    | RegExp
    | Date
    | number[]
    | Error
    | Map<any, any>
    | Set<unknown>
    | Promise<unknown>
    | null
    | undefined,
) {
  return !!(arg && hasOwnProperty.call(arg, "callee"));
}
