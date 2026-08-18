<script setup>
import { reactive, ref } from 'vue'
import { Download, Upload, FileSpreadsheet, Trash2 } from '@lucide/vue'
import { useAssetStore } from '../stores/asset'
import { useAppStore } from '../stores/app'
import { useRecordsStore } from '../stores/records'
import { storage } from '../utils/storage'
import { recordDb } from '../utils/indexedDb'
import { exportBackup, parseBackupFile, atomicRestore, recordsToCsv, forecastToCsv, downloadBlob } from '../utils/backup'
import { localDateString } from '../utils/format'
import { DEFAULT_CONFIG, DEFAULT_SETTINGS } from '../constants/defaults'
import { cloneData } from '../utils/clone'
const asset = useAssetStore(); const app = useAppStore(); const records = useRecordsStore(); const message = ref(''); const importInput = ref(); const errors = reactive({})
const groups = [
  { title: '退休目标与资产负债', fields: [['retirementTarget', '退休目标净资产', '元'], ['currentAssets', '当前总资产', '元'], ['totalDebt', '当前剩余负债', '元'], ['monthlyDebtPayment', '每月计划还款', '元/月']] },
  { title: '收入与消费', fields: [['monthlySalary', '月工资', '元/月'], ['annualBonus', '年终奖', '元/年'], ['sideIncome', '月副业收入', '元/月'], ['monthlyExpense', '月固定消费', '元/月'], ['annualExpense', '年度大额消费', '元/年']] },
  { title: '增长与市场假设', fields: [['annualReturnRate', '年化投资收益率', '%'], ['inflationRate', '年度通胀率', '%'], ['salaryGrowthRate', '年度工资增长率', '%']] },
]
const isRate = key => key.toLowerCase().includes('rate')
function shown(key) { return isRate(key) ? Number((asset.config[key] * 100).toFixed(4)) : asset.config[key] }
function update(key, raw) { const text = raw.target.value; if (text === '') { errors[key] = '此项不能为空'; return } const value = Number(text); const normalized = isRate(key) ? value / 100 : Math.round(value); if (!Number.isFinite(normalized) || (!isRate(key) && normalized < 0)) { errors[key] = '请输入有效数值'; return } const ok = asset.updateConfig({ [key]: normalized }); errors[key] = ok ? '' : asset.fieldErrors[key] || '数值超出允许范围'; if (ok) message.value = '参数已自动保存。' }
async function importFile(event) { const file = event.target.files?.[0]; if (!file) return; if (!confirm('导入会用备份完整替换当前参数和台账。继续前建议先导出当前备份。确定继续吗？')) return; try { const data = await parseBackupFile(file); await atomicRestore(data, { asset, app, records }); message.value = '备份恢复成功，页面状态与本地数据已同步。' } catch (e) { message.value = e.message } finally { event.target.value = '' } }
async function clearAll() { if (!confirm('第一次确认：这会清除当前浏览器中的全部退休参数和台账。是否继续？')) return; if (!confirm('第二次确认：清空后无法撤销，请确认已经导出备份。')) return; try { storage.clearAll(); await recordDb.clear().catch(() => {}); asset.replaceConfig(cloneData(DEFAULT_CONFIG), false); app.settings = cloneData(DEFAULT_SETTINGS); await records.replaceAll([], false); storage.setConfig(asset.config); storage.setSettings(app.settings); message.value = '本地数据已清空并恢复为演示初始状态。' } catch (e) { message.value = e.message } }
function exportRecordsCsv() { downloadBlob(recordsToCsv(records.sortedRecords), `退休计算器台账_${localDateString()}.csv`, 'text/csv;charset=utf-8') }
function exportForecastCsv() { downloadBlob(forecastToCsv(asset.dynamicResult.timeline), `退休预测_${localDateString()}.csv`, 'text/csv;charset=utf-8') }
</script>
<template><div class="page"><header class="page-header"><div><p class="eyebrow">PLAN SETTINGS</p><h1>参数设置</h1><p>修改后即时重算，并在校验通过后防抖保存到当前浏览器。</p></div></header><p v-if="message" class="notice">{{ message }}</p>
  <section v-for="group in groups" :key="group.title" class="card settings-section"><h2>{{ group.title }}</h2><div class="settings-grid"><label v-for="field in group.fields" :key="field[0]"><span>{{ field[1] }}</span><div class="input-unit"><input :value="shown(field[0])" type="number" :min="isRate(field[0]) ? -20 : 0" :max="isRate(field[0]) ? 30 : undefined" :step="isRate(field[0]) ? 0.1 : 1" @input="update(field[0], $event)"><em>{{ field[2] }}</em></div><small v-if="errors[field[0]]" class="field-error">{{ errors[field[0]] }}</small></label></div><label v-if="group.title === '增长与市场假设'" class="toggle-row"><input :checked="asset.config.inflationEnabled" type="checkbox" @change="asset.updateConfig({ inflationEnabled: $event.target.checked })">考虑通胀（仅动态提高退休目标，不重复提高消费）</label></section>
  <section class="card"><h2>数据备份与导出</h2><p>完整备份包含参数、设置和全部台账。恢复前会在内存中完成版本与字段校验，非法文件不会覆盖现有数据。</p><div class="button-grid"><button class="secondary" @click="exportBackup(asset.config, records.records, app.settings)"><Download :size="18"/>导出 JSON 备份</button><button class="secondary" @click="importInput.click()"><Upload :size="18"/>恢复 JSON 备份</button><button class="secondary" @click="exportRecordsCsv"><FileSpreadsheet :size="18"/>导出台账 CSV</button><button class="secondary" @click="exportForecastCsv"><FileSpreadsheet :size="18"/>导出退休预测 CSV</button></div><input ref="importInput" class="visually-hidden" type="file" accept="application/json,.json" @change="importFile"></section>
  <section class="card privacy-info"><h2>本地数据与隐私</h2><p>应用没有账号、服务器业务接口或云同步。参数与设置保存在 LocalStorage，台账优先保存在 IndexedDB；不可用时自动降级为 LocalStorage。分享二维码只包含网站地址。</p><p>浏览器清理站点数据、隐私模式退出或设备损坏可能导致数据丢失，请定期导出 JSON 备份。</p></section>
  <section class="card danger-zone"><h2>清空数据</h2><p>清除当前浏览器中的全部参数、设置和台账。此操作需要两次确认。</p><button class="danger-button" @click="clearAll"><Trash2 :size="18"/>清空全部本地数据</button></section>
</div></template>
