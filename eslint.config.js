import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  { languageOptions: { globals: { window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly', indexedDB: 'readonly', crypto: 'readonly', Blob: 'readonly', File: 'readonly', URL: 'readonly', fetch: 'readonly', structuredClone: 'readonly', process: 'readonly', confirm: 'readonly', alert: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly' } }, rules: { 'vue/multi-word-component-names': 'off', 'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] } },
]
