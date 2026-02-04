import * as customApi from '@/api'; // 自定义上报字段
import { initObserve, recordFMPTime } from '@/init';
import type { ISampleData } from '@/types/init';
export interface WindowOrsType {
  initObserve?: typeof initObserve;
  recordFMPTime?: typeof recordFMPTime;
  setTag?: typeof customApi.setTag;
  setUser?: typeof customApi.setUser;
  extraConfig?: any;
  samplingConfig: ISampleData;
  plugins?: any;
  isInit?: boolean;
  orsViewPage?: any;
  customInfo?: { [key: string]: any };
  // TODO 应该在此处将类型声明确定下来
  [record: string]: any;
}
