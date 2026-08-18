<script setup>
import { computed, defineAsyncComponent, reactive, ref } from 'vue'
import { ArrowRight, Eye, EyeOff, RotateCcw, Share2 } from '@lucide/vue'
import { useAssetStore } from '../stores/asset'
import { useAppStore } from '../stores/app'
import { calculateMonthlyCashFlow, formatDuration } from '../utils/calculate'
import { formatMoney } from '../utils/format'
import MetricCard from '../components/common/MetricCard.vue'
import BidirectionalProgress from '../components/dashboard/BidirectionalProgress.vue'

const ShareCardModal = defineAsyncComponent(() => import('../components/share/ShareCardModal.vue'))
const asset = useAssetStore(); const app = useAppStore(); const errors = reactive({}); const shareOpen = ref(false); const notice = ref('')
const result = computed(() => asset.dynamicResult); const privacy = computed(() => app.settings.privacyMode); const money = value => formatMoney(value, privacy.value)
const fields = [
  ['retirementTarget', '退休目标', '希望攒到的净资产', '元'], ['currentAssets', '当前资产', '现金、存款和投资总额', '元'],
  ['totalDebt', '当前负债', '房贷、消费贷等剩余金额', '元'], ['monthlySalary', '每月收入', '税后月工资', '元/月'],
  ['monthlyExpense', '每月支出', '日常固定消费', '元/月'], ['monthlyDebtPayment', '每月还款', '计划用于还债的金额', '元/月'],
]
function update(key, event) {
  const value = Number(event.target.value)
  if (!Number.isFinite(value) || value < 0) { errors[key] = '请输入不小于 0 的金额'; return }
  const ok = asset.updateConfig({ [key]: Math.round(value) })
  errors[key] = ok ? '' : asset.fieldErrors[key] || '请输入有效金额'
  if (ok) notice.value = '已自动保存并重新计算'
}
function startBlank() { asset.useBlankPlan(); notice.value = '已切换为空白计划，请填写你的数据' }
</script>

<template><div class="page plan-page">
  <header class="page-header"><div><p class="eyebrow">RETIREMENT PLAN</p><h1>我的退休计划</h1><p>填写关键数字，结果会自动更新。</p></div><button class="icon-button" :aria-label="privacy ? '显示金额' : '隐藏金额'" @click="app.setPrivacy(!privacy)"><EyeOff v-if="privacy"/><Eye v-else/></button></header>
  <div v-if="asset.config.isDemo" class="demo-banner"><div><strong>这是示例计划</strong><p>你可以直接修改下方数字，或从空白计划开始。</p></div><div><button class="ghost" @click="startBlank"><RotateCcw :size="18"/>从空白开始</button><button class="primary" @click="asset.keepDemo">使用示例看看</button></div></div>
  <p v-if="notice" class="save-status" role="status">{{ notice }}</p>
  <section class="planner-layout">
    <article class="card plan-form-card"><div class="section-title"><div><h2>你的关键数据</h2><p>只需填写 6 项，高级参数可稍后调整</p></div></div>
      <div class="plan-fields"><label v-for="field in fields" :key="field[0]"><span>{{ field[1] }}</span><small>{{ field[2] }}</small><div class="input-unit"><input :value="asset.config[field[0]]" type="number" min="0" step="1" inputmode="decimal" :aria-invalid="Boolean(errors[field[0]])" :aria-describedby="errors[field[0]] ? `${field[0]}-error` : undefined" @input="update(field[0], $event)"><em>{{ field[3] }}</em></div><small v-if="errors[field[0]]" :id="`${field[0]}-error`" class="field-error">{{ errors[field[0]] }}</small></label></div>
      <RouterLink class="advanced-link" to="/settings">调整奖金、投资收益率等高级参数 <ArrowRight :size="17"/></RouterLink>
    </article>
    <aside class="result-panel" aria-live="polite"><span>按当前计划，你距离退休还有</span><h2>{{ result.reachable ? formatDuration(result.totalMonths) : '暂时无法达到' }}</h2><p>{{ result.reachable ? `预计在 ${result.retirementDate.replace('-', ' 年 ')} 月达到目标` : '请增加收入、减少支出或降低目标后再试' }}</p><div class="result-divider"/><div class="result-row"><span>当前净资产</span><strong>{{ money(asset.currentNetAsset) }}</strong></div><div class="result-row"><span>每月结余</span><strong>{{ money(calculateMonthlyCashFlow(asset.config)) }}</strong></div><button class="secondary share-button" @click="shareOpen = true"><Share2 :size="18"/>分享计算结果</button></aside>
  </section>
  <section class="metric-grid compact-metrics"><MetricCard label="当前资产" :value="money(asset.config.currentAssets)"/><MetricCard label="当前负债" :value="money(asset.config.totalDebt)" tone="danger"/><MetricCard label="退休目标" :value="money(asset.config.retirementTarget)"/><MetricCard label="完成进度" :value="`${asset.progress}%`"/></section>
  <BidirectionalProgress :value="asset.currentNetAsset" :target="asset.config.retirementTarget" :privacy="privacy"/>
  <ShareCardModal v-if="shareOpen" :result="result" :target="asset.config.retirementTarget" :assets="asset.config.currentAssets" :progress="asset.progress" @close="shareOpen = false"/>
</div></template>
