import { RouterV5Config } from '@/core/types/route';
import { matchRouteFromConfig } from '@/core/utils/pathToTegexp';
import { AbstractPathMatcher, logReport } from '@ors-sdk/web';

export class RouterV5PathMatcher implements AbstractPathMatcher {
  config: RouterV5Config;
  key?: string | number;
  constructor(config: RouterV5Config, key?: string | number) {
    this.config = config;
    this.key = key || config.key;
  }
  matchPath(pathname: string) {
    if (!this.config?.routes) {
      return;
    }
    const { baseUrl = '', routes } = this.config;
    try {
      const matchRouter = matchRouteFromConfig(pathname, baseUrl, routes);
      const pattern = matchRouter?.pattern;
      const name = matchRouter?.name || document.title;
      return { pattern, name };
    } catch (error) {
      logReport('reactRouterV5BrowserTracing', error);
      return { pattern: '' };
    }
  }
}
