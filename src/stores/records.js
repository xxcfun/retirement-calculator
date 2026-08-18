import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { recordDb } from '../utils/indexedDb'
import { storage } from '../utils/storage'
import { createId } from '../utils/uuid'
import { useAssetStore } from './asset'
import { cloneData } from '../utils/clone'

export function recordImpact(record) {
  if (record.type === 'income') return record.amount
  if (record.type === 'expense') return -record.amount
  return record.direction === 'decrease' ? -record.amount : record.amount
}

export const useRecordsStore = defineStore('records', () => {
  const records = ref([]); const loading = ref(false); const error = ref(''); const storageMode = ref('indexeddb')
  const sortedRecords = computed(() => [...records.value].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt))
  async function persistRecords(next) {
    try { await recordDb.replaceAll(next); storageMode.value = 'indexeddb'; return { success: true } }
    catch { const result = storage.setFallbackRecords(next); storageMode.value = 'localstorage'; return result }
  }
  async function load() { loading.value = true; error.value = ''; try { records.value = await recordDb.getAll(); storageMode.value = 'indexeddb' } catch { records.value = storage.getFallbackRecords(); storageMode.value = 'localstorage'; error.value = 'IndexedDB 不可用，台账已降级保存到 LocalStorage。' } finally { loading.value = false } }
  async function commit(nextRecords, nextAssets) {
    const asset = useAssetStore(); const previousRecords = cloneData(records.value)
    const recordResult = await persistRecords(nextRecords); if (!recordResult.success) throw new Error(recordResult.error || '台账保存失败')
    const assetResult = asset.persistNow({ ...asset.config, currentAssets: nextAssets })
    if (!assetResult.success) { await persistRecords(previousRecords); throw new Error(assetResult.error || '资产保存失败，台账已回滚') }
    records.value = nextRecords; asset.config.currentAssets = nextAssets; error.value = ''; return true
  }
  function normalize(input, old) { const now = Date.now(); return { id: old?.id || createId(), type: input.type, category: input.category || '其他', amount: Math.round(Number(input.amount)), direction: input.direction || 'increase', remark: String(input.remark || '').slice(0, 100), date: input.date, createdAt: old?.createdAt || now, updatedAt: now } }
  async function add(input) { const asset = useAssetStore(); const record = normalize(input); if (!Number.isFinite(record.amount) || record.amount <= 0) throw new Error('金额必须大于 0'); const nextAssets = asset.config.currentAssets + recordImpact(record); if (nextAssets < 0) throw new Error('支出不能使当前资产小于 0'); await commit([...records.value, record], nextAssets); return record }
  async function update(id, input) { const asset = useAssetStore(); const index = records.value.findIndex(r => r.id === id); if (index < 0) throw new Error('记录不存在'); const old = records.value[index]; const record = normalize(input, old); const nextAssets = asset.config.currentAssets - recordImpact(old) + recordImpact(record); if (nextAssets < 0) throw new Error('修改后当前资产不能小于 0'); const next = [...records.value]; next[index] = record; await commit(next, nextAssets); return record }
  async function remove(id) { const asset = useAssetStore(); const old = records.value.find(r => r.id === id); if (!old) return false; const nextAssets = asset.config.currentAssets - recordImpact(old); if (nextAssets < 0) throw new Error('回滚后当前资产不能小于 0'); await commit(records.value.filter(r => r.id !== id), nextAssets); return true }
  async function replaceAll(next, persist = true) { if (persist) { const result = await persistRecords(next); if (!result.success) throw new Error(result.error) } records.value = cloneData(next) }
  async function clear() { await replaceAll([]) }
  return { records, sortedRecords, loading, error, storageMode, load, add, update, remove, replaceAll, clear }
})
