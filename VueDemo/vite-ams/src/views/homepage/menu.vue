<script setup lang="ts">
import { useMenusStore } from '../../store/menus';
import { useRouter, useRoute } from 'vue-router';
import { computed, markRaw } from 'vue';
import {
  DataLine,
  Crop,
  Sunny,
  Box,
  Setting,
  Menu,
} from '@element-plus/icons-vue';

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

const handleMenuClick = (path: string) => {
  router.push(path);
};
</script>

<template>
  <el-scrollbar>
    <el-menu
      :default-active="defaultActive"
      active-text-color="#409eff"
      background-color="#304156"
      text-color="#bfcbd9"
      :unique-opened="true"
    >
      <el-sub-menu
        v-for="menu in menuStore.homepageMenu"
        :key="menu.id"
        :index="menu.id.toString()"
      >
        <template #title>
          <el-icon>
            <component :is="menuIcons[menu.id] || Menu" />
          </el-icon>
          <span>{{ menu.title }}</span>
        </template>
        <el-menu-item
          v-for="submenu in menu.children"
          :key="submenu.id"
          :index="submenu.path"
          @click="handleMenuClick(submenu.path)"
        >
          {{ submenu.title }}
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-scrollbar>
</template>

<style scoped>
.el-scrollbar {
  height: calc(100vh - 64px - 50px);
}

.el-menu {
  border-right: none;
}

.el-menu-item.is-active {
  background-color: #263445 !important;
}

.el-menu-item:hover {
  background-color: #263445 !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #263445 !important;
}
</style>
