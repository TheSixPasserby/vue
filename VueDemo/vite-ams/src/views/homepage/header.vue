<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../../store/user";
import { ArrowDown, User, SwitchButton, Sunny, Moon } from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();
const isDark = ref(false);
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
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  isDark.value = savedTheme === "dark" || (!savedTheme && prefersDark);
  document.documentElement.setAttribute("data-theme", isDark.value ? "dark" : "light");

  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString("zh-CN");
  }, 1000);
});

onUnmounted(() => clearInterval(timer));

const toggleTheme = (event: MouseEvent) => {
  const x = event.clientX;
  const y = event.clientY;
  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const isDarkNext = !isDark.value;

  if (!document.startViewTransition) {
    isDark.value = isDarkNext;
    document.documentElement.setAttribute("data-theme", isDarkNext ? "dark" : "light");
    localStorage.setItem("theme", isDarkNext ? "dark" : "light");
    return;
  }

  const transition = document.startViewTransition(() => {
    isDark.value = isDarkNext;
    document.documentElement.setAttribute("data-theme", isDarkNext ? "dark" : "light");
    localStorage.setItem("theme", isDarkNext ? "dark" : "light");
  });

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];
    document.documentElement.animate(
      { clipPath: isDarkNext ? clipPath : [...clipPath].reverse() },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: isDarkNext ? "::view-transition-new(root)" : "::view-transition-old(root)",
      }
    );
  });
};

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
      <span class="system-badge">AMS</span>
      <h2 class="system-title">农业数据分析和管理系统</h2>
      <span class="student-info">246230114 卢楚涵 24级软件一班</span>
    </div>

    <div class="header-right">
      <div class="time-display">
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>

      <el-button
        circle
        class="theme-toggle-btn"
        @click="toggleTheme"
        :icon="isDark ? Moon : Sunny"
      />

      <el-divider direction="vertical" />

      <el-dropdown @command="handleCommand" trigger="click" popper-class="m3-pop-dropdown">
        <div class="m3-user-pill">
          <el-avatar :size="32" style="background-color: var(--el-color-primary); color: #fff">
            {{ userStore.user?.username?.charAt(0) }}
          </el-avatar>
          <div class="user-info">
            <span class="user-name">{{ userStore.user?.username }}</span>
            <span class="user-role">{{ userStore.user?.role }}</span>
          </div>
          <el-icon class="arrow"><ArrowDown /></el-icon>
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
  height: 64px;
  padding: 0 24px;
  background-color: var(--m3-surface);
  border-bottom: 1px solid var(--m3-outline);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.system-badge {
  background-color: var(--el-color-primary);
  color: #fff;
  padding: 4px 12px;
  border-radius: 100px;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.system-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--m3-on-surface);
}

.student-info {
  font-size: 12px;
  color: var(--m3-on-surface-variant);
  background-color: var(--m3-surface-container);
  padding: 4px 12px;
  border-radius: 8px;
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

.theme-toggle-btn {
  border: none !important;
  background-color: var(--m3-surface-container) !important;
  color: var(--m3-on-surface) !important;
  font-size: 18px;
}

.theme-toggle-btn:hover {
  background-color: var(--m3-surface-container-high) !important;
}

.el-divider {
  border-color: var(--m3-outline);
  height: 32px;
}

.m3-user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px 6px 6px;
  border-radius: 100px;
  border: 1px solid var(--m3-outline);
  background-color: var(--m3-surface);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  cursor: pointer;
  user-select: none;
}

.m3-user-pill:hover {
  background-color: var(--m3-surface-container-high);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--m3-on-surface);
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: var(--m3-on-surface-variant);
}

.arrow {
  font-size: 12px;
  color: var(--m3-on-surface-variant);
  transition: transform 0.2s ease;
}

.m3-user-pill:hover .arrow {
  transform: rotate(180deg);
}
</style>

<style>
.m3-pop-dropdown .el-dropdown-menu {
  padding: 8px !important;
  border-radius: 20px !important;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid var(--m3-outline) !important;
}

.m3-pop-dropdown .el-dropdown-menu__item {
  padding: 10px 18px !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  font-size: 14px !important;
}

.m3-pop-dropdown .el-dropdown-menu__item:hover {
  background-color: var(--m3-surface-container) !important;
}

.m3-pop-dropdown .el-dropdown-menu__item.is-disabled {
  color: var(--m3-on-surface-variant) !important;
}
</style>
