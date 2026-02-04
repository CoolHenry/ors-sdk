import { logReport } from '@/config';
import { ViewInfoType } from '@/types/init';

const cachedViewInfoMap: Record<string, ViewInfoType> = {};
export const MAX_VIEW_INFO_CACHED_LENGTH = 30;
const cachedViewInfoList: ViewInfoType[] = new Array(MAX_VIEW_INFO_CACHED_LENGTH);
let currentIndex = 0;

export const getViewInfo = (viewId: string): ViewInfoType | undefined => {
  try {
    return cachedViewInfoMap[viewId];
  } catch (error) {
    logReport('viewStore getViewInfo', error);
    return;
  }
};

export const setViewInfo = (view: ViewInfoType) => {
  try {
    if (currentIndex >= MAX_VIEW_INFO_CACHED_LENGTH) {
      currentIndex = currentIndex % MAX_VIEW_INFO_CACHED_LENGTH;
    }
    const prev = cachedViewInfoList[currentIndex];
    if (prev && prev.viewId) {
      delete cachedViewInfoMap[prev.viewId];
    }
    if (view.viewId) {
      cachedViewInfoMap[view.viewId] = view;
      cachedViewInfoList[currentIndex] = view;
    }
    currentIndex++;
  } catch (error) {
    logReport('viewStore setViewInfo', error);
  }
};
