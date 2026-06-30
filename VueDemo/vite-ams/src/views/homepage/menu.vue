<script setup lang="ts">
import { useMenusStore } from "../../store/menus";
import { useRouter, useRoute } from "vue-router";
import { computed, markRaw } from "vue";
import {
  DataLine,
  Crop,
  Sunny,
  Box,
  Setting,
  Menu,
  Odometer,
  Location,
  User,
} from "@element-plus/icons-vue";

const menuStore = useMenusStore();
const router = useRouter();
const route = useRoute();

const defaultActive = computed(() => route.path);

const menuIcons: Record<number, any> = {
  1: markRaw(DataLine),
  2: markRaw(Crop),
  3: markRaw(Sunny),
  4: markRaw(Box),
  5: markRaw(Setting),
};

const childIcons: Record<string, any> = {
  "/homepage/dashboard": markRaw(Odometer),
  "/homepage/crops": markRaw(Crop),
  "/homepage/fields": markRaw(Location),
  "/homepage/weather": markRaw(Sunny),
  "/homepage/supplies": markRaw(Box),
  "/homepage/users": markRaw(User),
};

const handleMenuClick = (path: string) => {
  router.push(path);
};
</script>

<template>
  <el-scrollbar class="m3-sidebar-scroll">
    <el-menu
      :default-active="defaultActive"
      :unique-opened="true"
      class="m3-sidebar-menu"
    >
      <el-sub-menu
        v-for="menu in menuStore.homepageMenu"
        :key="menu.id"
        :index="menu.id.toString()"
      >
        <template #title>
          <el-icon><component :is="menuIcons[menu.id] || Menu" /></el-icon>
          <span class="m3-menu-title">{{ menu.title }}</span>
        </template>

        <el-menu-item
          v-for="submenu in menu.children"
          :key="submenu.id"
          :index="submenu.path"
          @click="handleMenuClick(submenu.path)"
        >
          <el-icon><component :is="childIcons[submenu.path] || Menu" /></el-icon>
          <template #title>
            <span>{{ submenu.title }}</span>
          </template>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-scrollbar>
</template>

<style scoped>
.m3-sidebar-scroll {
  height: calc(100vh - 64px);
  background-color: var(--m3-surface);
}

.m3-sidebar-menu {
  border-right: none;
  background-color: transparent;
  padding: 12px;
}

.m3-menu-title {
  font-weight: 600;
}

:deep(.el-sub-menu__title) {
  border-radius: 12px !important;
  color: var(--m3-on-surface-variant) !important;
  height: 48px !important;
  line-height: 48px !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: var(--m3-surface-container-high) !important;
}

:deep(.el-menu-item) {
  border-radius: 100px !important;
  margin-bottom: 4px;
  height: 44px !important;
  line-height: 44px !important;
  color: var(--m3-on-surface-variant) !important;
  transition: all 0.2s ease;
}

:deep(.el-menu-item:hover) {
  background-color: var(--m3-surface-container-high) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary) !important;
  color: #fff !important;
  font-weight: 600;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 8px;
}
</style>
