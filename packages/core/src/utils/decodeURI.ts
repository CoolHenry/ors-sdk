/** 具备异常处理的 URI 解码方法
 * @category Bom
 * @param {String} uri 传入的 uri 字符串
 * @returns {String} 解码后的 uri，如果出现异常则返回原始传入值
 * @function decodeURI
 * @example
 * decodeURI('/hello%E4%B8%96%E7%95%8C') //=> '/hello世界'
 */
export default function _decodeURI(uri: string): string {
  let result = uri;
  try {
    result = decodeURI(uri);
  } catch (e) {
    result = uri;
  }
  return result;
}
