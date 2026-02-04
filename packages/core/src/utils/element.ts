import trim from "./trim";
import { logReport } from "@/config";

/** 获取元素的文本内容
 *
 * @param {Element} element dom 元素
 * @param {String} tagName 元素的标签名
 * @returns {String} 元素文本内容
 * @function getElementContent
 * @category Dom
 *
 * @example
 * var button = document.getElementById('btn1'); // <button id='btn1'>test</button>
 * getElementContent(button,'button'); //=> test
 */
function getElementContent(
  element: { textContent: any; innerText: any; value: string },
  tagName: string,
) {
  let textContent = "";
  let element_content = "";
  if (element.textContent) {
    textContent = trim(element.textContent);
  } else if (element.innerText) {
    textContent = trim(element.innerText);
  }
  if (textContent) {
    textContent = textContent
      .replace(/[\r\n]/g, " ")
      .replace(/[ ]+/g, " ")
      .substring(0, 255);
  }
  element_content = textContent || "";

  if (tagName === "input" || tagName === "INPUT") {
    element_content = element.value || "";
  }
  return element_content;
}

/** 获取元素的文本内容
 *
 * @param {XMLDocument} number 横坐标
 * @param {y} number 竖坐标
 * @returns {Array} 元素文本内容
 * @function getElementsFromPoint
 */
function getElementsFromPoint(x: number, y: number) {
  try {
    if (typeof document.elementsFromPoint === "function") {
      // 现代浏览器
      return document.elementsFromPoint(x, y);
    } else if (typeof document.elementFromPoint === "function") {
      // 用 elementFromPoint 模拟（Polyfill）
      return polyfillElementsFromPoint(x, y);
    } else {
      // 太老的浏览器，直接返回空数组
      console.warn("elementsFromPoint 和 elementFromPoint 都不支持");
      return [];
    }
  } catch (error) {
    logReport("getElementsFromPoint", error);
    return [];
  }
}

function polyfillElementsFromPoint(x: number, y: number) {
  try {
    const elements: Element[] = [];
    const prevPointerEvents: { el: Element; pointerEvents: string }[] = [];

    let el;
    while ((el = document.elementFromPoint(x, y)) && !elements.includes(el)) {
      elements.push(el);

      // 保存 pointer-events 原值
      prevPointerEvents.push({
        el,
        pointerEvents: (el as HTMLElement).style.pointerEvents,
      });

      // 暂时禁用事件响应，让下一个元素可被选中
      (el as HTMLElement).style.pointerEvents = "none";
    }

    // 恢复所有元素原有 pointer-events
    for (let i = 0; i < prevPointerEvents.length; i++) {
      const { el, pointerEvents } = prevPointerEvents[i];
      if ((el as HTMLElement).style) {
        (el as HTMLElement).style.pointerEvents = pointerEvents;
      }
    }

    return elements;
  } catch (error) {
    logReport("polyfillElementsFromPoint", error);
    return [];
  }
}
export default { getElementContent, getElementsFromPoint };
