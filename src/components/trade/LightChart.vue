<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import {
  createChart,
  // seri yang dipakai sebagai "definition"
  AreaSeries,
  LineSeries,
  CandlestickSeries,
  // tipe
  type IChartApi,
  ColorType,
  type DeepPartial,
  type TimeChartOptions,
  type CandlestickData,
  type LineData,
  type AreaData,
} from 'lightweight-charts'

type SeriesKind = 'candlestick' | 'line' | 'area'

interface Props {
  seriesType?: SeriesKind
  candleData?: CandlestickData[]
  data?: LineData[] | AreaData[]
  options?: DeepPartial<TimeChartOptions>
  seriesOptions?: Record<string, unknown>
  fit?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  seriesType: 'candlestick',
  candleData: () => [],
  data: () => [],
  options: () => ({}),
  seriesOptions: () => ({}),
  fit: true,
})

const root = ref<HTMLDivElement | null>(null)
let chart: IChartApi | null = null
type AnySeries = ReturnType<IChartApi['addSeries']>
let series: AnySeries | null = null
let ro: ResizeObserver | null = null

const baseOptions = computed<DeepPartial<TimeChartOptions>>(() => ({
  layout: {
    textColor: '#9aa0a6',
    background: { type: ColorType.Solid, color: 'transparent' }, // ✅ enum, bukan 'solid'
  },
  grid: {
    vertLines: { color: 'rgba(42,46,57,0.5)', style: 1, visible: true },
    horzLines: { color: 'rgba(42,46,57,0.5)', style: 1, visible: true },
  },
  timeScale: { timeVisible: true, secondsVisible: false },
  rightPriceScale: { borderVisible: false },
  ...props.options,
}))

function createSeries(kind: SeriesKind) {
  if (!chart) throw new Error('Chart belum siap')
  switch (kind) {
    case 'line':
      return chart.addSeries(LineSeries, props.seriesOptions)
    case 'area':
      return chart.addSeries(AreaSeries, props.seriesOptions)
    default:
      return chart.addSeries(CandlestickSeries, props.seriesOptions)
  }
}

onMounted(() => {
  if (!root.value) return
  chart = createChart(root.value, {
    width: root.value.clientWidth,
    height: root.value.clientHeight,
    ...baseOptions.value,
  })

  series = createSeries(props.seriesType)

  // set data awal
  if (props.seriesType === 'candlestick' && props.candleData?.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(series as any).setData(props.candleData)
  } else if (props.data?.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(series as any).setData(props.data)
  }

  if (props.fit) chart.timeScale().fitContent()

  ro = new ResizeObserver(([entry]) => {
    const r = entry?.contentRect
    if (chart && r) chart.applyOptions({ width: Math.floor(r.width), height: Math.floor(r.height) })
  })
  ro.observe(root.value)
})

onUnmounted(() => {
  ro?.disconnect()
  ro = null
  if (chart && series) chart.removeSeries(series)
  chart?.remove()
  chart = null
  series = null
})

watch(baseOptions, (opt) => chart?.applyOptions(opt))

// ganti tipe series saat prop berubah
watch(
  () => props.seriesType,
  (t) => {
    if (!chart) return
    if (series) chart.removeSeries(series)
    series = createSeries(t)
    // isi ulang data sesuai tipe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (t === 'candlestick' && props.candleData?.length) (series as any).setData(props.candleData)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (t !== 'candlestick' && props.data?.length) (series as any).setData(props.data)
  },
)

// update data
watch(
  () => props.data,
  (d) => {
    if (!series || !d || props.seriesType === 'candlestick')
      return // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(series as any).setData(d)
  },
)
watch(
  () => props.candleData,
  (d) => {
    if (!series || !d || props.seriesType !== 'candlestick')
      return // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(series as any).setData(d)
  },
)
</script>

<template>
  <!-- Wajib ada tinggi -->
  <div ref="root" class="w-full min-w-0 h-64 md:h-96 rounded-2xl border border-white/10"></div>
</template>

<style scoped>
/* :global(#tv-attr-logo) {
  display: none !important;
} */
</style>
