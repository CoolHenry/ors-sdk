/**
 * 通过 IMG 发送信息
 */
export default class ByImg {
  toReport(url: string, data: { reportWay: string }) {
    try {
      data.reportWay = "img";
      const img = new Image();
      img.src =
        url + "?v=" + new Date().getTime() + "&" + this.formatParams(data);
    } catch (error) {
      console.log(error);
    }
  }

  /*
   *格式化参数
   */
  formatParams(data: { [x: string]: string | number | boolean }) {
    const arr: any[] = [];
    for (const name in data) {
      arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
    }
    return arr.join("&");
  }
}
