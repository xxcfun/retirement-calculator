import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { migrateData, validateBackup } from '../src/utils/migration'
import { getShareUrl } from '../src/utils/qrcode'
import { wanToYuan, yuanToWan } from '../src/utils/format'
import { useAssetStore } from '../src/stores/asset'
import { useRecordsStore } from '../src/stores/records'
import { useAppStore } from '../src/stores/app'
import { atomicRestore } from '../src/utils/backup'
describe('迁移、备份与部署地址', () => {
  it('迁移旧版本并补全字段', () => { const r = migrateData({ version: 0, config: { currentAssets: 123 }, records: [], settings: {} }); expect(r.version).toBe(1); expect(r.config.currentAssets).toBe(123); expect(r.config.retirementTarget).toBeTypeOf('number') })
  it('拒绝未来版本和非法记录', () => { expect(() => validateBackup({ version: 99 })).toThrow(); expect(() => validateBackup({ version: 1, config: {}, records: [{ id: 'x' }], settings: {} })).toThrow() })
  it('子目录二维码地址只含网站地址和来源', () => { const url = new URL(getShareUrl('https://example.com', '/tools/retire/')); expect(url.pathname).toBe('/tools/retire/'); expect([...url.searchParams.keys()]).toEqual(['from']) })
  it('元和万元换算采用明确取整', () => { expect(wanToYuan(12.3456)).toBe(123456); expect(yuanToWan(123456)).toBe(12.3456) })
  it('非法备份不会覆盖当前 Store', async () => { setActivePinia(createPinia()); const asset = useAssetStore(); const records = useRecordsStore(); const app = useAppStore(); const before = asset.config.currentAssets; await expect(atomicRestore({ version: 99 }, { asset, records, app })).rejects.toThrow(); expect(asset.config.currentAssets).toBe(before) })
})
