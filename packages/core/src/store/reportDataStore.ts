// 上报数据
export const reportDataStore = {
  list: [] as any[],
  add(data: any) {
    this.list.push(data);
  },
  get() {
    return [...this.list];
  },
  clear() {
    this.list = [];
  },
};
