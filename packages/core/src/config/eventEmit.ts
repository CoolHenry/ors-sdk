class EventEmitter {
  private events: any;
  constructor() {
    this.events = {};
  }

  // 订阅事件
  on(eventName: string, callback: { (args: any): void }) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return () => this.off(eventName, callback);
  }

  // 发布事件
  emit(eventName: string, data: any) {
    const eventCallbacks = this.events[eventName];
    if (eventCallbacks) {
      eventCallbacks.forEach((callback: (arg0: any) => any) => callback(data));
    }
  }

  // 取消订阅
  off(eventName: string, callback: { (args: any): void }) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        (cb: {
          (...args: any[]): void;
          (): void;
          (): void;
          (resource: any): void;
          (): void;
          (): void;
          (...args: any[]): void;
        }) => cb !== callback,
      );
    }
  }

  // 只订阅一次
  once(eventName: string, callback: (...arg: any) => void) {
    const onceWrapper = (...args: any[]) => {
      callback(...args);
      this.off(eventName, onceWrapper);
    };
    return this.on(eventName, onceWrapper);
  }
}
const eventBus = new EventEmitter();

export default eventBus;
