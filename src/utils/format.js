export function yuanToWan(value) { return Number((Number(value || 0) / 10000).toFixed(4)) }
export function wanToYuan(value) { return Math.round(Number(value) * 10000) }
export function formatMoney(value, privacy = false) {
  if (privacy) return '¥••••••'
  return `¥${Math.round(Number(value) || 0).toLocaleString('zh-CN')}`
}
export function localDateString(date = new Date()) {
  const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
