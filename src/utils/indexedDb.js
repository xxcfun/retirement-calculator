const DB_NAME = 'retirement-calculator'; const STORE = 'records'; const DB_VERSION = 1
let dbPromise
export function openDb() {
  if (!globalThis.indexedDB) return Promise.reject(new Error('IndexedDB 不可用'))
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => { const request = indexedDB.open(DB_NAME, DB_VERSION); request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' }) }; request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
  return dbPromise
}
async function transaction(mode, run) { const db = await openDb(); return new Promise((resolve, reject) => { const tx = db.transaction(STORE, mode); const store = tx.objectStore(STORE); let result; try { result = run(store) } catch (e) { reject(e); return } tx.oncomplete = () => resolve(result); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('台账事务失败')) }) }
export const recordDb = {
  async getAll() { const db = await openDb(); return new Promise((resolve, reject) => { const req = db.transaction(STORE).objectStore(STORE).getAll(); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error) }) },
  put(record) { return transaction('readwrite', store => store.put(record)) },
  delete(id) { return transaction('readwrite', store => store.delete(id)) },
  async replaceAll(records) { return transaction('readwrite', store => { store.clear(); records.forEach(record => store.put(record)) }) },
  async clear() { return transaction('readwrite', store => store.clear()) },
}
