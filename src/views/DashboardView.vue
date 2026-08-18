<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import { Eye, EyeOff, Plus, Share2 } from '@lucide/vue'
import { useAssetStore } from '../stores/asset'
import { useAppStore } from '../stores/app'
import { useRecordsStore } from '../stores/records'
import { calculateMonthlyCashFlow, formatDuration } from '../utils/calculate'
import { formatMoney } from '../utils/format'
import MetricCard from '../components/common/MetricCard.vue'
import RecordForm from '../components/records/RecordForm.vue'
import TrendChart from '../components/charts/TrendChart.vue'
import BidirectionalProgress from '../components/dashboard/BidirectionalProgress.vue'
import BaseModal from '../components/common/BaseModal.vue'
const ShareCardModal = defineAsyncComponent(() => import('../components/share/ShareCardModal.vue'))
const asset = useAssetStore(); const app = useAppStore(); const records = useRecordsStore(); const quickType = ref(''); const shareOpen = ref(false); const notice = ref('')
const result = computed(() => asset.dynamicResult); const privacy = computed(() => app.settings.privacyMode); const money = value => formatMoney(value, privacy.value)
const chartData = computed(() => result.value.timeline.filter(x => x.month === 1 || x.month % 12 === 0 || x.month === result.value.timeline.length))
const stage = computed(() => asset.config.totalDebt > 0 ? '负债偿还阶段' : result.value.totalMonths === 0 ? '已达到退休目标' : '财富积累阶段')
const motivation = computed(() => asset.config.totalDebt > 0 ? '先上岸，再自由。' : asset.progress >= 100 ? '恭喜，你已经达到退休财富目标。' : asset.progress >= 80 ? '距离自由只剩最后一段路。' : asset.progress >= 50 ? '复利正在慢慢成为你的队友。' : asset.progress >= 20 ? '你已经走过最难的起步阶段。' : '自由之路，刚刚开始。')
async function saveQuick(data) { try { await records.add({ ...data, type: quickType.value }); quickType.value = ''; notice.value = '记录已保存，资产与退休结果已同步更新。' } catch (e) { notice.value = e.message } }
</script>
<template><div class="page">
  <header class="page-header"><div><p class="eyebrow">RETIREMENT OVERVIEW</p><h1>退休概览</h1><p>按照现在的生活方式，你距离财务自由还有多远？</p></div><button class="icon-button" :aria-label="privacy ? '显示金额' : '隐藏金额'" @click="app.setPrivacy(!privacy)"><EyeOff v-if="privacy"/><Eye v-else/></button></header>
  <div v-if="asset.config.isDemo" class="demo-banner"><div><strong>当前展示的是演示数据</strong><p>开始前请选择保留示例参数，或清空后录入自己的数据。</p></div><div><button class="ghost" @click="asset.useBlankPlan">使用空白计划</button><button class="primary" @click="asset.keepDemo">保留并开始</button></div></div>
  <p v-if="records.error" class="notice warning">{{ records.error }}</p><p v-if="notice" class="notice">{{ notice }}</p>
  <section class="hero-card"><div><span>距离财务自由还有</span><h2>{{ result.reachable ? formatDuration(result.totalMonths) : '当前计划暂不可达' }}</h2><p>{{ result.reachable ? `预计 ${result.retirementDate.replace('-', '年')}月达到退休目标` : '试试调整收入、消费、还款或投资参数' }}</p></div><div class="hero-actions"><span class="stage-pill">{{ stage }}</span><button class="secondary" @click="shareOpen = true"><Share2 :size="18"/>生成退休卡片</button></div></section>
  <section class="metric-grid"><MetricCard label="当前净资产" :value="money(asset.currentNetAsset)" hint="资产减去负债"/><MetricCard label="当前负债" :value="money(asset.config.totalDebt)" tone="danger"/><MetricCard label="退休目标" :value="money(asset.config.retirementTarget)"/><MetricCard label="月净结余" :value="money(calculateMonthlyCashFlow(asset.config))" hint="未含年度事件"/></section>
  <BidirectionalProgress :value="asset.currentNetAsset" :target="asset.config.retirementTarget" :privacy="privacy"/>
  <section class="two-col"><article class="card"><div class="section-title"><div><h2>退休时间拆解</h2><p>静态基准与动态复利使用同一资产负债口径</p></div></div><div class="duration-grid"><div><span>负债阶段</span><strong>{{ formatDuration(result.debtMonths) }}</strong></div><div><span>财富阶段</span><strong>{{ formatDuration(result.wealthMonths) }}</strong></div><div><span>静态测算</span><strong>{{ asset.staticResult.reachable ? formatDuration(asset.staticResult.totalMonths) : '不可达' }}</strong></div><div><span>动态测算</span><strong>{{ result.reachable ? formatDuration(result.totalMonths) : '不可达' }}</strong></div></div><p class="model-note">简化模型：第一版不计算债务利息；通胀仅提高退休目标，不重复提高消费。</p></article><article class="card"><h2>快速记账</h2><p>已发生的记录只更新当前资产一次，不会重复进入未来预测。</p><div class="quick-actions"><button class="primary" @click="quickType = 'income'"><Plus :size="18"/>记录收入</button><button class="secondary" @click="quickType = 'expense'"><Plus :size="18"/>记录支出</button></div></article></section>
  <section class="card"><div class="section-title"><div><h2>未来资产趋势</h2><p>净资产与动态退休目标的逐年变化</p></div></div><TrendChart v-if="chartData.length" :data="chartData"/><p v-else class="empty">暂无可展示的未来数据</p></section>
  <section class="card scenario-section"><div class="section-title"><div><h2>怎样可以更早退休？</h2><p>{{ motivation }}</p></div><span class="progress-badge">完成 {{ asset.progress }}%</span></div><div class="scenario-grid"><article v-for="item in asset.scenarios" :key="item.key"><strong>{{ item.label }}</strong><p v-if="item.result.reachable">预计 {{ formatDuration(item.result.totalMonths) }}退休</p><small v-if="item.monthsEarlier">可提前 {{ formatDuration(item.monthsEarlier) }}</small><small v-else>当前情景暂无提前</small></article></div></section>
  <BaseModal v-if="quickType" :title="quickType === 'income' ? '记录收入' : '记录支出'" @close="quickType = ''"><RecordForm :record="{ type: quickType }" @save="saveQuick" @cancel="quickType = ''"/></BaseModal>
  <ShareCardModal v-if="shareOpen" :result="result" :target="asset.config.retirementTarget" :assets="asset.config.currentAssets" :progress="asset.progress" @close="shareOpen = false"/>
</div></template>
