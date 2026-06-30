<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../../store/user";
import { Promotion, SwitchButton, User, ArrowDown } from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();
const currentTime = ref(new Date().toLocaleTimeString("zh-CN"));
const currentDate = ref(
  new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  })
);
let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString("zh-CN");
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const handleCommand = (command: string) => {
  if (command === "logout") {
    userStore.logout();
    router.push("/login");
  }
};
</script>

<template>
  <div class="m3-header">
    <div class="header-left">
      <el-icon size="24" color="var(--el-color-primary)"><Promotion /></el-icon>
      <h1 class="system-title">农业数据分析和管理系统</h1>
    </div>

    <div class="header-right">
      <div class="time-display">
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>

      <el-divider direction="vertical" />

      <el-dropdown @command="handleCommand" trigger="click" popper-class="m3-dropdown-popper">
        <div class="m3-user-profile">
          <el-avatar :size="36" style="background-color: var(--el-color-primary)">
            {{ userStore.user?.username?.charAt(0) }}
          </el-avatar>
          <div class="user-info">
            <span class="username">{{ userStore.user?.username }}</span>
            <span class="role">{{ userStore.user?.role }}</span>
          </div>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :icon="User" disabled>
              <span>{{ userStore.user?.role }}</span>
            </el-dropdown-item>
            <el-dropdown-item :icon="SwitchButton" command="logout" divided>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.m3-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 64px;
  padding: 0 24px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--m3-outline);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.system-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--m3-on-surface);
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-display {
  text-align: right;
}

.time-display .time {
  font-size: 18px;
  font-weight: 600;
  color: var(--m3-on-surface);
  line-height: 1.2;
}

.time-display .date {
  font-size: 12px;
  color: var(--m3-on-surface-variant);
}

.el-divider {
  border-color: var(--m3-outline);
  height: 32px;
}

.m3-user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px 6px 8px;
  border-radius: 20px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.m3-user-profile:hover {
  background-color: var(--el-color-primary-light-9);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--m3-on-surface);
  line-height: 1.2;
}

.role {
  font-size: 12px;
  color: var(--m3-on-surface-variant);
}

.arrow-icon {
  font-size: 12px;
  color: var(--m3-on-surface-variant);
  transition: transform 0.2s ease;
}

.m3-user-profile:hover .arrow-icon {
  transform: rotate(180deg);
}
</style>
