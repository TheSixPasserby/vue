import { defineStore } from "pinia";
import { ref } from "vue";
import Cookies from "js-cookie";

export interface UserInfoItf {
  username: string;
  role: string;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<UserInfoItf>();

  function updateUerInfo(userparam: UserInfoItf) {
    user.value = userparam;
  }

  function loginout() {
    user.value = undefined;
    Cookies.remove("token");
  }

  return {
    user,
    updateUerInfo,
    loginout,
  };
});
