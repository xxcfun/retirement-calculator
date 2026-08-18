import { reactive } from 'vue'

export const navigationFeedback = reactive({ loading: false, stalled: false, error: '' })

let navigationId = 0
let watchdog

export function beginNavigation(timeout = 8000) {
  const id = ++navigationId
  clearTimeout(watchdog)
  navigationFeedback.loading = true
  navigationFeedback.stalled = false
  navigationFeedback.error = ''
  watchdog = setTimeout(() => {
    if (id !== navigationId || !navigationFeedback.loading) return
    navigationFeedback.loading = false
    navigationFeedback.stalled = true
    navigationFeedback.error = '页面切换时间过长，请重试或刷新页面。'
  }, timeout)
  return id
}

export function finishNavigation(id = navigationId) {
  if (id !== navigationId) return
  clearTimeout(watchdog)
  navigationFeedback.loading = false
}

export function failNavigation(message = '页面加载失败，请重试或刷新页面。', id = navigationId) {
  if (id !== navigationId) return
  clearTimeout(watchdog)
  navigationFeedback.loading = false
  navigationFeedback.stalled = false
  navigationFeedback.error = message
}

export function dismissNavigationError() {
  navigationFeedback.stalled = false
  navigationFeedback.error = ''
}
