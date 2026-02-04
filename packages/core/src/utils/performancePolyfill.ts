import { logReport } from '@/config';
/*getEntriesByName方法polufill*/
export const getEntriesByNamePolyfill = () => {
  try {
    if (!window.performance?.getEntriesByName || typeof window.performance?.getEntriesByName !== 'function') {
      if (window.performance?.getEntries && typeof window.performance?.getEntries === 'function') {
        window.performance.getEntriesByName = function (name) {
          return window.performance.getEntries().filter((entry) => entry.name === name);
        };
        console.warn('当前浏览器不支持 performance.getEntriesByName,使用getEntries兼容');
      }
    }
  } catch (error) {
    logReport('getEntriesByNamePolyfill', error);
  }
};
/*getEntriesByName方法polufill*/
export const getEntriesByTypePolyfill = () => {
  try {
    if (!window.performance?.getEntriesByType || typeof window.performance?.getEntriesByType !== 'function') {
      if (window.performance?.getEntries && typeof window.performance?.getEntries === 'function') {
        window.performance.getEntriesByType = function (type: string) {
          return window.performance.getEntries().filter((entry) => entry.entryType === type);
        };
        console.warn('当前浏览器不支持 performance.getEntriesByType,使用getEntries兼容');
      }
    }
  } catch (error) {
    logReport('getEntriesByTypePolyfill', error);
  }
};

getEntriesByNamePolyfill();
getEntriesByTypePolyfill();
