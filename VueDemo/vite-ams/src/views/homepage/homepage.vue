<script setup lang="ts">
import Menu from "./menu.vue";
import Header from "./header.vue";
import { Promotion } from "@element-plus/icons-vue";
</script>

<template>
  <div class="homepage_container">
    <div class="homepage_header">
      <Header />
    </div>
    <div class="homepage_body">
      <div class="homepage_menu">
        <div class="menu-logo">
          <el-icon size="24" color="#409eff"><Promotion /></el-icon>
          <span>功能导航</span>
        </div>
        <Menu />
      </div>
      <div class="homepage_content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.homepage_container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.homepage_header {
  height: 64px;
  flex-shrink: 0;
}

.homepage_body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.homepage_menu {
  width: 240px;
  background-color: #304156;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.menu-logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #bfcbd9;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.homepage_content {
  flex: 1;
  background-color: #f0f2f5;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
