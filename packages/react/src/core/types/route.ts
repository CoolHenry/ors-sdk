import { ReactElement, ComponentType } from 'react';
export interface Route {
  title?: string | undefined;
  path?: string;
  name?: string;
  routes?: Route[];
}

export interface FlattenedRoute {
  fullPath: string;
  name?: string;
}

export interface MatchResult {
  pattern: string;
  params: any;
  name?: string;
}

export interface ReactRouterV6Route {
  path?: string;
  // 主要用于 React Router V6 的标准写法（推荐）
  element?: ReactElement;
  // 新增属性，用于兼容直接传递组件的情况（可选）
  Component?: ComponentType<any>;
  children?: ReactRouterV6Route[];
}

export type RouterV5Config = {
  routes: Route[];
  baseUrl?: string;
  key?: string | number;
};
export type RouterV6Config = {
  routes: ReactRouterV6Route[];
  baseUrl?: string;
  matchRoutes: any;
  key?: string | number;
};

export type ReactV5IntegrationConfig = RouterV5Config;
export type ReactV6IntegrationConfig = RouterV6Config;
