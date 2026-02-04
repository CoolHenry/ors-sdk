import { isObject } from "./isType";
import getRandomBasic from "./getRandomBasic";

/** 安全的 js 随机数生成方式,返回与原生 Math.random 类似的 0-1 的随机数值
 * @function getRandom
 * @category Math
 * @returns {Number} 一个介于 0 -1 的数字
 *
 * @example
 * getRandom() //=> 0.8368784293552812
 */
export default function getRandom() {
  if (typeof Uint32Array === "function") {
    let cry = "";
    if (typeof crypto !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cry = crypto;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } else if (typeof msCrypto !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cry = msCrypto;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (isObject(cry) && cry.getRandomValues) {
      const typedArray = new Uint32Array(1);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const randomNumber = cry.getRandomValues(typedArray)[0];
      const integerLimit = Math.pow(2, 32);
      return randomNumber / integerLimit;
    }
  }
  return getRandomBasic(10000000000000000000) / 10000000000000000000;
}
