<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getUsersApi, addUserApi, updateUserApi, deleteUserApi, type UserItem } from "../../request/api";

const tableData = ref<UserItem[]>([]);
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const searchKeyword = ref("");
const searchRole = ref("");
const searchStatus = ref("");

const formData = ref<Partial<UserItem> & { psw?: string }>({});
const formRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
  phone: [{ required: true, message: "请输入手机号", trigger: "blur" }],
};

const roles = ["管理员", "普通用户"];
const userStatuses = ["启用", "禁用"];

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getUsersApi({
      keyword: searchKeyword.value,
      role: searchRole.value,
      status: searchStatus.value,
    });
    if (res.code === 200) {
      tableData.value = res.data;
    }
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  isEdit.value = false;
  formData.value = { username: "", psw: "123456", role: "普通用户", phone: "", status: "启用" };
  dialogVisible.value = true;
};

const handleEdit = (row: UserItem) => {
  isEdit.value = true;
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: UserItem) => {
  await ElMessageBox.confirm("确定删除该用户吗？", "提示", { type: "warning" });
  const res = await deleteUserApi(row.id);
  if (res.code === 200) {
    ElMessage.success("删除成功");
    loadData();
  }
};

const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    if (isEdit.value && formData.value.id) {
      const { psw, ...rest } = formData.value;
      const res = await updateUserApi(formData.value.id, rest);
      if (res.code === 200) {
        ElMessage.success("更新成功");
        dialogVisible.value = false;
        loadData();
      }
    } else {
      const res = await addUserApi(formData.value as any);
      if (res.code === 200) {
        ElMessage.success("添加成功");
        dialogVisible.value = false;
        loadData();
      }
    }
  } finally {
    submitLoading.value = false;
  }
};

onMounted(loadData);
</script>

<template>
  <div class="m3-page">
    <el-card shadow="never" class="m3-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">用户管理</span>
          <div class="search-bar">
            <el-input v-model="searchKeyword" placeholder="搜索用户名" clearable style="width: 180px" @clear="loadData" />
            <el-select v-model="searchRole" placeholder="角色" clearable style="width: 120px" @change="loadData">
              <el-option v-for="r in roles" :key="r" :label="r" :value="r" />
            </el-select>
            <el-select v-model="searchStatus" placeholder="状态" clearable style="width: 120px" @change="loadData">
              <el-option v-for="s in userStatuses" :key="s" :label="s" :value="s" />
            </el-select>
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button type="success" @click="handleAdd">新增用户</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="120" show-overflow-tooltip />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === '管理员' ? 'danger' : 'primary'" effect="light">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140">
          <template #default="{ row }">{{ row.phone || "-" }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'" effect="light">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)" :disabled="row.username === 'admin'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="isEdit ? '编辑用户' : '新增用户'" v-model="dialogVisible" width="500px" destroy-on-close>
      <el-form :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" v-if="!isEdit">
          <el-input v-model="formData.psw" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" style="width: 100%">
            <el-option v-for="r in roles" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option v-for="s in userStatuses" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.m3-page {
  padding: 24px;
  background-color: var(--m3-surface);
  min-height: calc(100vh - 64px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--m3-on-surface);
}

.search-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
