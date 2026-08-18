<script setup>
import { computed } from 'vue'; import { formatMoney } from '../../utils/format'
const props=defineProps({value:Number,target:Number,privacy:Boolean})
const positive=computed(()=>Math.max(0,Math.min(100,props.target?props.value/props.target*100:0)))
const negative=computed(()=>Math.max(0,Math.min(100,props.target?Math.abs(props.value)/props.target*100:0)))
const label=computed(()=>formatMoney(props.value,props.privacy))
</script>
<template><section class="card wealth-position" aria-labelledby="wealth-position-title"><div class="section-title"><div><h2 id="wealth-position-title">你的财富位置</h2><p>以 0 为界，左侧是净负债，右侧是退休财富进度</p></div><strong>{{label}}</strong></div><div class="wealth-axis" role="img" :aria-label="`当前净资产 ${label}，退休目标完成 ${positive.toFixed(1)}%`"><div class="axis-half debt"><i :style="{transform:`scaleX(${negative/100})`}"/></div><div class="axis-zero"><span>0</span></div><div class="axis-half asset"><i :style="{transform:`scaleX(${positive/100})`}"/></div><b class="axis-marker" :class="value<0?'is-debt':'is-asset'" :style="{left:`${value<0?50-negative/2:50+positive/2}%`}"/></div><div class="axis-labels"><span>净负债</span><span>退休目标 {{privacy?'¥••••••':formatMoney(target)}}</span></div></section></template>
