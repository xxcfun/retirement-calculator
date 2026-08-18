import QRCode from 'qrcode'
export function getShareUrl(origin = window.location.origin, base = import.meta.env.BASE_URL) { const url = new URL(base, origin); url.searchParams.set('from', 'retirement-card'); return url.toString() }
export function createQrCode(url = getShareUrl()) { return QRCode.toDataURL(url, { width: 260, margin: 1, color: { dark: '#17211b', light: '#ffffff' } }) }
