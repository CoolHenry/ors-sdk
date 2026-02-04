/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Logger } from "@/utils/common";
/**
 * @typedef {Object} URLParser URL 解析器对象，用于添加查询参数，和重新获取添加查询参数后的 URL 字符串
 * @property {Function} setUrl <strong>setUrl(url:String)->void</strong><br>重新设置需要解析的 url
 * @property {Function} addQueryString <strong>addQueryString(obj:Object)->string</strong><br>添加查询参数、传入参数是一个 Key/Value 键值对对象
 * @property {Function} getUrl <strong>getUrl()->string</strong><br>重新获取 URL 字符串
 */

/** 传入 URL 返回一个 URL 解析对象，用于添加查询参数，和重新获取添加查询参数后的 URL 字符串
 * @category Bom
 * @param {String} url 传入需要添加查询参数的的 URL 字符串
 * @returns {URLParser} 一个 URL 解析对象，用于添加查询参数，和重新获取添加查询参数后的 URL 字符串
 * @function urlParse
 * @example
 * let url = 'https://example.com'
 * let u = urlParse(url);
 * u.addQueryString({name:'Alice'});
 * u.getUrl(); // 'https://example.com?name=Alice'
 */
// 1. 定义类型接口
interface URLParser {
  _values: any;
  setUrl(url: string): void;
  addQueryString(queryObj: Record<string, string>): void;
  getUrl(): string;
  getParse(): Record<string, string>; // 根据实际返回类型补充
}
export default function urlParse(url: string): URLParser {
  class URLParser {
    //@ts-ignore
    _fields = {
      Username: 4,
      Password: 5,
      Port: 7,
      Protocol: 2,
      Host: 6,
      Path: 8,
      URL: 0,
      QueryString: 9,
      Fragment: 10,
    };
    //@ts-ignore
    _values: Record<string, any> = {};
    //@ts-ignore
    // eslint-disable-next-line no-useless-escape
    _regex =
      /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/;
    constructor(url: string) {
      if (typeof url != "undefined") {
        //@ts-ignore
        this._parse(url);
      }
    }

    setUrl(url: any): void {
      this._parse(url);
    }

    _initValues(): void {
      for (const a in this._fields) {
        this._values[a] = "";
      }
    }

    addQueryString(queryObj: { [x: string]: string }) {
      if (typeof queryObj !== "object") {
        return false;
      }
      let query = this._values.QueryString || "";
      for (const i in queryObj) {
        if (new RegExp(i + "[^&]+").test(query)) {
          query = query.replace(new RegExp(i + "[^&]+"), i + "=" + queryObj[i]);
        } else {
          if (query.slice(-1) === "&") {
            query = query + i + "=" + queryObj[i];
          } else {
            if (query === "") {
              query = i + "=" + queryObj[i];
            } else {
              query = query + "&" + i + "=" + queryObj[i];
            }
          }
        }
      }
      this._values.QueryString = query;
      return;
    }

    getParse(): Record<string, string> {
      return this._values;
    }

    getUrl(): string {
      let url = "";
      url += this._values.Origin;
      url += this._values.Port ? ":" + this._values.Port : "";
      url += this._values.Path;
      url += this._values.QueryString ? "?" + this._values.QueryString : "";
      url += this._values.Fragment ? "#" + this._values.Fragment : "";
      return url;
    }

    _parse(url: string): void {
      this._initValues();

      let b = this._regex.exec(url);
      if (!b) {
        //@ts-ignore
        Logger.log("URLParser::_parse -> Invalid URL");
      }

      const urlTmp = url.split("#");
      const urlPart = urlTmp[0];
      const hashPart = urlTmp.slice(1).join("#");
      b = this._regex.exec(urlPart);
      for (const c of Object.keys(
        this._fields,
      ) as (keyof typeof this._fields)[]) {
        if (b && typeof b[this._fields[c]] != "undefined") {
          this._values[c] = b[this._fields[c]];
        }
      }
      this._values["Hostname"] = this._values["Host"].replace(/:\d+$/, "");
      this._values["Origin"] =
        this._values["Protocol"] + "://" + this._values["Hostname"];
      this._values["Fragment"] = hashPart;
    }
  }

  return new URLParser(url);
}
