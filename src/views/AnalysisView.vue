<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useAssetStore } from '../stores/asset'
import { useRecordsStore } from '../stores/records'
import { calculateTenYearForecast, formatDuration } from '../utils/calculate'
import { formatMoney } from '../utils/format'
import TrendChart from '../components/charts/TrendChart.vue'
use([PieChart, BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])
const asset = useAssetStore(); const records = useRecordsStore(); const forecast = computed(() => calculateTenYearForecast(asset.config))
const expenses = computed(() => { const totals = {}; records.records.filter(r => r.type === 'expense').forEach(r => totals[r.category] = (totals[r.category] || 0) + r.amount); return Object.entries(totals).map(([name, value]) => ({ name, value })) })
const expenseOption = computed(() => expenses.value.length <= 5 ? ({ tooltip: { trigger: 'item', triggerOn: 'mousemove|click', formatter: '{b}: ¥{c} ({d}%)' }, legend: { bottom: 0 }, color: ['#3f7c5a','#70977e','#a66a32','#9a7476','#667785'], series: [{ type: 'pie', radius: ['44%', '68%'], data: expenses.value, label: { formatter: '{b}\n{d}%' } }] }) : ({ tooltip: { trigger: 'axis', triggerOn: 'mousemove|click' }, grid: { containLabel: true, left: 8, right: 20 }, xAxis: { type: 'value', name: '元' }, yAxis: { type: 'category', data: expenses.value.map(x => x.name) }, series: [{ type: 'bar', data: expenses.value.map(x => x.value), itemStyle: { color: '#3f7c5a', borderRadius: [0,6,6,0] } }] }))
const compareOption = computed(() => ({ grid: { left: 10, right: 60, bottom: 15, top: 15, containLabel: true }, xAxis: { type: 'value', name: '月' }, yAxis: { type: 'category', data: ['动态复利', '静态无复利'] }, series: [{ type: 'bar', data: [asset.dynamicResult.reachable ? asset.dynamicResult.totalMonths : 0, asset.staticResult.reachable ? asset.staticResult.totalMonths : 0], itemStyle: { color: '#3f7c5a', borderRadius: [0,6,6,0] }, label: { show: true, position: 'right', formatter: p => formatDuration(p.value) } }] }))
</script>
<template><div class="page"><header class="page-header"><div><p class="eyebrow">FINANCIAL ANALYSIS</p><h1>数据分析</h1><p>未来趋势全部来自统一的动态逐月计算结果。</p></div></header>
  <section class="card"><h2>未来十年资产趋势</h2><TrendChart v-if="forecast.length" :data="forecast"/><p v-else class="empty">当前参数没有可展示的预测</p></section>
  <section class="two-col"><article class="card"><h2>历史支出分类</h2><VChart v-if="expenses.length" class="chart small" :option="expenseOption" autoresize aria-label="历史支出分类图"/><p v-else class="empty">还没有支出台账，新增支出后显示分类占比。</p></article><article class="card"><h2>退休时间对比</h2><VChart class="chart small" :option="compareOption" autoresize aria-label="静态与动态退休时间横向条形对比图"/></article></section>
  <section class="card"><h2>未来十年逐年预测</h2><div class="forecast-table"><div class="forecast-head"><b>年份</b><b>资产</b><b>负债</b><b>净资产</b><b>退休目标</b></div><div v-for="row in forecast" :key="row.year"><span>第 {{ row.year }} 年</span><span>{{ formatMoney(row.assets) }}</span><span>{{ formatMoney(row.debt) }}</span><span>{{ formatMoney(row.netAsset) }}</span><span>{{ formatMoney(row.target) }}</span></div></div></section>
</div></template>
