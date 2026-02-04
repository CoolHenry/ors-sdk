type Dictionary<T> = { [key: string]: T };

export type RawLocation = string | Location;
export interface RouteRecordV3 {
  path: string;
  regex: RegExp;
  components: any;
  instances: any;
  name?: string;
  parent?: RouteRecordV3;
  redirect?: any;
  matchAs?: string;
  meta: any;
  beforeEnter?: (route: RouteV3, redirect: (location: RawLocation) => void, next: () => void) => any;
  props: any;
}

export interface RouteV3 {
  path: string;
  name?: string;
  hash: string;
  query: Dictionary<string | string[]>;
  params: Dictionary<string>;
  fullPath: string;
  matched: RouteRecordV3[];
  redirectedFrom?: string;
  meta?: any;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export type NavigationGuardV3<V extends any = any> = (
  to: RouteV3,
  from: RouteV3,
  next: (to?: RawLocation | false | ((vm: V) => any) | void) => void
) => any;

export type VueRouterV3ResolvedRes = {
  location: Location;
  route: RouteV3;
  href: string;
  // backwards compat
  normalizedTo: Location;
  resolved: RouteV3;
};

export type VueRouterV3 = {
  beforeEach(guard: NavigationGuardV3): (...args: unknown[]) => unknown;
  resolve(to: RawLocation, current?: RouteV3, append?: boolean): VueRouterV3ResolvedRes;
  options?: { base?: string };
};

export type VueRouterV4ResolvedRes = RouteV3;

export type VueRouterV4 = {
  beforeEach(guard: NavigationGuardV3): (...args: unknown[]) => unknown;
  resolve(to: RawLocation, current?: RouteV3, append?: boolean): VueRouterV4ResolvedRes;
  options?: { base?: string };
};
