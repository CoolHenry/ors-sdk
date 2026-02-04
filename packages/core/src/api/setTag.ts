// 自定义字段
import { logReport } from '@/config';
import { windowOrs } from '@/store/windowOrs';
export const setTag = function (value: Record<string, unknown> = {}) {
  try {
    const keysArr = Object.keys(value);
    if (keysArr.length > 0) {
      keysArr.forEach((key) => {
        windowOrs.customInfo && (windowOrs.customInfo['_' + key] = value[key]);
      });
    }
  } catch (error) {
    logReport('setTag', error);
  }
};
