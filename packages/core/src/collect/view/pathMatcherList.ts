import { sdkIntegrationEmitter } from "@/utils/mitt";
import { AbstractPathMatcher } from "./pathMatcher";
import { logReport } from "@/config";

/** 支持微前端框架下的多个PathMatcher */
export class PathMatcherList {
  private _pathMatcherList: AbstractPathMatcher[];
  constructor() {
    this._pathMatcherList = [];
    sdkIntegrationEmitter.on("removePathMatcher", this.removePathMatcher);
  }

  //最后新增的pathMatcher优先级更高
  addPathMatcher = (matcher: AbstractPathMatcher) => {
    try {
      if (
        matcher.key &&
        this._pathMatcherList.some((i) => i.key === matcher.key)
      ) {
        return;
      }
      this._pathMatcherList.unshift(matcher);
    } catch (error) {
      logReport("addPathMatcher", error);
      return;
    }
  };

  removePathMatcher = (matcher: AbstractPathMatcher) => {
    try {
      if (!matcher) {
        return;
      }
      this._pathMatcherList = this._pathMatcherList.filter((item) => {
        if (matcher.key && item.key === matcher.key) {
          return false;
        }
        return item !== matcher;
      });
    } catch (error) {
      logReport("removePathMatcher", error);
      return;
    }
  };

  matchPath = (pathname: string) => {
    try {
      for (const matcher of this._pathMatcherList) {
        const res = matcher?.matchPath?.(pathname);
        if (res) {
          return res;
        }
      }
      return undefined;
    } catch (error) {
      logReport("matchPath", error);
      return;
    }
  };
}
