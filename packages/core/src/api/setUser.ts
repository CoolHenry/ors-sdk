// 自定义字段
import { logReport } from "@/config";
import { UserAttrsInfo } from "@/types/init";
import { userInfoStore } from "@/store";

export const setUser = (userInfo: Partial<UserAttrsInfo>) => {
  try {
    if (userInfo) {
      Object.keys(userInfo).forEach((key) => {
        const typedKey = key as keyof UserAttrsInfo; // 添加类型断言
        const value = userInfo[typedKey];
        if (value !== undefined) {
          userInfoStore.set(typedKey, value);
        }
      });
    }
  } catch (error) {
    logReport("setUser", error);
  }
};
