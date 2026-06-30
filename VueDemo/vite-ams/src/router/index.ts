import type { App } from "vue";
import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import Cookies from "js-cookie";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login/login.vue"),
  },
  {
    path: "/homepage",
    name: "homepage",
    component: () => import("../views/homepage/homepage.vue"),
    redirect: "/homepage/dashboard",
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("../views/dashboard/dashboard.vue"),
      },
      {
        path: "crops",
        name: "crops",
        component: () => import("../views/crops/crops.vue"),
      },
      {
        path: "fields",
        name: "fields",
        component: () => import("../views/fields/fields.vue"),
      },
      {
        path: "weather",
        name: "weather",
        component: () => import("../views/weather/weather.vue"),
      },
      {
        path: "supplies",
        name: "supplies",
        component: () => import("../views/supplies/supplies.vue"),
      },
      {
        path: "users",
        name: "users",
        component: () => import("../views/users/users.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = Cookies.get("token");
  if (to.path === "/login") {
    next();
  } else if (!token) {
    next("/login");
  } else {
    next();
  }
});

export const initRouter = (app: App<Element>) => {
  app.use(router);
};

export default router;
