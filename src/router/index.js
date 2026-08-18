import { createRouter, createWebHistory } from 'vue-router'
import { beginNavigation, failNavigation, finishNavigation } from './navigationFeedback'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: '退休概览' } },
  { path: '/records', redirect: '/dashboard' },
  { path: '/analysis', redirect: '/dashboard' },
  { path: '/settings', component: () => import('../views/SettingsView.vue'), meta: { title: '参数设置' } },
]
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes, scrollBehavior: () => ({ top: 0 }) })
let activeNavigation
router.beforeEach(() => { activeNavigation = beginNavigation() })
router.afterEach((to, from, failure) => {
  if (failure) failNavigation('页面切换未完成，请重试。', activeNavigation)
  else finishNavigation(activeNavigation)
  document.title = `${to.meta.title} - 退休攒钱计算器`
  requestAnimationFrame(() => document.querySelector('main')?.focus())
})
router.onError(() => failNavigation('页面资源加载失败，请检查网络后重试。', activeNavigation))
export default router
