export interface whiteScreenOptions {
  skeletonProject?: boolean; // 白屏检测的项目是否有骨架屏
  whiteBoxElements?: string[]; // 白屏检测的容器列表
}

export interface Callback {
  (...args: any[]): any;
}
