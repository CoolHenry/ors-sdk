/**
 * @typedef BrowserInfo 浏览器信息
 * @property {Number} ?opera 欧朋版本号
 * @property {Number} ?ie IE 版本号
 * @property {Number} ?edge Edge 版本号
 * @property {Number} ?firefox Firefox 版本号
 * @property {Number} ?chrome Chrome 版本号
 * @property {Number} ?safari Safari 版本号
 */

/** 通过浏览器 UserAgent 获取当前浏览器型号和版本
 * @category Bom
 * @returns {BrowserInfo} 浏览器型号和版本
 * @function getUA
 * @example
 * var browserInfo = getUA();
 * console.log(browserInfo); // => {chrome: 98}
 */
export default function getUA() {
  const Sys: any = {};
  const ua = navigator.userAgent.toLowerCase();
  let s;
  if ((s = ua.match(/ qq\/([\d.]+)/))) {
    Sys.qqBuildinBrowser = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/mqqbrowser\/([\d.]+)/))) {
    Sys.qqBrowser = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/opera.([\d.]+)/))) {
    Sys.opera = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/msie ([\d.]+)/))) {
    Sys.ie = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/edge.([\d.]+)/))) {
    Sys.edge = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/firefox\/([\d.]+)/))) {
    Sys.firefox = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/chrome\/([\d.]+)/))) {
    Sys.chrome = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/version\/([\d.]+).*safari/))) {
    Sys.safari = Number(s[1].match(/^\d*.\d*/));
  } else if ((s = ua.match(/trident\/([\d.]+)/))) {
    Sys.ie = 11;
  }
  return Sys;
}
