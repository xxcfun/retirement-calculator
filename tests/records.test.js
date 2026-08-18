import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAssetStore } from '../src/stores/asset'
import { useRecordsStore } from '../src/stores/records'
describe('台账与资产一致性', () => {
  let asset; let records
  beforeEach(async () => { setActivePinia(createPinia()); asset = useAssetStore(); records = useRecordsStore(); await records.replaceAll([]); asset.replaceConfig({ ...asset.config, currentAssets: 10000, isDemo: false }) })
  const income = { type: 'income', category: '副业', amount: 1000, date: '2026-08-17', remark: '' }
  it('新增只更新资产一次，重载不重复累计', async () => { await records.add(income); expect(asset.config.currentAssets).toBe(11000); await records.load(); expect(asset.config.currentAssets).toBe(11000) })
  it('编辑先撤销旧影响再应用新影响', async () => { const r = await records.add(income); await records.update(r.id, { ...income, type: 'expense', amount: 300 }); expect(asset.config.currentAssets).toBe(9700) })
  it('删除只回滚该条记录影响', async () => { const a = await records.add(income); await records.add({ ...income, amount: 500 }); await records.remove(a.id); expect(asset.config.currentAssets).toBe(10500); expect(records.records).toHaveLength(1) })
  it('资产调整支持明确减少方向', async () => { await records.add({ type: 'adjustment', direction: 'decrease', category: '资产减少', amount: 400, date: '2026-08-17' }); expect(asset.config.currentAssets).toBe(9600) })
})
