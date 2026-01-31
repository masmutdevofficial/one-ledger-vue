<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import {
  createChart,
  AreaSeries,
  LineSeries,
  CandlestickSeries,
  type IChartApi,
  ColorType,
  type DeepPartial,
  type TimeChartOptions,
  type CandlestickData,
  type LineData,
  type AreaData,
  CrosshairMode,
  type LogicalRange,
} from 'lightweight-charts'

type SeriesKind = 'candlestick' | 'line' | 'area'

interface Props {
  seriesType?: SeriesKind
  candleData?: CandlestickData[]
  data?: LineData[] | AreaData[]
  options?: DeepPartial<TimeChartOptions>
  seriesOptions?: Record<string, unknown>
  fit?: boolean
  /** jumlah bar awal yang ingin ditampilkan */
  initialBars?: number
  /** ruang kosong (dalam “bar”) di sisi kanan */
  rightOffset?: number
  /** auto ikuti bar terakhir jika user belum pan */
  autoFollow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  seriesType: 'candlestick',
  candleData: () => [],
  data: () => [],
  options: () => ({}),
  seriesOptions: () => ({}),
  fit: false,
  initialBars: 180, // lebih “zoom-out” default
  rightOffset: 10,
  autoFollow: true,
})

const root = ref<HTMLDivElement | null>(null)
let chart: IChartApi | null = null
type AnySeries = ReturnType<IChartApi['addSeries']>
let series: AnySeries | null = null
let ro: ResizeObserver | null = null

// simpan state zoom agar tidak “lompat”
let lastLogicalRange: LogicalRange | null = null
let viewWidthBars = props.initialBars // lebar jendela dalam “jumlah bar” (diupdate dinamis)
let followingLatest = props.autoFollow

function lastIndex(): number {
  // gunakan panjang data aktif sebagai perkiraan indeks terakhir
  if (props.seriesType === 'candlestick') return Math.max(0, (props.candleData?.length || 1) - 1)
  return Math.max(0, ((props.data as LineData[] | AreaData[])?.length || 1) - 1)
}

const baseOptions = computed<DeepPartial<TimeChartOptions>>(() => ({
  layout: {
    textColor: '#9aa0a6',
    background: { type: ColorType.Solid, color: 'transparent' },
  },
  grid: {
    vertLines: { color: 'rgba(42,46,57,0.35)', style: 1, visible: true },
    horzLines: { color: 'rgba(42,46,57,0.35)', style: 1, visible: true },
  },
  rightPriceScale: {
    borderVisible: false,
    scaleMargins: { top: 0.1, bottom: 0.15 }, // biar candle nggak nempel atas/bawah
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    rightBarStaysOnScroll: true,
    lockVisibleTimeRangeOnResize: true,
    fixLeftEdge: false,
    // barSpacing kecil = muat lebih banyak bar
    barSpacing: 5,
    rightOffset: props.rightOffset,
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
  handleScroll: {
    mouseWheel: true,
    pressedMouseMove: true,
    horzTouchDrag: true,
    vertTouchDrag: false,
  },
  handleScale: {
    mouseWheel: true,
    pinch: true,
    axisPressedMouseMove: {
      time: true,
      price: true,
    },
  },
  ...props.options,
}))

function createSeries(kind: SeriesKind) {
  if (!chart) throw new Error('Chart belum siap')
  // warna candlestick yang “umum”
  const candleDefaults = {
    upColor: '#16a34a',
    downColor: '#ef4444',
    wickUpColor: '#16a34a',
    wickDownColor: '#ef4444',
    borderVisible: false,
  }
  switch (kind) {
    case 'line':
      return chart.addSeries(LineSeries, props.seriesOptions)
    case 'area':
      return chart.addSeries(AreaSeries, {
        lineWidth: 2,
        ...props.seriesOptions,
      })
    default:
      return chart.addSeries(CandlestickSeries, { ...candleDefaults, ...props.seriesOptions })
  }
}

function applyInitialRange() {
  if (!chart) return
  const end = lastIndex()
  const width = Math.max(10, props.initialBars) // batas minimal
  const right = props.rightOffset ?? 0
  viewWidthBars = width

  // Untuk history yang pendek (mis: XAU baru ada beberapa bar),
  // jangan biarkan `from` menjadi negatif karena bisa membuat chart terlihat kosong.
  chart.timeScale().setVisibleLogicalRange({
    from: Math.max(0, end - width),
    to: end + right,
  })
  lastLogicalRange = chart.timeScale().getVisibleLogicalRange()
  followingLatest = true
}

function applyFollowIfNeeded() {
  if (!chart) return
  if (!followingLatest) return
  const end = lastIndex()
  // jendela dipertahankan (viewWidthBars), ditambah rightOffset
  chart.timeScale().setVisibleLogicalRange({
    from: Math.max(0, end - viewWidthBars),
    to: end + (props.rightOffset ?? 0),
  })
  lastLogicalRange = chart.timeScale().getVisibleLogicalRange()
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

  // zoom/offset awal
  if (props.fit) {
    chart.timeScale().fitContent()
    followingLatest = false
  } else {
    applyInitialRange()
  }

  // pantau perubahan range → deteksi user pan/zoom & simpan lebar jendela
  chart.timeScale().subscribeVisibleLogicalRangeChange((r) => {
    if (!r) return
    if (lastLogicalRange) {
      // kalau user menggeser menjauh dari bar terakhir > ~0.5 bar, nonaktifkan follow
      const end = lastIndex()
      const rightGap = end - (r.to ?? end)
      followingLatest = props.autoFollow ? rightGap < 0.5 : false
      viewWidthBars = Math.max(5, (r.to ?? 0) - (r.from ?? 0))
    }
    lastLogicalRange = r
  })

  // double-click untuk reset view (umum di charting apps)
  const dbl = () => {
    if (!chart) return
    applyInitialRange()
  }
  root.value.addEventListener('dblclick', dbl)

  ro = new ResizeObserver(([entry]) => {
    const r = entry?.contentRect
    if (chart && r) {
      chart.applyOptions({ width: Math.floor(r.width), height: Math.floor(r.height) })
      // pertahankan jendela saat resize
      applyFollowIfNeeded()
    }
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

// apply option changes live
watch(baseOptions, (opt) => chart?.applyOptions(opt))

// ganti tipe series saat prop berubah, jaga zoom/offset
watch(
  () => props.seriesType,
  (t) => {
    if (!chart) return
    const prevRange = chart.timeScale().getVisibleLogicalRange()
    if (series) chart.removeSeries(series)
    series = createSeries(t)

    // isi ulang data sesuai tipe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (t === 'candlestick' && props.candleData?.length) (series as any).setData(props.candleData)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (t !== 'candlestick' && props.data?.length) (series as any).setData(props.data)

    // kembalikan range sebelumnya
    if (prevRange) {
      chart.timeScale().setVisibleLogicalRange(prevRange)
      lastLogicalRange = prevRange
    } else {
      applyInitialRange()
    }
  },
)

// update data line/area
watch(
  () => props.data,
  (d) => {
    if (!series || !d || props.seriesType === 'candlestick')
      return // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(series as any).setData(d)
    applyFollowIfNeeded()
  },
)

// update data candle
watch(
  () => props.candleData,
  (d) => {
    if (!series || !d || props.seriesType !== 'candlestick')
      return // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(series as any).setData(d)
    applyFollowIfNeeded()
  },
)
</script>

<template>
  <!-- beri tinggi fix atau responsif via parent -->
  <div ref="root" class="w-full min-w-0 h-72 md:h-96 rounded-2xl border border-white/10"></div>
</template>
