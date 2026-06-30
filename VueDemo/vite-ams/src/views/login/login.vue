<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { loginApi, getUserMenusApi } from "../../request/api";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useMenusStore } from "../../store/menus";
import { useUserStore } from "../../store/user";
import { addDynamicRoutes } from "../../router";
import { Sunny, Moon, Monitor, User, Lock } from "@element-plus/icons-vue";

const isDark = ref(false);

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  isDark.value = savedTheme === "dark" || (!savedTheme && prefersDark);
  document.documentElement.setAttribute("data-theme", isDark.value ? "dark" : "light");
});

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

const router = useRouter();
const menuStore = useMenusStore();
const userStore = useUserStore();
const loading = ref(false);
const ruleFormRef = ref();

const ruleForm = reactive({
  username: "",
  psw: "",
});

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  psw: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const loginFn = () => {
  ruleFormRef.value.validate().then(async () => {
    loading.value = true;
    try {
      const res = await loginApi({
        username: ruleForm.username,
        psw: ruleForm.psw,
      });

      if (res.code === 200) {
        userStore.updateUserInfo({
          username: res.user.username,
          role: res.user.role,
        });

        Cookies.set("token", res.token, { expires: 7 });

        const menuRes = await getUserMenusApi();
        if (menuRes.code === 200) {
          menuStore.updateMenu(menuRes.menus);

          const menuPaths = menuRes.menus.flatMap((m) => m.children?.map((c) => c.path) || []);
          addDynamicRoutes(menuPaths);

          ElMessage.success("登录成功");
          router.push("/homepage/dashboard");
        }
      }
    } catch {
      // 错误已在拦截器中处理
    } finally {
      loading.value = false;
    }
  });
};
</script>

<template>
  <div class="m3-login-container">
    <el-button
      class="theme-btn"
      circle
      :icon="isDark ? Moon : Sunny"
      @click="toggleTheme"
      size="large"
    />

    <div class="m3-login-card">
      <div class="login-header">
        <div class="logo-box">
          <el-icon size="36" color="var(--el-color-primary)"><Monitor /></el-icon>
        </div>
        <h1 class="title">登录系统</h1>
        <p class="subtitle">农业数据分析和管理系统</p>
        <div class="student-info">246230114 卢楚涵 24级软件一班</div>
      </div>

      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" class="m3-form">
        <el-form-item prop="username">
          <el-input
            v-model="ruleForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="psw">
          <el-input
            v-model="ruleForm.psw"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="loginFn"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="submit-btn"
            @click="loginFn"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="test-account-tip">
        测试账号：admin / 111111（管理员） | 张三 / 222222（普通用户）
      </div>
    </div>
  </div>
</template>

<style scoped>
.m3-login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--m3-bg-color);
  position: relative;
  transition: background-color 0.3s ease;
}

.theme-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  background-color: var(--m3-surface-container) !important;
  border: none !important;
  color: var(--m3-on-surface) !important;
  font-size: 20px;
}

.theme-btn:hover {
  background-color: var(--m3-surface-container-high) !important;
}

.m3-login-card {
  width: 400px;
  padding: 48px;
  background-color: var(--m3-surface);
  border-radius: 32px;
  border: 1px solid var(--m3-outline);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-box {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background-color: var(--m3-surface-container-high);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--m3-on-surface);
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--m3-on-surface-variant);
  margin: 0;
}

.student-info {
  font-size: 12px;
  color: var(--m3-on-surface-variant);
  margin-top: 12px;
  padding: 6px 16px;
  background-color: var(--m3-surface-container);
  border-radius: 8px;
  display: inline-block;
}

.m3-form :deep(.el-input__wrapper) {
  background-color: var(--m3-surface-container);
  box-shadow: none !important;
  border-radius: 16px !important;
  padding: 4px 16px;
}

.m3-form :deep(.el-input__wrapper.is-focus) {
  background-color: var(--m3-surface);
  box-shadow: 0 0 0 2px var(--el-color-primary) inset !important;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 100px !important;
  font-size: 16px;
  margin-top: 16px;
}

.test-account-tip {
  text-align: center;
  font-size: 12px;
  color: var(--m3-on-surface-variant);
  margin-top: 24px;
  line-height: 1.6;
}
</style>
