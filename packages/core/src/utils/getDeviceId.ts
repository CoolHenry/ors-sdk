import getrandomNumber from '@/utils/getrandomNumber';
import { windowOrs } from '@/store';
import { logReport } from '@/config';
export default function getDeviceId() {
  try {
    let deviceId: string | null = null;
    if (localStorage.getItem('orsDeviceId')) {
      deviceId = localStorage.getItem('orsDeviceId');
    } else {
      deviceId = getrandomNumber(32);
      localStorage.setItem('orsDeviceId', deviceId);
    }
    windowOrs.userConfig.deviceId = deviceId;
    return deviceId;
  } catch (error) {
    logReport('getDeviceId', error);
    return null;
  }
}
