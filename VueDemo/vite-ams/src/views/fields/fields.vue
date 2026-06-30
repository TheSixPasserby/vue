<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getFieldsApi, addFieldApi, updateFieldApi, deleteFieldApi, type FieldItem } from "../../request/api";

const tableData = ref<FieldItem[]>([]);
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const searchKeyword = ref("");
const searchSoilType = ref("");
const searchStatus = ref("");

const formData = ref<Partial<FieldItem>>({});
const formRules = {
  name: [{ required: true, message: "请输入地块名称", trigger: "blur" }],
  area: [{ required: true, message: "请输入面积", trigger: "blur" }],
  soilType: [{ required: true, message: "请选择土壤类型", trigger: "change" }],
};

const soilTypes = ["壤土", "黏土", "砂土", "腐殖土"];
const fieldStatuses = ["使用中", "闲置", "维护中"];

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getFieldsApi({
      keyword: searchKeyword.value,
      soilType: searchSoilType.value,
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
  formData.value = { name: "", area: 0, soilType: "壤土", location: "", irrigation: "滴灌", status: "使用中" };
  dialogVisible.value = true;
};

const handleEdit = (row: FieldItem) => {
  isEdit.value = true;
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: FieldItem) => {
  await ElMessageBox.confirm("确定删除该农田信息吗？", "提示", { type: "warning" });
  const res = await deleteFieldApi(row.id);
  if (res.code === 200) {
    ElMessage.success("删除成功");
    loadData();
  }
};

const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    if (isEdit.value && formData.value.id) {
      const res = await updateFieldApi(formData.value.id, formData.value);
      if (res.code === 200) {
        ElMessage.success("更新成功");
        dialogVisible.value = false;
        loadData();
      }
    } else {
      const res = await addFieldApi(formData.value);
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
          <span class="card-title">农田管理</span>
          <div class="search-bar">
            <el-input v-model="searchKeyword" placeholder="搜索地块名称" clearable style="width: 180px" @clear="loadData" />
            <el-select v-model="searchSoilType" placeholder="土壤类型" clearable style="width: 140px" @change="loadData">
              <el-option v-for="t in soilTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <el-select v-model="searchStatus" placeholder="状态" clearable style="width: 120px" @change="loadData">
              <el-option v-for="s in fieldStatuses" :key="s" :label="s" :value="s" />
            </el-select>
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button type="success" @click="handleAdd">新增农田</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="地块名称" width="140" show-overflow-tooltip />
        <el-table-column prop="area" label="面积(亩)" width="100" />
        <el-table-column prop="soilType" label="土壤类型" width="100" />
        <el-table-column prop="location" label="位置坐标" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.location || "-" }}</template>
        </el-table-column>
        <el-table-column prop="irrigation" label="灌溉方式" width="100">
          <template #default="{ row }">{{ row.irrigation || "-" }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '使用中' ? 'success' : row.status === '闲置' ? 'info' : 'warning'" effect="light">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="isEdit ? '编辑农田' : '新增农田'" v-model="dialogVisible" width="500px" destroy-on-close>
      <el-form :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="地块名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="面积(亩)" prop="area">
          <el-input-number v-model="formData.area" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="土壤类型" prop="soilType">
          <el-select v-model="formData.soilType" style="width: 100%">
            <el-option v-for="t in soilTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置坐标">
          <el-input v-model="formData.location" placeholder="如：东经116.4° 北纬39.9°" />
        </el-form-item>
        <el-form-item label="灌溉方式">
          <el-select v-model="formData.irrigation" style="width: 100%">
            <el-option label="滴灌" value="滴灌" />
            <el-option label="喷灌" value="喷灌" />
            <el-option label="漫灌" value="漫灌" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option v-for="s in fieldStatuses" :key="s" :label="s" :value="s" />
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
