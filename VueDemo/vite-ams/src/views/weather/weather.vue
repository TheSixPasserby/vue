<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import * as echarts from "echarts";
import { getWeatherApi, addWeatherApi, updateWeatherApi, deleteWeatherApi, type WeatherItem } from "../../request/api";

const tableData = ref<WeatherItem[]>([]);
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts;

const m3Colors = ["#8B5000", "#6750A4", "#49454F", "#386A20"];

const formData = ref<Partial<WeatherItem>>({});
const formRules = {
  date: [{ required: true, message: "请选择日期", trigger: "change" }],
  temperature: [{ required: true, message: "请输入温度", trigger: "blur" }],
  humidity: [{ required: true, message: "请输入湿度", trigger: "blur" }],
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getWeatherApi();
    if (res.code === 200) {
      tableData.value = res.data;
      renderChart(res.data);
    }
  } finally {
    loading.value = false;
  }
};

const renderChart = (data: WeatherItem[]) => {
  if (!chartRef.value) return;
  if (!chart) chart = echarts.init(chartRef.value);
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  chart.setOption({
    color: m3Colors,
    title: {
      text: "气象数据趋势",
      left: "center",
      textStyle: { color: "#1D1B20", fontWeight: 600 },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#ffffff",
      borderColor: "#CAC4D0",
      textStyle: { color: "#1D1B20" },
    },
    legend: {
      top: 36,
      textStyle: { color: "#49454F" },
    },
    grid: {
      top: "20%",
      left: "3%",
      right: "4%",
      bottom: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: sorted.map((d) => d.date),
      axisLabel: { color: "#49454F" },
      axisLine: { lineStyle: { color: "#CAC4D0" } },
    },
    yAxis: [
      {
        type: "value",
        name: "温度(°C)/湿度(%)",
        position: "left",
        axisLabel: { color: "#49454F" },
        splitLine: { lineStyle: { color: "#ECE6F0" } },
      },
      {
        type: "value",
        name: "降雨量(mm)/风速(m/s)",
        position: "right",
        axisLabel: { color: "#49454F" },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "温度(°C)",
        type: "line",
        smooth: true,
        data: sorted.map((d) => d.temperature),
        lineStyle: { width: 3 },
        itemStyle: { color: "#8B5000" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(139, 80, 0, 0.2)" },
            { offset: 1, color: "rgba(139, 80, 0, 0.02)" },
          ]),
        },
      },
      {
        name: "湿度(%)",
        type: "line",
        smooth: true,
        data: sorted.map((d) => d.humidity),
        lineStyle: { width: 3 },
        itemStyle: { color: "#6750A4" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(103, 80, 164, 0.2)" },
            { offset: 1, color: "rgba(103, 80, 164, 0.02)" },
          ]),
        },
      },
      {
        name: "降雨量(mm)",
        type: "bar",
        yAxisIndex: 1,
        data: sorted.map((d) => d.rainfall),
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#49454F" },
            { offset: 1, color: "#79747E" },
          ]),
        },
      },
      {
        name: "风速(m/s)",
        type: "line",
        smooth: true,
        yAxisIndex: 1,
        data: sorted.map((d) => d.windSpeed),
        lineStyle: { width: 3 },
        itemStyle: { color: "#386A20" },
      },
    ],
  });
};

const handleAdd = () => {
  isEdit.value = false;
  formData.value = { date: "", temperature: 0, humidity: 0, rainfall: 0, windSpeed: 0, location: "A区" };
  dialogVisible.value = true;
};

const handleEdit = (row: WeatherItem) => {
  isEdit.value = true;
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = async (row: WeatherItem) => {
  await ElMessageBox.confirm("确定删除该气象记录吗？", "提示", { type: "warning" });
  const res = await deleteWeatherApi(row.id);
  if (res.code === 200) {
    ElMessage.success("删除成功");
    loadData();
  }
};

const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    if (isEdit.value && formData.value.id) {
      const res = await updateWeatherApi(formData.value.id, formData.value);
      if (res.code === 200) {
        ElMessage.success("更新成功");
        dialogVisible.value = false;
        loadData();
      }
    } else {
      const res = await addWeatherApi(formData.value);
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

const handleResize = () => chart?.resize();

onMounted(() => {
  loadData();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  chart?.dispose();
});
</script>

<template>
  <div class="m3-page">
    <el-card shadow="never" class="m3-card chart-card">
      <div ref="chartRef" class="chart-container"></div>
    </el-card>

    <el-card shadow="never" class="m3-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">气象数据</span>
          <el-button type="success" @click="handleAdd">新增记录</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="temperature" label="温度(°C)" width="100" />
        <el-table-column prop="humidity" label="湿度(%)" width="100" />
        <el-table-column prop="rainfall" label="降雨量(mm)" width="110" />
        <el-table-column prop="windSpeed" label="风速(m/s)" width="100" />
        <el-table-column prop="location" label="监测区域" min-width="100">
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

    <el-dialog :title="isEdit ? '编辑气象数据' : '新增气象数据'" v-model="dialogVisible" width="500px" destroy-on-close>
      <el-form :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="日期" prop="date">
          <el-date-picker v-model="formData.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="温度(°C)" prop="temperature">
          <el-input-number v-model="formData.temperature" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="湿度(%)" prop="humidity">
          <el-input-number v-model="formData.humidity" :min="0" :max="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="降雨量(mm)">
          <el-input-number v-model="formData.rainfall" :min="0" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="风速(m/s)">
          <el-input-number v-model="formData.windSpeed" :min="0" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="监测区域">
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
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-card {
  margin-bottom: 0;
}

.chart-container {
  height: 320px;
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
</style>
