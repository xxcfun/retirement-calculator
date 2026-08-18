import { STORAGE_KEYS, DATA_VERSION } from '../constants/storageKeys'

function read(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : structuredClone(fallback) } catch { return structuredClone(fallback) } }
function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return { success: true } } catch (error) { return { success: false, error: `本地保存失败：${error.message}` } } }
export const storage = {
  getConfig: fallback => read(STORAGE_KEYS.CONFIG, fallback), setConfig: value => write(STORAGE_KEYS.CONFIG, value),
  getSettings: fallback => read(STORAGE_KEYS.SETTINGS, fallback), setSettings: value => write(STORAGE_KEYS.SETTINGS, value),
  getFallbackRecords: () => read(STORAGE_KEYS.RECORDS, []), setFallbackRecords: value => write(STORAGE_KEYS.RECORDS, value),
  getFirstVisit: () => read(STORAGE_KEYS.FIRST_VISIT, true), setFirstVisit: value => write(STORAGE_KEYS.FIRST_VISIT, value),
  setVersion: () => write(STORAGE_KEYS.APP_VERSION, DATA_VERSION),
  clearAll() { Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key)) },
}
