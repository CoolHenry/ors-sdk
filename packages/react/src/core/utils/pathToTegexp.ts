import { match as pathMatch } from 'path-to-regexp';
import { FlattenedRoute, Route, MatchResult } from '../types/route';
import { logReport } from '@ors-sdk/web';

function flattenRoutes(routes: Route[], baseUrl: string, parentPath = ''): FlattenedRoute[] {
  const result: FlattenedRoute[] = [];
  try {
    if (Array.isArray(routes) && routes.length) {
      routes.forEach((route) => {
        if (!route.path) return;

        // 拼接父子 path
        const fullPath = `${baseUrl || ''}${parentPath}/${route.path}`.replace(/\/+/g, '/');
        result.push({
          fullPath,
          name: route.name || route.title,
        });

        if (route.routes) {
          result.push(...flattenRoutes(route.routes, baseUrl, '')); // 针对react-routerv5版本嵌套子路由全拼，去掉多余的父级路由path
        }
      });
    }

    return result;
  } catch (error) {
    logReport('flattenRoutes', error);
    return result;
  }
}

export function matchRouteFromConfig(pathname: string, baseUrl: string, routes: Route[]): MatchResult | null {
  try {
    const flatRoutes = flattenRoutes(routes, baseUrl);
    for (const route of flatRoutes) {
      const matcher = pathMatch(route.fullPath, {});
      const matched = matcher(pathname);
      if (matched) {
        return {
          pattern: route.fullPath,
          params: matched.params,
          name: route.name,
        };
      }
    }
  } catch (error) {
    logReport('matchRouteFromConfig', error);
  }
  return null;
}

export function getPathName(pathname: string): string {
  try {
    return pathname.includes('#') ? pathname.replace(/^#\/?/, '/') : pathname;
  } catch (error) {
    logReport('getPathName', error);
    return '';
  }
}
