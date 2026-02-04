import { RouteV3, VueRouterV3, VueRouterV3ResolvedRes, VueRouterV4 } from '@/types/route';
import { AbstractPathMatcher, logReport } from '@ors-sdk/web';

export class VuePathMatcher implements AbstractPathMatcher {
  key?: string | number;
  private baseUrl = '';
  private router: VueRouterV3 | VueRouterV4;
  private ignorePathPattern: string[];
  constructor(router: VueRouterV3 | VueRouterV4, ignorePathPattern: string[], key?: string | number) {
    this.key = key;
    this.ignorePathPattern = ['*', ...(ignorePathPattern || [])];
    this.baseUrl = (router.options?.base || '').replace(/\/+$/, '');
    this.router = router;
  }
  matchPath(pathname: string) {
    try {
      if (!this.router) {
        return undefined;
      }
      const filterBaseurlPathname = pathname.replace(this.baseUrl, '');
      const resolvedRes = this.router?.resolve ? this.router.resolve(filterBaseurlPathname) : null;
      if (!resolvedRes) {
        return;
      }
      let resolved: RouteV3;
      if (isV3ResolveValue(resolvedRes)) {
        resolved = resolvedRes.resolved;
      } else {
        resolved = resolvedRes;
      }
      const matchedArr = resolved?.matched || [];
      const last = matchedArr[matchedArr.length - 1];

      const pattern = last?.path || resolved?.path || '';
      const name = last?.name || resolved?.name || document?.title || '';
      const baseUrlPattern = `${this.baseUrl}${pattern}`;
      const transactionName = last?.name || resolved?.name || baseUrlPattern;
      if (!this.ignorePathPattern.includes(pattern)) {
        return { pattern: transactionName, name };
      }
      return undefined;
    } catch (error) {
      logReport('vue-router-match', error);
      return undefined;
    }
  }
}

export const isV3ResolveValue = (result: any): result is VueRouterV3ResolvedRes => {
  return !!result?.resolved;
};
