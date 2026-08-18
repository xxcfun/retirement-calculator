<script setup>
import { Calculator, Settings, PiggyBank } from '@lucide/vue'
import { useAppStore } from './stores/app'
import BaseModal from './components/common/BaseModal.vue'
import { dismissNavigationError, navigationFeedback } from './router/navigationFeedback'
const app = useAppStore()
const nav = [{ to: '/dashboard', label: '退休计划', icon: Calculator }, { to: '/settings', label: '设置', icon: Settings }]
function refreshPage() { window.location.reload() }
</script>
<template>
  <div class="app-shell">
    <div v-if="navigationFeedback.loading" class="route-progress" role="progressbar" aria-label="正在切换页面"><span/></div>
    <div v-if="navigationFeedback.error" class="route-recovery" role="alert"><span>{{ navigationFeedback.error }}</span><button class="ghost" @click="dismissNavigationError">关闭</button><button class="primary" @click="refreshPage">刷新页面</button></div>
    <aside class="sidebar">
      <div class="brand"><PiggyBank :size="27"/><div><strong>退休计算器</strong><small>简单规划，自在生活</small></div></div>
      <nav><RouterLink v-for="item in nav" :key="item.to" :to="item.to"><component :is="item.icon" :size="20"/>{{ item.label }}</RouterLink></nav>
      <p class="local-note">数据仅保存在当前浏览器</p>
    </aside>
    <a class="skip-link" href="#main-content">跳到主要内容</a><main id="main-content" class="main-content" tabindex="-1" :aria-busy="navigationFeedback.loading"><RouterView/></main>
    <nav class="mobile-nav"><RouterLink v-for="item in nav" :key="item.to" :to="item.to"><component :is="item.icon" :size="21"/><span>{{ item.label }}</span></RouterLink></nav>
    <BaseModal v-if="!app.settings.welcomed" title="开始规划退休" @close="app.acceptWelcome"><div class="welcome-content"><PiggyBank :size="42" aria-hidden="true"/><p>填写 6 个关键数字，就能看到预计退休时间。</p><p>数据只保存在当前浏览器，不会上传服务器。</p><button class="primary" @click="app.acceptWelcome">开始计算</button></div></BaseModal>
  </div>
</template>
