<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])
const props = defineProps({ data: { type: Array, default: () => [] }, compact: Boolean })
const option = computed(() => ({ animation: !matchMedia('(prefers-reduced-motion: reduce)').matches, tooltip: { trigger: 'axis', triggerOn: 'mousemove|click', valueFormatter: v => `¥${Math.round(v).toLocaleString()}` }, legend: { show: !props.compact }, grid: { left: 16, right: 16, top: props.compact ? 18 : 45, bottom: 20, containLabel: true }, xAxis: { type: 'category', axisLabel: { hideOverlap: true }, data: props.data.map(x => x.year ? `${x.year}年` : `${x.month}月`) }, yAxis: { type: 'value', name: '金额（万元）', splitLine: { lineStyle: { color: '#e7ece8' } }, axisLabel: { formatter: v => `${Math.round(v / 10000)}万` } }, series: [{ name: '净资产', type: 'line', smooth: true, showSymbol: false, data: props.data.map(x => x.netAsset), lineStyle: { color: '#3f7c5a', width: 3 }, areaStyle: { color: 'rgba(63,124,90,.1)' } }, { name: '退休目标', type: 'line', smooth: true, showSymbol: false, data: props.data.map(x => x.target), lineStyle: { color: '#a66a32', type: 'dashed' } }] }))
const summary = computed(() => props.data.length ? `净资产从${Math.round(props.data[0].netAsset).toLocaleString()}元变化到${Math.round(props.data.at(-1).netAsset).toLocaleString()}元，期末退休目标为${Math.round(props.data.at(-1).target).toLocaleString()}元。` : '暂无趋势数据')
</script>
<template><div><p class="visually-hidden">{{ summary }}</p><VChart class="chart" :option="option" autoresize aria-label="未来资产趋势图"/></div></template>
