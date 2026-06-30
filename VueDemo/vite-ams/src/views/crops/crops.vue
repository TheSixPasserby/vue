<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCropsApi, addCropApi, updateCropApi, deleteCropApi, type CropItem } from "../../request/api";

const tableData = ref<CropItem[]>([]);
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const searchKeyword = ref("");
const searchType = ref("");
const searchStatus = ref("");

const formData = ref<Partial<CropItem>>({});
const formRules = {
  name: [{ required: true, message: "请输入作物名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择作物类型", trigger: "change" }],
  area: [{ required: true, message: "请输入种植面积", trigger: "blur" }],
};

const cropTypes = ["粮食作物", "经济作物", "蔬菜", "水果"];
const cropStatuses = ["生长中", "已收割", "待种植"];

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getCropsApi({
      keyword: searchKeyword.value,
      type: searchType.value,
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
  formData.value = { name: "", type: "粮食作物", area: 0, yield: 0, plantDate: "", status: "待种植", location: "" };
  dialogVisible.value = true;
};

const handleEdit = (row: CropItem) => {
  isEdit.value = true;
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: CropItem) => {
  await ElMessageBox.confirm("确定删除该作物信息吗？", "提示", { type: "warning" });
  const res = await deleteCropApi(row.id);
  if (res.code === 200) {
    ElMessage.success("删除成功");
    loadData();
  }
};

const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    if (isEdit.value && formData.value.id) {
      const res = await updateCropApi(formData.value.id, formData.value);
      if (res.code === 200) {
        ElMessage.success("更新成功");
        dialogVisible.value = false;
        loadData();
      }
    } else {
      const res = await addCropApi(formData.value);
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
          <span class="card-title">作物管理</span>
          <div class="search-bar">
            <el-input v-model="searchKeyword" placeholder="搜索作物名称" clearable style="width: 180px" @clear="loadData" />
            <el-select v-model="searchType" placeholder="作物类型" clearable style="width: 140px" @change="loadData">
              <el-option v-for="t in cropTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <el-select v-model="searchStatus" placeholder="状态" clearable style="width: 120px" @change="loadData">
              <el-option v-for="s in cropStatuses" :key="s" :label="s" :value="s" />
            </el-select>
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button type="success" @click="handleAdd">新增作物</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="作物名称" width="120" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="area" label="种植面积(亩)" width="120" />
        <el-table-column prop="yield" label="预计产量(kg)" width="120" />
        <el-table-column prop="plantDate" label="种植日期" width="120">
          <template #default="{ row }">{{ row.plantDate || "-" }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '生长中' ? 'success' : row.status === '已收割' ? 'info' : 'warning'" effect="light">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="所在区域" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">{{ row.location || "-" }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="isEdit ? '编辑作物' : '新增作物'" v-model="dialogVisible" width="500px" destroy-on-close>
      <el-form :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="作物名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="作物类型" prop="type">
          <el-select v-model="formData.type" style="width: 100%">
            <el-option v-for="t in cropTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="种植面积" prop="area">
          <el-input-number v-model="formData.area" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预计产量(kg)">
          <el-input-number v-model="formData.yield" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="种植日期">
          <el-date-picker v-model="formData.plantDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option v-for="s in cropStatuses" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="所在区域">
          <el-input v-model="formData.location" />
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
