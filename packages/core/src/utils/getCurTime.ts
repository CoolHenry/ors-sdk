import { logReport } from '@/config';
export function getTimeOrigin(viewSubType?: string) {
  try {
    if (!performance) {
      // 如果不支持performance降级成Date.now()处理
      return Date.now() * 1000;
    }
    const browserStartTime = performance.timeOrigin;
    // 当前时间统一精确到16位到us
    const currentTime = viewSubType === 'pageload' ? browserStartTime * 1000 : (browserStartTime + performance.now()) * 1000;
    return currentTime;
  } catch (error) {
    logReport('getTimeOrigin', error);
    // 如果不支持performance降级成Date.now()处理
    return Date.now() * 1000;
  }
}

export function getCurrentTime() {
  try {
    if (!performance) {
      // 如果不支持performance降级成Date.now()处理
      return Date.now() * 1000;
    }
    const browserStartTime = performance.timeOrigin;
    // 当前时间统一精确到16位到us
    const currentTime = (browserStartTime + performance.now()) * 1000;
    return currentTime;
  } catch (error) {
    logReport('getCurrentTime', error);
    // 如果不支持performance降级成Date.now()处理
    return Date.now() * 1000;
  }
}
