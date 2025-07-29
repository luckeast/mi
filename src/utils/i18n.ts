import { createI18n } from 'vue-i18n'
import { Locale } from 'vant'
import type { PickerColumn } from 'vant'

const FALLBACK_LOCALE = 'en'
const ar = {}
const de = {}
const en = {}
const es = {}
const fr = {}
const hi = {}
const it = {}
const ja = {}
const ko = {}
const pt = {}
const ru = {}
const th = {}
const tr = {}
const vi = {}
const zhTw = {}

const vantLocales = {
  en,
  ar,
  de,
  es,
  fr,
  hi,
  it,
  ja,
  ko,
  pt,
  ru,
  th,
  tr,
  vi,
  zhTw,
}

export const languageColumns: PickerColumn = [
  // { text: '繁體中文', value: 'zh-CN' },
  { text: 'English', value: 'en' },
  { text: 'العربية ', value: 'ar' },
  { text: 'Deutsch', value: 'de' },
  { text: 'Español', value: 'es' },
  { text: 'Français', value: 'fr' },
  { text: 'Hindi', value: 'hi' },
  { text: 'Italiano', value: 'it' },
  { text: '日本語', value: 'ja' },
  { text: '한국어', value: 'ko' },
  { text: 'Português', value: 'pt' },
  { text: 'Русский', value: 'ru' },
  { text: 'Thai', value: 'th' },
  { text: 'Türkçe', value: 'tr' },
  { text: 'Tiếng Việt', value: 'vi' },
  { text: '繁體中文', value: 'zhTw' },
]

export const i18n = setupI18n()
type I18n = typeof i18n

export const locale = computed({
  get() {
    return i18n.global.locale.value
  },
  set(language: string) {
    setLang(language, i18n)
  },
})

function setupI18n() {
  const locale = getI18nLocale()
  const i18n = createI18n({
    locale,
    legacy: false,
  })
  setLang(locale, i18n)
  return i18n
}

async function setLang(lang: string, i18n: I18n) {
  await loadLocaleMsg(lang, i18n)

  document.querySelector('html').setAttribute('lang', lang)
  localStorage.setItem('language', lang)
  i18n.global.locale.value = lang

  // 设置 vant 组件语言包
  Locale.use(lang, vantLocales[lang])
}

// 加载本地语言包
async function loadLocaleMsg(locale: string, i18n: I18n) {
  const messages = await import(`../locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, messages.default)
}

// 获取当前语言对应的语言包名称
function getI18nLocale() {
  const storedLocale = localStorage.getItem('language') || navigator.language

  const langs = languageColumns.map(v => v.value as string)

  // 存在当前语言的语言包 或 存在当前语言的任意地区的语言包
  const foundLocale = langs.find(v => v === storedLocale || v.indexOf(storedLocale) === 0)

  // 若未找到，则使用 默认语言包
  const locale = foundLocale || FALLBACK_LOCALE

  return locale
}
