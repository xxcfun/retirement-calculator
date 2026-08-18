import { DATA_VERSION } from '../constants/storageKeys'
import { validateBackup } from './migration'
import { localDateString } from './format'
import { storage } from './storage'
import { cloneData } from './clone'

export function createBackup(config, records, settings) { return { version: DATA_VERSION, exportedAt: new Date().toISOString(), config: cloneData(config), records: cloneData(records), settings: cloneData(settings) } }
export function downloadBlob(content, name, type) { const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url) }
export function exportBackup(config, records, settings) { downloadBlob(JSON.stringify(createBackup(config, records, settings), null, 2), `退休计算器备份_${localDateString()}.json`, 'application/json;charset=utf-8') }
export async function parseBackupFile(file) { return validateBackup(JSON.parse(await file.text())) }
export function csvEscape(value) { const text = String(value ?? ''); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text }
export function recordsToCsv(records) { return '\ufeff' + [['日期', '类型', '分类', '金额（元）', '备注'], ...records.map(r => [r.date, r.type === 'income' ? '收入' : r.type === 'expense' ? '支出' : '资产调整', r.category, r.amount, r.remark])].map(row => row.map(csvEscape).join(',')).join('\n') }
export function forecastToCsv(timeline) { return '\ufeff' + [['月份', '资产', '负债', '净资产', '动态目标', '累计本金', '累计投资收益'], ...timeline.map(r => [r.month, r.assets, r.debt, r.netAsset, r.target, r.totalPrincipal, r.totalInvestmentIncome])].map(row => row.join(',')).join('\n') }
export async function atomicRestore(data, stores) {
  const valid = validateBackup(data); const old = createBackup(stores.asset.config, stores.records.records, stores.app.settings)
  try {
    await stores.records.replaceAll(valid.records)
    const configResult = storage.setConfig(valid.config); const settingsResult = storage.setSettings(valid.settings)
    if (!configResult.success || !settingsResult.success) throw new Error(configResult.error || settingsResult.error)
    stores.asset.replaceConfig(valid.config, false); stores.app.settings = cloneData(valid.settings); return valid
  } catch (error) {
    await stores.records.replaceAll(old.records).catch(() => {})
    storage.setConfig(old.config); storage.setSettings(old.settings); stores.asset.replaceConfig(old.config, false); stores.app.settings = old.settings
    throw new Error(`导入失败，原数据已保留：${error.message}`)
  }
}
