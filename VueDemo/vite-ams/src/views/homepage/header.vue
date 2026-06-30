<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store/user';
import { ElMessageBox } from 'element-plus';
import { Promotion, SwitchButton } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const currentTime = ref(new Date().toLocaleTimeString("zh-CN"));
const currentDate = ref(new Date().toLocaleDateString("zh-CN", { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' }));
let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString("zh-CN");
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const handleLoginOut = () => {
  ElMessageBox.confirm('确定退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.loginout();
    router.push("/login");
  }).catch(() => {});
};
</script>

<template>
  <div class="header_container">
    <div class="header_left">
      <el-icon size="22" color="#fff"><Promotion /></el-icon>
      <h1 class="system_title">农业数据分析和管理系统</h1>
    </div>

    <div class="header_right">
      <div class="header_time">
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>
      <el-divider direction="vertical" />
      <div class="user_info">
        <el-avatar :size="32" style="background-color: #409eff">
          {{ userStore.user?.username?.charAt(0) }}
        </el-avatar>
        <div class="user_detail">
          <span class="user_name">{{ userStore.user?.username }}</span>
          <span class="user_role">{{ userStore.user?.role }}</span>
        </div>
      </div>
      <el-button type="danger" text @click="handleLoginOut">
        <el-icon size="16"><SwitchButton /></el-icon>
        <span style="margin-left: 4px">退出</span>
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="css">
.header_container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 64px;
  padding: 0 20px;
  background: linear-gradient(90deg, #304156 0%, #3a4f65 100%);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.header_left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.system_title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
}

.header_right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header_time {
  text-align: right;
}

.header_time .time {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
}

.header_time .date {
  font-size: 12px;
  color: #bfcbd9;
}

.el-divider {
  border-color: rgba(255, 255, 255, 0.2);
  height: 30px;
}

.user_info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user_detail {
  display: flex;
  flex-direction: column;
}

.user_name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  line-height: 1.2;
}

.user_role {
  font-size: 12px;
  color: #bfcbd9;
}
</style>
