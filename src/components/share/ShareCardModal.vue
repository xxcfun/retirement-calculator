<script setup>
import { nextTick, ref } from 'vue'
import ShareRetirementCard from './ShareRetirementCard.vue'
import BaseModal from '../common/BaseModal.vue'
import { generateShareImage, downloadShareImage, shareImage } from '../../utils/shareCard'
import { getRetirementShareCopy } from '../../utils/retirementCopy'
const props = defineProps({ result: Object, target: Number, progress: Number, assets: Number }); const emit = defineEmits(['close'])
const card = ref(); const showAssets = ref(false); const copy = ref(getRetirementShareCopy(props.result)); const busy = ref(false); const error = ref('')
const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
async function image() { busy.value = true; await nextTick(); try { return await generateShareImage(card.value) } finally { busy.value = false } }
async function download() { error.value = ''; try { downloadShareImage(await image()) } catch { error.value = '图片生成失败，请稍后重试。' } }
async function share() { error.value = ''; try { await shareImage(await image()) } catch { error.value = '暂时无法调用系统分享，请尝试下载图片。' } }
</script>
<template><BaseModal title="我的退休自由报告" wide @close="emit('close')"><div class="share-preview"><div ref="card" class="share-export"><ShareRetirementCard :result="result" :target="target" :progress="progress" :assets="assets" :show-assets="showAssets" :copy="copy"/></div></div><label class="toggle-row"><input v-model="showAssets" type="checkbox">在卡片中显示当前资产（默认隐藏）</label><p v-if="error" class="notice warning" role="alert">{{ error }}</p><div class="form-actions"><button class="ghost" :disabled="busy" @click="copy = getRetirementShareCopy(result)">换一句</button><button class="secondary" :disabled="busy" @click="download">{{ busy ? '生成中…' : '下载图片' }}</button><button v-if="canShare" class="primary" :disabled="busy" @click="share">{{ busy ? '生成中…' : '分享' }}</button></div></BaseModal></template>
