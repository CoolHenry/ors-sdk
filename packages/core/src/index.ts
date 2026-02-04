import { WindowOrsType } from '@/types/windowOrs';

declare global {
  interface Window {
    ors?: any;
    _ors: WindowOrsType;
    MDPWebViewJavascriptBridge?: any;
  }
}
export * from './export';
