<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
// ⛔ defineOptions hanya ada di Nuxt. Hapus saja di Vue 3 CLI/Vite.

const props = defineProps<{ series: number[]; categories: string[] }>()

const chartOptions = {
  chart: {
    type: 'area',
    sparkline: {
      enabled: true,
    },
    toolbar: { show: false },
  },
  stroke: {
    curve: 'smooth',
    width: 2,
    colors: ['#00b38a'],
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: props.categories,
    labels: { show: false },
    axisTicks: { show: false },
    axisBorder: { show: false },
  },
  yaxis: {
    show: false,
    min: Math.min(...props.series) - 10,
    max: Math.max(...props.series) + 10,
  },
  tooltip: { enabled: false },
  grid: { show: false },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 1,
      opacityTo: 0,
      stops: [0, 100],
      colorStops: [
        {
          offset: 0,
          color: '#00b38a',
          opacity: 1,
        },
        {
          offset: 100,
          color: '#00b38a',
          opacity: 0,
        },
      ],
    },
    colors: ['#00b38a'],
  },
}
</script>

<template>
  <VueApexCharts
    :options="chartOptions"
    :series="[{ name: 'Value', data: series }]"
    type="area"
    height="80"
    width="140"
  />
</template>
