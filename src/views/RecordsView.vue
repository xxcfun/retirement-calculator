<script setup>
import { computed, ref } from 'vue'
import { Plus, Pencil, Trash2, ReceiptText } from '@lucide/vue'
import { useRecordsStore } from '../stores/records'
import { formatMoney } from '../utils/format'
import RecordForm from '../components/records/RecordForm.vue'
const store = useRecordsStore(); const formOpen = ref(false); const editing = ref(null); const type = ref('all'); const month = ref(''); const category = ref(''); const notice = ref('')
const categories = computed(() => [...new Set(store.records.map(r => r.category))].sort())
const filtered = computed(() => store.sortedRecords.filter(r => (type.value === 'all' || r.type === type.value) && (!month.value || r.date.startsWith(month.value)) && (!category.value || r.category === category.value)))
function open(record = null) { editing.value = record; formOpen.value = true }
async function save(data) { try { editing.value ? await store.update(editing.value.id, data) : await store.add(data); formOpen.value = false; notice.value = '台账与当前资产已同步保存。' } catch (e) { notice.value = e.message } }
async function remove(record) { if (!confirm(`确定删除“${record.category}”记录吗？资产余额将同步回滚。`)) return; try { await store.remove(record.id); notice.value = '记录已删除，资产影响已回滚。' } catch (e) { notice.value = e.message } }
const sign = r => r.type === 'expense' || (r.type === 'adjustment' && r.direction === 'decrease') ? '-' : '+'
</script>
<template><div class="page"><header class="page-header"><div><p class="eyebrow">LOCAL LEDGER</p><h1>收支台账</h1><p>记录真实发生的资金变化，资产余额只同步一次。</p></div><button class="primary" @click="open()"><Plus :size="18"/>新增记录</button></header>
  <p v-if="store.error" class="notice warning">{{ store.error }}</p><p v-if="notice" class="notice">{{ notice }}</p>
  <section class="card filters"><label>类型<select v-model="type"><option value="all">全部</option><option value="income">收入</option><option value="expense">支出</option><option value="adjustment">资产调整</option></select></label><label>月份<input v-model="month" type="month"></label><label>分类<select v-model="category"><option value="">全部分类</option><option v-for="item in categories" :key="item">{{ item }}</option></select></label><button class="ghost" @click="type = 'all'; month = ''; category = ''">清除筛选</button></section>
  <section class="card record-list"><div v-if="store.loading" class="empty">正在读取本地台账…</div><div v-else-if="!filtered.length" class="empty"><ReceiptText :size="38"/><strong>暂无符合条件的记录</strong><p>新增一笔收入、支出或资产调整开始记账。</p></div><article v-for="record in filtered" :key="record.id" class="record-row"><div class="record-icon">{{ record.category.slice(0, 1) }}</div><div class="record-main"><strong>{{ record.category }}</strong><span>{{ record.remark || '无备注' }} · {{ record.date }}</span></div><b :class="sign(record) === '+' ? 'income' : 'expense'">{{ sign(record) }}{{ formatMoney(record.amount) }}</b><div class="row-actions"><button class="icon-button" aria-label="编辑" @click="open(record)"><Pencil :size="17"/></button><button class="icon-button danger" aria-label="删除" @click="remove(record)"><Trash2 :size="17"/></button></div></article></section>
  <div v-if="formOpen" class="modal-backdrop" role="dialog" aria-modal="true"><section class="modal"><div class="modal-title"><h2>{{ editing ? '编辑记录' : '新增记录' }}</h2><button class="icon-button" @click="formOpen = false">×</button></div><RecordForm :record="editing" @save="save" @cancel="formOpen = false"/></section></div>
</div></template>
