import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { initRouter } from './router/index.ts'
import { createPinia } from 'pinia'
// 引入项目路由
// createApp(App).use(router).mount('#app') // 链式
// 引入pinia
const pinia = createPinia()

// 拆解
const app = createApp(App)
// 在main.ts中直接引入router路由实例会导致路由具体实现细节被暴露（危险）
// app.use(router) // 封装
initRouter(app)
app.use(pinia)
app.mount("#app")
