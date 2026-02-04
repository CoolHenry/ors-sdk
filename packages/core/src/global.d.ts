export {}; // 确保文件被视为模块

declare global {
  interface Window {
    intervalUpdate: number | NodeJS.Timeout | null;
    LTimer?: NodeJS.Timeout | null;
  }
  interface Console {
    tError: any;
    tWarn: any;
    tInfo: any;
  }
}
