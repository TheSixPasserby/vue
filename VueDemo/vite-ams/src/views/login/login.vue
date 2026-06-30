<script setup lang="ts">
import { reactive, ref } from "vue";
import { loginApi, getUserMenusApi } from "../../request/api";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useMenusStore } from "../../store/menus";
import { useUserStore } from "../../store/user";
import { addDynamicRoutes } from "../../router";

const router = useRouter();
const menuStore = useMenusStore();
const userStore = useUserStore();
const loading = ref(false);

const ruleForm = reactive({
  username: "",
  psw: "",
});

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  psw: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const ruleFormRef = ref();

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

          const menuPaths = menuRes.menus.flatMap((m) =>
            m.children?.map((c) => c.path) || []
          );
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
  <div class="login-container">
    <div class="login-bg">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-icon">
            <el-icon size="40" color="#409eff"><Monitor /></el-icon>
          </div>
          <h1 class="login-title">农业数据分析和管理系统</h1>
          <p class="login-subtitle">Agriculture Data Analysis & Management System</p>
        </div>

        <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" class="login-form">
          <el-form-item prop="username">
            <el-input v-model="ruleForm.username" placeholder="请输入用户名" size="large" prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="psw">
            <el-input
              v-model="ruleForm.psw"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="loginFn"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" :loading="loading" class="login-btn" @click="loginFn">
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p class="test-accounts">测试账号：admin / 111111（管理员） | 张三 / 222222（普通用户）</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.login-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.login-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.login-bg::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.login-card {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #e8f4fd 0%, #d4e8fa 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px;
  line-height: 1.4;
}

.login-subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 16px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 8px;
}

.login-footer {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.test-accounts {
  font-size: 12px;
  color: #909399;
  margin: 0;
  line-height: 1.6;
}
</style>
