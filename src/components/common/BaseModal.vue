<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { X } from '@lucide/vue'
defineProps({ title: { type: String, required: true }, wide: Boolean })
const emit = defineEmits(['close']); const panel = ref(null); let previousFocus
function close(){ emit('close') }
function onKeydown(event){
  if(event.key==='Escape') return close(); if(event.key!=='Tab') return
  const items=[...panel.value.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')]
  if(!items.length)return; const first=items[0],last=items.at(-1)
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
}
onMounted(async()=>{previousFocus=document.activeElement;await nextTick();panel.value?.querySelector('button,input,select')?.focus();document.addEventListener('keydown',onKeydown)})
onUnmounted(()=>{document.removeEventListener('keydown',onKeydown);previousFocus?.focus?.()})
</script>
<template><div class="modal-backdrop" @mousedown.self="close"><section ref="panel" class="modal" :class="{'share-modal':wide}" role="dialog" aria-modal="true" :aria-labelledby="`modal-${title}`"><div class="modal-title"><h2 :id="`modal-${title}`">{{title}}</h2><button class="icon-button" type="button" aria-label="关闭弹窗" @click="close"><X :size="20" aria-hidden="true"/></button></div><slot/></section></div></template>
