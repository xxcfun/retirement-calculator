import { DATA_VERSION } from '../constants/storageKeys'
import { DEFAULT_CONFIG, DEFAULT_SETTINGS } from '../constants/defaults'

export function migrateData(data) {
  if (!data || typeof data !== 'object') throw new Error('备份文件格式不正确')
  const version = Number(data.version ?? 0)
  if (version > DATA_VERSION) throw new Error('备份来自更高版本，请升级应用后再导入')
  const migrated = { version: DATA_VERSION, config: { ...DEFAULT_CONFIG, ...(data.config || {}), version: DATA_VERSION }, settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}), version: DATA_VERSION }, records: Array.isArray(data.records) ? data.records : [] }
  return migrated
}

export function validateBackup(data) {
  const migrated = migrateData(data)
  const required = ['retirementTarget', 'currentAssets', 'totalDebt', 'monthlySalary', 'monthlyExpense']
  if (required.some(key => !Number.isFinite(migrated.config[key]) || migrated.config[key] < 0)) throw new Error('备份配置字段缺失或非法')
  for (const record of migrated.records) if (!record?.id || !['income', 'expense', 'adjustment'].includes(record.type) || !Number.isFinite(record.amount) || record.amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(record.date || '')) throw new Error('备份中存在非法台账记录')
  return migrated
}
