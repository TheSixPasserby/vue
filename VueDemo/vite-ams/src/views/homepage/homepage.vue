<script setup lang="ts">
import Menu from "./menu.vue";
import Header from "./header.vue";
</script>

<template>
  <div class="m3-homepage">
    <div class="m3-header">
      <Header />
    </div>
    <div class="m3-body">
      <div class="m3-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">功能导航</span>
        </div>
        <Menu />
      </div>
      <div class="m3-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.m3-homepage {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.m3-header {
  height: 64px;
  flex-shrink: 0;
  z-index: 10;
}

.m3-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.m3-sidebar {
  width: 240px;
  background-color: var(--m3-surface-container);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  border-right: 1px solid var(--m3-outline);
}

.sidebar-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--m3-outline);
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--m3-on-surface-variant);
  letter-spacing: 0.5px;
}

.m3-content {
  flex: 1;
  background-color: var(--m3-surface);
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
