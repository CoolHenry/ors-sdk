import { windowOrs } from '@/store';
import type { SamplingType, SamplingRandomKey } from '@/types/init';
export function samplingComputed(type: SamplingType, rate = 100) {
  const samplingRate = rate ?? 100; // 仅当rate===null || rate===undefiend时，使用默认值 100
  const randomValue = Math.floor(Math.random() * 100);
  windowOrs.samplingConfig && (windowOrs.samplingConfig[`${type}Random` as SamplingRandomKey] = randomValue);
  if (randomValue <= samplingRate) {
    return true;
  } else {
    return false;
  }
}
