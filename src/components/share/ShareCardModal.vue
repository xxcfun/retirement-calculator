<script setup>
import { onMounted, onUnmounted } from 'vue'
import ShareRetirementCard from './ShareRetirementCard.vue'

defineProps({ result: Object, target: Number, progress: Number, assets: Number })
const emit = defineEmits(['close'])
function close() { emit('close') }
function onKeydown(event) { if (event.key === 'Escape') close() }
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template><div class="modal-backdrop share-only-backdrop" role="dialog" aria-modal="true" aria-label="退休计算结果" @mousedown.self="close"><ShareRetirementCard :result="result" :target="target" :progress="progress" :assets="assets"/></div></template>
