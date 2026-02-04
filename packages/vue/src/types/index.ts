import { VueRouterV3, VueRouterV4 } from './route';

export type CommonVue = {
  config: {
    errorHandler(err: Error, vm: any, info: string): void;
  };
  mixin: (...args: any) => any;
};
export type Vue2 = CommonVue;
export type Vue2InitConfigType = {
  app?: Vue2;
  key?: string | number;
  router?: VueRouterV3 | VueRouterV4;
  /** 不作路由匹配的规则， 默认为 ["*"] */
  ignorePathPattern: string[];
};

export type Vue3 = CommonVue;
export type Vue3InitConfigType = {
  app: Vue3;
  key?: string | number;
  getCurrentInstance?: () => Vue3;
  router?: VueRouterV3 | VueRouterV4;
  /** 不作路由匹配的规则， 默认为 ["*"] */
  ignorePathPattern: string[];
};

export interface IComponentData {
  componentId: number;
  beforeCreate: number;
  mounted: number;
  name: string;
  status: string;
  orsCompMark?: string;
}

export type ICompData = {
  [key: string]: IComponentData;
};

export type UnknownFunc = (...args: unknown[]) => void;

export type ViewModel = {
  _isVue?: boolean;
  __isVue?: boolean;
  $root: ViewModel;
  $parent?: ViewModel;
  $props: { [key: string]: any };
  $options?: {
    name?: string;
    propsData?: { [key: string]: any };
    _componentTag?: string;
    __file?: string;
    __name?: string;
  };
};
