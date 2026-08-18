<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { createQrCode, getShareUrl } from '../../utils/qrcode'
import { formatDuration } from '../../utils/calculate'
import { formatMoney } from '../../utils/format'
import { getBadge, getRetirementShareCopy, QR_CTA_COPY_POOL } from '../../utils/retirementCopy'
const props = defineProps({ result: Object, target: Number, progress: Number, showAssets: Boolean, assets: Number, copy: String })
const qr = ref(''); const ownCopy = ref(getRetirementShareCopy(props.result)); const displayCopy = computed(() => props.copy || ownCopy.value); const stage = computed(() => props.result.finalDebt > 0 ? '负债偿还' : props.result.totalMonths === 0 ? '目标已达成' : '财富积累'); const cta = QR_CTA_COPY_POOL[Math.floor(Math.random() * QR_CTA_COPY_POOL.length)]
onMounted(async () => { try { qr.value = await createQrCode(getShareUrl()) } catch { qr.value = '' } }); watch(() => props.result, r => { ownCopy.value = getRetirementShareCopy(r) })
</script>
<template><article class="share-card"><header><span>退休攒钱计算器</span><b>{{ getBadge(result) }}</b></header><div class="share-hero"><p>我的退休自由报告</p><small>距离财务自由还有</small><h2>{{ result.reachable ? formatDuration(result.totalMonths) : '当前计划暂不可达' }}</h2><p v-if="result.retirementDate">预计 {{ result.retirementDate.replace('-', '年') }}月 达到目标</p></div><div class="share-progress"><div><span>退休进度</span><strong>{{ progress }}%</strong></div><i><em :style="{ width: `${progress}%` }"/></i></div><dl><div><dt>退休目标</dt><dd>{{ formatMoney(target) }}</dd></div><div><dt>当前阶段</dt><dd>{{ stage }}</dd></div><div v-if="showAssets"><dt>当前资产</dt><dd>{{ formatMoney(assets) }}</dd></div></dl><blockquote>“{{ displayCopy }}”</blockquote><footer><img v-if="qr" :src="qr" alt="网站二维码"><div><strong>{{ cta }}</strong><small>扫码打开退休攒钱计算器</small></div></footer></article></template>
