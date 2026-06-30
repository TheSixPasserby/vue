import { defineStore } from "pinia";
import { ref } from "vue";
import Cookies from "js-cookie";
import { resetDynamicRoutes } from "../router";

export interface UserInfo {
  username: string;
  role: string;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<UserInfo>();

  function updateUserInfo(userParam: UserInfo) {
    user.value = userParam;
  }

  function logout() {
    user.value = undefined;
    Cookies.remove("token");
    resetDynamicRoutes();
  }

  return {
    user,
    updateUserInfo,
    logout,
  };
});
