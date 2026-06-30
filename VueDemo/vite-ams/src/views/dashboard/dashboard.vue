<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { getDashboardStatsApi } from "../../request/api";
import { TrendCharts, Grid, Box, OfficeBuilding } from "@element-plus/icons-vue";

const stats = ref({
  totalCrops: 0,
  totalArea: 0,
  totalYield: 0,
  totalSupplies: 0,
  activeFields: 0,
  totalFields: 0,
});

const barChartRef = ref<HTMLElement>();
const lineChartRef = ref<HTMLElement>();
let barChart: echarts.ECharts;
let lineChart: echarts.ECharts;

const loadData = async () => {
  const res = await getDashboardStatsApi();
  if (res.code === 200) {
    stats.value = res.data;
    renderBarChart(res.data.cropYieldData);
    renderLineChart(res.data.weatherTrend);
  }
};

const renderBarChart = (data: { name: string; yield: number; area: number }[]) => {
  if (!barChartRef.value) return;
  barChart = echarts.init(barChartRef.value);
  barChart.setOption({
    title: { text: "作物产量与种植面积", left: "center" },
    tooltip: { trigger: "axis" },
    legend: { top: 30 },
    xAxis: { type: "category", data: data.map((d) => d.name) },
    yAxis: [
      { type: "value", name: "产量(kg)", position: "left" },
      { type: "value", name: "面积(亩)", position: "right" },
    ],
    series: [
      { name: "产量(kg)", type: "bar", data: data.map((d) => d.yield), itemStyle: { color: "#409eff" } },
      { name: "种植面积(亩)", type: "bar", yAxisIndex: 1, data: data.map((d) => d.area), itemStyle: { color: "#67c23a" } },
    ],
  });
};

const renderLineChart = (data: { date: string; temperature: number; humidity: number; rainfall: number }[]) => {
  if (!lineChartRef.value) return;
  lineChart = echarts.init(lineChartRef.value);
  lineChart.setOption({
    title: { text: "近7天气象趋势", left: "center" },
    tooltip: { trigger: "axis" },
    legend: { top: 30 },
    xAxis: { type: "category", data: data.map((d) => d.date) },
    yAxis: [
      { type: "value", name: "温度(°C)/湿度(%)", position: "left" },
      { type: "value", name: "降雨量(mm)", position: "right" },
    ],
    series: [
      { name: "温度(°C)", type: "line", smooth: true, data: data.map((d) => d.temperature), itemStyle: { color: "#e6a23c" } },
      { name: "湿度(%)", type: "line", smooth: true, data: data.map((d) => d.humidity), itemStyle: { color: "#409eff" } },
      { name: "降雨量(mm)", type: "line", smooth: true, yAxisIndex: 1, data: data.map((d) => d.rainfall), itemStyle: { color: "#909399" } },
    ],
  });
};

const handleResize = () => {
  barChart?.resize();
  lineChart?.resize();
};

onMounted(() => {
  loadData();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  barChart?.dispose();
  lineChart?.dispose();
});
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #409eff">
              <el-icon size="28"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCrops }}</div>
              <div class="stat-label">作物种类</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon size="28"><Grid /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalArea }} <span class="unit">亩</span></div>
              <div class="stat-label">农田总面积</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon size="28"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalYield }} <span class="unit">kg</span></div>
              <div class="stat-label">预计总产量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon size="28"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeFields }} / {{ stats.totalFields }}</div>
              <div class="stat-label">使用中农田</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <div ref="barChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div ref="lineChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="css">
.dashboard {
  padding: 20px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-value .unit {
  font-size: 14px;
  font-weight: 400;
  color: #909399;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 360px;
}
</style>
