// 持久化数据只包含 JSON 兼容字段；该方式也能安全移除 Vue 响应式 Proxy。
export function cloneData(value) { return JSON.parse(JSON.stringify(value)) }
