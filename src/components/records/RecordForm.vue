<script setup>
import { computed, reactive, watch } from 'vue'
import { RECORD_CATEGORIES } from '../../constants/defaults'
import { localDateString } from '../../utils/format'
const props = defineProps({ record: { type: Object, default: null } }); const emit = defineEmits(['save', 'cancel'])
const form = reactive({ type: 'expense', category: '餐饮', amount: '', direction: 'increase', remark: '', date: localDateString() }); const error = reactive({ amount: '' })
watch(() => props.record, r => { Object.assign(form, r ? { ...r } : { type: 'expense', category: '餐饮', amount: '', direction: 'increase', remark: '', date: localDateString() }) }, { immediate: true })
const categories = computed(() => RECORD_CATEGORIES[form.type] || [])
watch(() => form.type, () => { if (!categories.value.includes(form.category)) form.category = categories.value[0] })
function validateAmount() { const amount = Math.round(Number(form.amount)); error.amount = amount >= 1 ? '' : '请输入大于 0 的有效金额'; return amount }
function submit() { const amount = validateAmount(); if (error.amount) return; emit('save', { ...form, amount }) }
</script>
<template><form class="record-form" @submit.prevent="submit">
  <label>类型<select v-model="form.type"><option value="income">收入</option><option value="expense">支出</option><option value="adjustment">资产调整</option></select></label>
  <label v-if="form.type === 'adjustment'">方向<select v-model="form.direction"><option value="increase">增加资产</option><option value="decrease">减少资产</option></select></label>
  <label>金额（元）<input v-model="form.amount" required min="1" step="1" type="number" inputmode="decimal" :aria-invalid="!!error.amount" aria-describedby="record-amount-error" @blur="validateAmount"><small v-if="error.amount" id="record-amount-error" class="field-error" role="alert">{{ error.amount }}</small></label>
  <label>分类<select v-model="form.category"><option v-for="item in categories" :key="item">{{ item }}</option></select></label>
  <label>日期<input v-model="form.date" required type="date"></label>
  <label>备注<input v-model="form.remark" maxlength="100" placeholder="可选"></label>
  <div class="form-actions"><button type="button" class="ghost" @click="$emit('cancel')">取消</button><button class="primary">保存</button></div>
</form></template>
