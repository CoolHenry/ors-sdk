import { CollectStoreConfigType, CollectStoreType } from "@/types/init";

/**
 * 用户行为信息存储
 */
export class CollectStore {
  private static options: Required<CollectStoreConfigType> = {
    collectStoreLimit: 100,
  };

  private static storeList: CollectStoreType[] = [];

  /** clear */
  public static clear(): void {
    this.storeList = [];
  }

  /** add */
  public static add(value: CollectStoreType): void {
    // const { action } = this.storeInfo;
    if (this.storeList.length >= this.options.collectStoreLimit) {
      this.storeList.shift();
    }
    this.storeList.push(value);
  }

  /** get */
  public static get(): Readonly<CollectStoreType[]> {
    return [...this.storeList];
  }

  /** flush */
  public static flush(handler: (data: CollectStoreType[]) => void) {
    const list = this.storeList.slice();

    handler(list);
  }
}
