<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getSuppliesApi, addSupplyApi, updateSupplyApi, deleteSupplyApi, type SupplyItem } from "../../request/api";

const tableData = ref<SupplyItem[]>([]);
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const searchKeyword = ref("");
const searchType = ref("");

const formData = ref<Partial<SupplyItem>>({});
const formRules = {
  name: [{ required: true, message: "请输入农资名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择类型", trigger: "change" }],
  stock: [{ required: true, message: "请输入库存量", trigger: "blur" }],
  unit: [{ required: true, message: "请输入单位", trigger: "blur" }],
};

const supplyTypes = ["化肥", "农药", "种子", "农资"];

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getSuppliesApi({ keyword: searchKeyword.value, type: searchType.value });
    if (res.code === 200) {
      tableData.value = res.data;
    }
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  isEdit.value = false;
  formData.value = { name: "", type: "化肥", stock: 0, unit: "kg", supplier: "", price: 0 };
  dialogVisible.value = true;
};

const handleEdit = (row: SupplyItem) => {
  isEdit.value = true;
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: SupplyItem) => {
  await ElMessageBox.confirm("确定删除该农资信息吗？", "提示", { type: "warning" });
  const res = await deleteSupplyApi(row.id);
  if (res.code === 200) {
    ElMessage.success("删除成功");
    loadData();
  }
};

const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    if (isEdit.value && formData.value.id) {
      const res = await updateSupplyApi(formData.value.id, formData.value);
      if (res.code === 200) {
        ElMessage.success("更新成功");
        dialogVisible.value = false;
        loadData();
      }
    } else {
      const res = await addSupplyApi(formData.value);
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

const getStockStatus = (stock: number) => {
  if (stock <= 100) return "danger";
  if (stock <= 500) return "warning";
  return "success";
};

onMounted(loadData);
</script>

<template>
  <div class="m3-page">
    <el-card shadow="never" class="m3-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">农资管理</span>
          <div class="search-bar">
            <el-input v-model="searchKeyword" placeholder="搜索农资名称" clearable style="width: 180px" @clear="loadData" />
            <el-select v-model="searchType" placeholder="农资类型" clearable style="width: 140px" @change="loadData">
              <el-option v-for="t in supplyTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button type="success" @click="handleAdd">新增农资</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="农资名称" width="120" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="stock" label="库存量" width="120">
          <template #default="{ row }">
            <el-tag :type="getStockStatus(row.stock)" effect="light">
              {{ row.stock }} {{ row.unit }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="70" />
        <el-table-column prop="supplier" label="供应商" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.supplier || "-" }}</template>
        </el-table-column>
        <el-table-column prop="price" label="单价(元)" width="100">
          <template #default="{ row }">{{ row.price ? `¥${row.price}` : "-" }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="isEdit ? '编辑农资' : '新增农资'" v-model="dialogVisible" width="500px" destroy-on-close>
      <el-form :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="农资名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" style="width: 100%">
            <el-option v-for="t in supplyTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存量" prop="stock">
          <el-input-number v-model="formData.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" placeholder="如：kg、L、卷" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="formData.supplier" />
        </el-form-item>
        <el-form-item label="单价(元)">
          <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
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
