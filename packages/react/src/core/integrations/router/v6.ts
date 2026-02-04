import { RouterV6Config } from '@/core/types/route';
import { AbstractPathMatcher, logReport } from '@ors-sdk/web';

export class RouterV6PathMatcher implements AbstractPathMatcher {
  config: RouterV6Config;
  key?: string | number;
  constructor(config: RouterV6Config, key?: string | number) {
    this.config = config;
    this.key = key;
  }
  matchPath(pathname: string) {
    if (!this.config?.matchRoutes || !this.config?.routes || !Array.isArray(this.config?.routes)) {
      return;
    }
    const { routes: routerConfig, baseUrl, matchRoutes } = this.config;
    try {
      if (baseUrl && pathname.startsWith(baseUrl)) {
        pathname = pathname.slice(baseUrl.length) || '/';
      }
      const matchRouter = matchRoutes(routerConfig, pathname);
      const routes = matchRouter && matchRouter.map((e: { route: any }) => e.route);
      if (Array.isArray(routes) && routes.length) {
        const routePathArr = routes && routes.map((e) => e.path);
        const pattern = routePathArr && routePathArr.join('/');
        const matchRoute = routes[routes.length - 1];
        const name = matchRoute?.name || matchRoute?.title || document.title;
        return { pattern, name };
      }
      return { pattern: '' };
    } catch (error) {
      logReport('reactRouterV6BrowserTracing', error);
      return { pattern: '' };
    }
  }
}
