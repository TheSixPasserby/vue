// request.ts文件用于处理网络请求
import axios from "axios";
import Cookies from "js-cookie";

// 创建axios实例
const instance = axios.create({
    baseURL: "http://localhost:3000", // 后端服务器地址
    timeout: 6000 // 毫秒，请求超时时间
})

// 设置请求拦截器：统一添加认证信息、修改请求头
instance.interceptors.request.use(
    config=>{
        // 在这里可以对请求进行配置
        // 把token存在请求头的Authorization字段
        const token = Cookies.get("token")
        if(token){
            config.headers["Authorization"] = token
        }
        return config
    },
    err=>{
        // 请求配置出错时处理的逻辑
        // 返回一个被拒绝的Promise对象，并将错误传递给调用方
        return Promise.reject(err)
    }
)

// 设置响应拦截器
instance.interceptors.response.use(
    result=>{
        // 在这里可以对响应结果进行修改
        return result.data
    },
    err=>{
        // 响应出错时的处理逻辑
        // 返回一个被拒绝的Promise对象，并将错误传递给调用方
        return Promise.reject(err)
    }
)

// 导出
export default instance