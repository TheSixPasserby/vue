import type { App } from "vue";
import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import Cookies from "js-cookie";

const baseRoutes: RouteRecordRaw[] = [
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
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: baseRoutes,
});

const dynamicRouteMap: Record<string, () => Promise<any>> = {
  "/homepage/dashboard": () => import("../views/dashboard/dashboard.vue"),
  "/homepage/crops": () => import("../views/crops/crops.vue"),
  "/homepage/fields": () => import("../views/fields/fields.vue"),
  "/homepage/weather": () => import("../views/weather/weather.vue"),
  "/homepage/supplies": () => import("../views/supplies/supplies.vue"),
  "/homepage/users": () => import("../views/users/users.vue"),
};

let dynamicRoutesAdded = false;

export const addDynamicRoutes = (menuPaths: string[]) => {
  if (dynamicRoutesAdded) return;

  const homepageRoute = router.getRoutes().find((r) => r.name === "homepage");
  if (!homepageRoute) return;

  menuPaths.forEach((path) => {
    const component = dynamicRouteMap[path];
    if (component) {
      router.addRoute("homepage", {
        path: path.replace("/homepage/", ""),
        name: path.replace("/homepage/", ""),
        component,
      });
    }
  });

  dynamicRoutesAdded = true;
};

export const resetDynamicRoutes = () => {
  const dynamicRoutes = router.getRoutes().filter((r) => r.name !== "homepage" && r.name !== "login" && r.name !== undefined);
  dynamicRoutes.forEach((route) => {
    if (route.name && route.name !== "homepage" && route.name !== "login") {
      router.removeRoute(route.name);
    }
  });
  dynamicRoutesAdded = false;
};

router.beforeEach((to, _from, next) => {
  const token = Cookies.get("token");

  if (to.path === "/login") {
    if (token) {
      next("/homepage");
    } else {
      next();
    }
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
