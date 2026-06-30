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

const m3Colors = ["#6750A4", "#386A20", "#8B5000", "#BA1A1A", "#006A6A", "#7D5260"];

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
    color: m3Colors,
    title: {
      text: "作物产量与种植面积",
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
      top: "22%",
      left: "3%",
      right: "4%",
      bottom: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.map((d) => d.name),
      axisLabel: { color: "#49454F" },
      axisLine: { lineStyle: { color: "#CAC4D0" } },
    },
    yAxis: [
      {
        type: "value",
        name: "产量(kg)",
        position: "left",
        axisLabel: { color: "#49454F" },
        splitLine: { lineStyle: { color: "#ECE6F0" } },
      },
      {
        type: "value",
        name: "面积(亩)",
        position: "right",
        axisLabel: { color: "#49454F" },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "产量(kg)",
        type: "bar",
        data: data.map((d) => d.yield),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#6750A4" },
            { offset: 1, color: "#9A82DB" },
          ]),
        },
        barWidth: "30%",
      },
      {
        name: "种植面积(亩)",
        type: "bar",
        yAxisIndex: 1,
        data: data.map((d) => d.area),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#386A20" },
            { offset: 1, color: "#6AAE50" },
          ]),
        },
        barWidth: "30%",
      },
    ],
  });
};

const renderLineChart = (data: { date: string; temperature: number; humidity: number; rainfall: number }[]) => {
  if (!lineChartRef.value) return;
  lineChart = echarts.init(lineChartRef.value);
  lineChart.setOption({
    color: ["#8B5000", "#6750A4", "#49454F"],
    title: {
      text: "近7天气象趋势",
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
      top: "22%",
      left: "3%",
      right: "4%",
      bottom: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
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
        name: "降雨量(mm)",
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
        data: data.map((d) => d.temperature),
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
        data: data.map((d) => d.humidity),
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
        type: "line",
        smooth: true,
        yAxisIndex: 1,
        data: data.map((d) => d.rainfall),
        lineStyle: { width: 3 },
        itemStyle: { color: "#49454F" },
      },
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
  <div class="m3-dashboard">
    <el-row :gutter="24" class="stat-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never" class="m3-card stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: linear-gradient(135deg, #6750A4, #9A82DB)">
              <el-icon size="28" color="#fff"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCrops }}</div>
              <div class="stat-label">作物种类</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never" class="m3-card stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: linear-gradient(135deg, #386A20, #6AAE50)">
              <el-icon size="28" color="#fff"><Grid /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalArea }} <span class="unit">亩</span></div>
              <div class="stat-label">农田总面积</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never" class="m3-card stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: linear-gradient(135deg, #8B5000, #C77D28)">
              <el-icon size="28" color="#fff"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalYield }} <span class="unit">kg</span></div>
              <div class="stat-label">预计总产量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never" class="m3-card stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: linear-gradient(135deg, #006A6A, #4DB6B6)">
              <el-icon size="28" color="#fff"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeFields }} / {{ stats.totalFields }}</div>
              <div class="stat-label">使用中农田</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="m3-grid-charts">
      <el-card shadow="never" class="m3-card chart-card">
        <div ref="barChartRef" class="chart-container"></div>
      </el-card>
      <el-card shadow="never" class="m3-card chart-card">
        <div ref="lineChartRef" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.m3-dashboard {
  padding: 24px;
  background-color: var(--m3-surface);
  min-height: calc(100vh - 64px);
}

.stat-row {
  margin-bottom: 24px;
}

.stat-card {
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--m3-on-surface);
  line-height: 1.2;
}

.stat-value .unit {
  font-size: 14px;
  font-weight: 400;
  color: var(--m3-on-surface-variant);
}

.stat-label {
  font-size: 14px;
  color: var(--m3-on-surface-variant);
  margin-top: 4px;
}

.m3-grid-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
}

.chart-card {
  margin-bottom: 0;
}

.chart-container {
  width: 100%;
  height: 360px;
}

@media (max-width: 768px) {
  .m3-dashboard {
    padding: 16px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .m3-grid-charts {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 280px;
  }
}
</style>
