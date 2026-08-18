import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { DEFAULT_CONFIG, EMPTY_CONFIG } from '../constants/defaults'
import { storage } from '../utils/storage'
import { calculateDynamicRetirement, calculateNetAsset, calculateProgress, calculateScenarios, calculateStaticRetirement, validateConfig } from '../utils/calculate'
import { cloneData } from '../utils/clone'

export const useAssetStore = defineStore('asset', () => {
  const config = ref(storage.getConfig(DEFAULT_CONFIG)); const error = ref(''); const fieldErrors = ref({}); let timer
  const dynamicResult = computed(() => calculateDynamicRetirement(config.value))
  const staticResult = computed(() => calculateStaticRetirement(config.value))
  const currentNetAsset = computed(() => calculateNetAsset(config.value.currentAssets, config.value.totalDebt))
  const progress = computed(() => calculateProgress(currentNetAsset.value, config.value.retirementTarget))
  const scenarios = computed(() => calculateScenarios(config.value, dynamicResult.value))
  function persistNow(next = config.value) { const result = storage.setConfig(next); error.value = result.error || ''; return result }
  function updateConfig(patch) {
    const next = { ...config.value, ...patch, isDemo: false }; const checked = validateConfig(next); fieldErrors.value = checked.errors
    if (!checked.valid) return false
    config.value = next; clearTimeout(timer); timer = setTimeout(() => persistNow(), 300); return true
  }
  function replaceConfig(next, persist = true) { const checked = validateConfig(next); if (!checked.valid) { fieldErrors.value = checked.errors; return false } config.value = { ...next }; return !persist || persistNow().success }
  function useBlankPlan() { replaceConfig(cloneData(EMPTY_CONFIG)) }
  function keepDemo() { updateConfig({ isDemo: false }) }
  function reload() { config.value = storage.getConfig(DEFAULT_CONFIG) }
  return { config, error, fieldErrors, dynamicResult, staticResult, currentNetAsset, progress, scenarios, persistNow, updateConfig, replaceConfig, useBlankPlan, keepDemo, reload }
})
