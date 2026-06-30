import type { App } from "vue";
import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import Cookies from "js-cookie";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useMenusStore } from "../store/menus";
import { useUserStore } from "../store/user";
import { getUserMenusApi } from "../request/api";

NProgress.configure({ showSpinner: false });

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
  const dynamicRoutes = router.getRoutes().filter(
    (r) => r.name && r.name !== "homepage" && r.name !== "login"
  );
  dynamicRoutes.forEach((route) => {
    if (route.name) {
      router.removeRoute(route.name);
    }
  });
  dynamicRoutesAdded = false;
};

const initUserPermissions = async (): Promise<boolean> => {
  const menuStore = useMenusStore();
  const userStore = useUserStore();

  try {
    const menuRes = await getUserMenusApi();
    if (menuRes.code === 200) {
      menuStore.updateMenu(menuRes.menus);

      const menuPaths = menuRes.menus.flatMap(
        (m) => m.children?.map((c) => c.path) || []
      );
      addDynamicRoutes(menuPaths);

      return true;
    }
    return false;
  } catch {
    return false;
  }
};

router.beforeEach(async (to, _from, next) => {
  NProgress.start();
  const token = Cookies.get("token");
  const menuStore = useMenusStore();

  if (to.path === "/login") {
    if (token) {
      next("/homepage/dashboard");
    } else {
      next();
    }
  } else if (!token) {
    next("/login");
  } else {
    if (menuStore.homepageMenu.length === 0) {
      const success = await initUserPermissions();
      if (success) {
        next({ ...to, replace: true });
      } else {
        Cookies.remove("token");
        resetDynamicRoutes();
        next("/login");
      }
    } else {
      next();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

export const initRouter = (app: App<Element>) => {
  app.use(router);
};

export default router;
