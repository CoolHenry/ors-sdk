import getUA from "./getUA";

/** 检测是否支持 Beacon 数据发送
 * @category Bom
 * @function isSupportBeaconSend
 * @returns {Boolean} 是否支持 Beacon 数据发送
 * @example
 * // 再支持 beacon 的浏览器中
 * isSupportBeaconSend()//=> true
 */
export default function isSupportBeaconSend() {
  let supported = false;
  if (
    typeof navigator !== "object" ||
    typeof navigator.sendBeacon !== "function"
  ) {
    return supported;
  }

  const Sys = getUA();
  const ua = navigator.userAgent.toLowerCase();
  //sendBeacon 浏览器兼容性检测
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    //iOS 上的 Safari11.1–12 无法向未访问的来源发送信号，已在iOS13中修复。
    const reg = /os [\d._]*/gi;
    const verinfo = ua.match(reg);
    const version = (verinfo + "")
      .replace(/[^0-9|_.]/gi, "")
      .replace(/_/gi, ".");
    const ver = version.split(".");
    if (typeof Sys.safari === "undefined") {
      Sys.safari = ver[0];
    }
    if (ver[0] && (Sys.qqBuildinBrowser || Sys.qqBrowser)) {
      supported = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
    } else if (ver[0] && ver[0] < 13) {
      if (
        Sys.chrome > 41 ||
        Sys.firefox > 30 ||
        Sys.opera > 25 ||
        Sys.safari > 12
      ) {
        supported = true;
      }
    } else if (
      Sys.chrome > 41 ||
      Sys.firefox > 30 ||
      Sys.opera > 25 ||
      Sys.safari > 11.3
    ) {
      supported = true;
    }
  } else {
    if (
      Sys.chrome > 38 ||
      Sys.edge > 13 ||
      Sys.firefox > 30 ||
      Sys.opera > 25 ||
      Sys.safari > 11.0
    ) {
      supported = true;
    }
  }
  return supported;
}
