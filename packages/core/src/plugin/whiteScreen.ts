import type { Callback, whiteScreenOptions } from "@/types/whiteScreen";
import { logReport } from "@/config";
import { elementFun } from "@/utils";
import { windowOrs } from "@/store";
import { Logger } from "@/utils/common";

// 获取全局变量
export function getGlobal(): Window {
  return window as unknown as Window;
}
const _global = getGlobal();

export function getGlobalSupport() {
  Object.assign(windowOrs, { _loopTimer: 5 });
  return windowOrs;
}

function debounce(
  func: {
    (
      callback: Callback,
      { skeletonProject, whiteBoxElements }: whiteScreenOptions,
    ): void;
    apply?: any;
  },
  wait: number | undefined,
) {
  let timeoutId: any = null;
  return function (...args: any) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

const _support = getGlobalSupport();

/**
 * 检测页面是否白屏
 * @param {function} callback - 回到函数获取检测结果
 * @param {boolean} skeletonProject - 页面是否有骨架屏
 * @param {array} whiteBoxElements - 容器列表，默认值为['html', 'body', '#app', '#root']
 */

function whiteScreenMonitor(
  callback: Callback,
  { skeletonProject, whiteBoxElements }: whiteScreenOptions,
) {
  try {
    let _whiteLoopNum = 0;
    const _skeletonInitList: any = []; // 存储初次采样点
    let _skeletonNowList: any = []; // 存储当前采样点

    let timer: any = null;
    const maxRetryTime = 5;
    let retryTime = 0;
    Logger.log("[log][执行了白屏]");
    // 项目有骨架屏
    if (skeletonProject) {
      if (document.readyState != "complete") {
        idleCallback();
      }
    } else {
      // 页面加载完毕
      if (document.readyState === "complete") {
        idleCallback();
      } else {
        _global.addEventListener("load", idleCallback);
      }
    }

    // 选中dom点的名称
    // eslint-disable-next-line no-inner-declarations
    function getSelector(element: any) {
      try {
        if (element?.id) {
          return "#" + element.id;
        } else if (
          element?.className &&
          typeof element?.className === "string"
        ) {
          // div home => div.home
          return (
            "." +
            element.className
              .split(" ")
              .filter((item: any) => !!item)
              .join(".")
          );
        } else {
          return element?.nodeName ? element?.nodeName.toLowerCase() : "";
        }
      } catch (error) {
        logReport("whiteScreenGetSelector", error);
      }
    }

    // 判断采样点是否为容器节点
    // eslint-disable-next-line no-inner-declarations
    function isContainer(element: HTMLElement) {
      try {
        const selector = getSelector(element);
        if (skeletonProject) {
          _whiteLoopNum
            ? _skeletonNowList.push(selector)
            : _skeletonInitList.push(selector);
        }
        Logger.log("[log][whiteScreen selector]:", selector, whiteBoxElements);
        return whiteBoxElements?.indexOf(selector) != -1;
      } catch (error) {
        logReport("whiteScreenIsContainer", error);
      }
      return;
    }

    // 采样对比
    // eslint-disable-next-line no-inner-declarations
    function sampling() {
      try {
        let emptyPoints = 0;
        for (let i = 1; i <= 9; i++) {
          const xElements = elementFun.getElementsFromPoint(
            (_global.innerWidth * i) / 10,
            _global.innerHeight / 2,
          );
          const yElements = elementFun.getElementsFromPoint(
            _global.innerWidth / 2,
            (_global.innerHeight * i) / 10,
          );

          if (isContainer(xElements[0] as HTMLElement)) emptyPoints++;
          // 中心点只计算一次
          if (i != 5) {
            if (isContainer(yElements[0] as HTMLElement)) emptyPoints++;
          }
        }

        // 页面正常渲染，停止轮训
        if (emptyPoints != 17) {
          Logger.log("[log][页面检测ok]:");
          if (skeletonProject) {
            // 第一次不比较
            if (!_whiteLoopNum) return openWhiteLoop();
            // 比较前后dom是否一致
            if (_skeletonNowList.join() == _skeletonInitList.join())
              return callback({
                status: "error",
              });
          }

          if (timer) clearTimeout(timer);
          return callback({
            status: "ok",
          });
        } else {
          Logger.log("[log][_support_support1]:", _support);
          // 开启轮训
          if (++retryTime > maxRetryTime) {
            Logger.log("[log][页面白屏检测超过最大次数，可判定为白屏]");
            // 这里可以做一些监控上报之类的事情
            clearTimeout(timer);
            return callback({
              status: "error",
            });
          }
          if (!timer) {
            timer = setInterval(() => {
              emptyPoints = 0;
              idleCallback();
            }, 1000);
          }
        }
      } catch (error) {
        logReport("whiteScreenSampling", error);
      }
    }

    // 开启白屏轮训
    // eslint-disable-next-line no-inner-declarations
    function openWhiteLoop(): void {
      try {
        if (_support._loopTimer) return;

        _support._loopTimer = setInterval(() => {
          if (skeletonProject) {
            _whiteLoopNum++;
            _skeletonNowList = [];
          }
          idleCallback();
        }, 1000);
      } catch (error) {
        logReport("whiteScreenOpenWhiteLoop", error);
      }
    }

    // eslint-disable-next-line no-inner-declarations
    function idleCallback() {
      try {
        if ("requestIdleCallback" in _global) {
          requestIdleCallback((deadline) => {
            // timeRemaining：表示当前空闲时间的剩余时间  触发机制
            if (deadline.timeRemaining() > 0) {
              sampling();
            } else {
              // 用户没有空闲时间的情况下,等待微任务执行完之后,再去执行检测
              setTimeout(sampling, 0);
            }
          });
        } else {
          sampling();
        }
      } catch (error) {
        logReport("whiteScreenIdleCallback", error);
      }
    }
  } catch (error) {
    logReport("whiteScreenMonitor", error);
  }
}

export const openWhiteScreen = debounce(whiteScreenMonitor, 1000);
