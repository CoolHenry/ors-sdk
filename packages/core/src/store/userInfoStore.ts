import type { UserAttrsInfo } from "@/types/init";

/**
 * 用户行为信息存储，包括userId,userEmail
 */
class UserInfoStore {
  private userInfo: UserAttrsInfo;
  constructor() {
    this.userInfo = {
      userId: "",
      isSign: 0,
      userEmail: "",
    };
  }
  set<K extends keyof UserAttrsInfo>(key: K, value: UserAttrsInfo[K]) {
    if (key === "userId") {
      this.userInfo.isSign = value ? 1 : 0;
    }
    this.userInfo[key] = value;
  }
  get(key?: keyof UserAttrsInfo) {
    return key ? this.userInfo[key] : this.userInfo;
  }
  clear(key?: keyof UserAttrsInfo) {
    if (key) {
      if (key === "userId" || key === "isSign") {
        this.userInfo.isSign = 0;
      } else {
        this.userInfo[key] = "";
      }
    } else {
      this.userInfo = {
        userId: "",
        isSign: 0,
        userEmail: "",
      };
    }
  }
}
export const userInfoStore = new UserInfoStore();
