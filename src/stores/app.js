import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_SETTINGS } from '../constants/defaults'
import { storage } from '../utils/storage'

export const useAppStore = defineStore('app', () => {
  const settings = ref(storage.getSettings(DEFAULT_SETTINGS))
  const error = ref('')
  let timer
  function updateSettings(patch) { settings.value = { ...settings.value, ...patch }; clearTimeout(timer); timer = setTimeout(() => { const result = storage.setSettings(settings.value); error.value = result.error || '' }, 250) }
  function setPrivacy(value) { updateSettings({ privacyMode: value }) }
  function acceptWelcome() { updateSettings({ welcomed: true }) }
  function reload() { settings.value = storage.getSettings(DEFAULT_SETTINGS) }
  return { settings, error, updateSettings, setPrivacy, acceptWelcome, reload }
})
