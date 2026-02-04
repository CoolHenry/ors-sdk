import { SessionParams } from "@/types/init";

export interface TempleObjType {
  name: string;
  initiatorType: string;
  nextHopProtocol: string;
  redirectTime: string;
  dnsTime: string;
  tcpTime: string;
  ttfbTime: string;
  responseTime: string;
  reqTotalTime: string;
}
export interface EntryType {
  initiatorType: string;
  nextHopProtocol: string;
  name: string;
  redirectEnd: number | string;
  redirectStart: number | string;
  domainLookupEnd: number | string;
  domainLookupStart: number | string;
  connectEnd: number | string;
  connectStart: number | string;
  requestStart: number | string;
  responseStart: number | string;
  responseEnd: number | string;
}

export interface NavigationVitalsData {
  FID: number | null;
  CLS: number | null;
  INP: number | null;
}
export interface PageLoadVitalsData extends NavigationVitalsData {
  FP: number | null;
  FCP: number | null;
  TTFB: number | null;
  LCP: number | null;
  lcpElement: string | null;
  lcpId: string | null;
  lcpUrl: string | null;
  lcpLoadTime: number | null;
  lcpRenderTime: number | null;
  lcpSize: number | null;
  clsSource: string | null;
  inpEventType: string | null;
  inpElement: string | null;
  inpId: string | null;
  inpClassName: string | null;
  inpSrc: string | null;
  inpTextSnippet: string | null;
  perfromanceTimeOrigin: number | null;
  navigationTiming: PerformanceNavigationTiming | null;
  perfromanceTiming: PerformanceTiming | null;
}

export interface PerformanceInitParams {
  pageType: "pageload" | "navigation";
  viewId: string;
  projectConfig: SessionParams;
}

// 在类内部或顶部添加类型定义（推荐方式）
export interface ObservePerformanceOptions {
  viewStartTime?: number; // 可选属性
}

// 在type文件中定义枚举
export enum VitalsName {
  FP = "FP",
  FCP = "FCP",
  LCP = "LCP",
  INP = "INP",
  FID = "FID",
  CLS = "CLS",
  TTFB = "TTFB",
}
