import axios from "axios";
import Cookies from "js-cookie";
import { ElMessage } from "element-plus";
import router from "../router";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 6000,
});

instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

instance.interceptors.response.use(
  (result) => {
    return result.data;
  },
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || "请求失败";

    if (status === 401) {
      Cookies.remove("token");
      ElMessage.error("登录已过期，请重新登录");
      router.push("/login");
    } else if (status === 403) {
      ElMessage.error("权限不足");
    } else {
      ElMessage.error(message);
    }

    return Promise.reject(err);
  }
);

export default instance;
