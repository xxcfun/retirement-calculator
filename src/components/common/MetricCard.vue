<script setup>
defineProps({ label: String, value: [String, Number], hint: String, tone: { type: String, default: '' } })
</script>
<template><article class="metric-card" :class="tone"><span>{{ label }}</span><strong>{{ value }}</strong><small v-if="hint">{{ hint }}</small></article></template>
