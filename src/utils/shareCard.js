import { toPng } from 'html-to-image'
import { localDateString } from './format'
export function getShareFileName() { return `我的退休自由报告_${localDateString()}.png` }
export async function generateShareImage(node) { return toPng(node, { width: 1080, height: 1440, pixelRatio: 1, cacheBust: true }) }
export function downloadShareImage(dataUrl, name = getShareFileName()) { const a = document.createElement('a'); a.href = dataUrl; a.download = name; a.click() }
export async function shareImage(dataUrl) { const blob = await (await fetch(dataUrl)).blob(); const file = new File([blob], getShareFileName(), { type: 'image/png' }); if (navigator.share && navigator.canShare?.({ files: [file] })) return navigator.share({ files: [file], title: '我的退休自由报告' }); downloadShareImage(dataUrl); return false }
