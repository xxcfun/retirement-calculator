<script setup>
import { reactive, ref } from 'vue'
import { Download, Upload, Trash2 } from '@lucide/vue'
import { useAssetStore } from '../stores/asset'
import { useAppStore } from '../stores/app'
import { useRecordsStore } from '../stores/records'
import { storage } from '../utils/storage'
import { recordDb } from '../utils/indexedDb'
import { exportBackup, parseBackupFile, atomicRestore } from '../utils/backup'
import { DEFAULT_CONFIG, DEFAULT_SETTINGS } from '../constants/defaults'
import { cloneData } from '../utils/clone'
const asset = useAssetStore(); const app = useAppStore(); const records = useRecordsStore(); const message = ref(''); const importInput = ref(); const errors = reactive({})
const groups = [
  { title: '额外收入与支出', fields: [['annualBonus', '年终奖', '元/年'], ['sideIncome', '月副业收入', '元/月'], ['annualExpense', '年度大额支出', '元/年']] },
  { title: '增长与市场假设', fields: [['annualReturnRate', '年化投资收益率', '%'], ['inflationRate', '年度通胀率', '%'], ['salaryGrowthRate', '年度工资增长率', '%']] },
]
const isRate = key => key.toLowerCase().includes('rate')
function shown(key) { return isRate(key) ? Number((asset.config[key] * 100).toFixed(4)) : asset.config[key] }
function update(key, raw) { const text = raw.target.value; if (text === '') { errors[key] = '此项不能为空'; return } const value = Number(text); const normalized = isRate(key) ? value / 100 : Math.round(value); if (!Number.isFinite(normalized) || (!isRate(key) && normalized < 0)) { errors[key] = '请输入有效数值'; return } const ok = asset.updateConfig({ [key]: normalized }); errors[key] = ok ? '' : asset.fieldErrors[key] || '数值超出允许范围'; if (ok) message.value = '参数已自动保存。' }
async function importFile(event) { const file = event.target.files?.[0]; if (!file) return; if (!confirm('导入会用备份替换当前退休计划。确定继续吗？')) return; try { const data = await parseBackupFile(file); await atomicRestore(data, { asset, app, records }); message.value = '备份恢复成功。' } catch (e) { message.value = e.message } finally { event.target.value = '' } }
async function clearAll() { if (!confirm('这会清除当前浏览器中的退休计划，且无法撤销。确定继续吗？')) return; try { storage.clearAll(); await recordDb.clear().catch(() => {}); asset.replaceConfig(cloneData(DEFAULT_CONFIG), false); app.settings = cloneData(DEFAULT_SETTINGS); await records.replaceAll([], false); storage.setConfig(asset.config); storage.setSettings(app.settings); message.value = '数据已清空并恢复为示例计划。' } catch (e) { message.value = e.message } }
</script>
<template><div class="page"><header class="page-header"><div><p class="eyebrow">ADVANCED SETTINGS</p><h1>高级设置</h1><p>日常使用无需修改；调整后会自动保存并重新计算。</p></div></header><p v-if="message" class="notice">{{ message }}</p>
  <section v-for="group in groups" :key="group.title" class="card settings-section"><h2>{{ group.title }}</h2><div class="settings-grid"><label v-for="field in group.fields" :key="field[0]"><span>{{ field[1] }}</span><div class="input-unit"><input :value="shown(field[0])" type="number" :min="isRate(field[0]) ? -20 : 0" :max="isRate(field[0]) ? 30 : undefined" :step="isRate(field[0]) ? 0.1 : 1" @input="update(field[0], $event)"><em>{{ field[2] }}</em></div><small v-if="errors[field[0]]" class="field-error">{{ errors[field[0]] }}</small></label></div><label v-if="group.title === '增长与市场假设'" class="toggle-row"><input :checked="asset.config.inflationEnabled" type="checkbox" @change="asset.updateConfig({ inflationEnabled: $event.target.checked })">考虑通胀（仅动态提高退休目标，不重复提高消费）</label></section>
  <section class="card"><h2>备份与恢复</h2><p>备份包含退休参数和偏好设置。恢复会先校验文件，不会用无效文件覆盖现有数据。</p><div class="button-grid"><button class="secondary" @click="exportBackup(asset.config, records.records, app.settings)"><Download :size="18"/>导出备份</button><button class="secondary" @click="importInput.click()"><Upload :size="18"/>恢复备份</button></div><input ref="importInput" class="visually-hidden" type="file" accept="application/json,.json" @change="importFile"></section>
  <section class="card privacy-info"><h2>本地数据与隐私</h2><p>应用没有账号或云同步，退休计划只保存在当前浏览器。分享二维码只包含网站地址。</p><p>清理浏览器数据或更换设备前，请先导出备份。</p></section>
  <section class="card danger-zone"><h2>重新开始</h2><p>清除当前退休计划并恢复为示例数据。</p><button class="danger-button" @click="clearAll"><Trash2 :size="18"/>清空计划</button></section>
</div></template>
