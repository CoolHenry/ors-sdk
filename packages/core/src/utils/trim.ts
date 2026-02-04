/** 去除字符串开头和结尾的空白字符串
 *
 * @param {String} str 输入字符串
 * @returns {String} 去除头尾空格后的结果
 * @function trim
 * @category String
 * @example
 * const str = ' hello world ';
 * const val = trim (str); // val equals "hello world"
 */
export default function trim(str: string) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}
