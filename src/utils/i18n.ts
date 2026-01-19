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
/**
 * 获取浏览器语言
 * 支持 navigator.language 和 navigator.languages
 */
function getBrowserLanguage(): string {
  // 优先使用 navigator.languages（用户偏好语言列表）
  if (navigator.languages && navigator.languages.length > 0) {
    return navigator.languages[0]
  }
  // 其次使用 navigator.language
  return navigator.language || FALLBACK_LOCALE
}

/**
 * 将浏览器语言代码映射到项目支持的语言
 * 例如: zh-TW -> zhTw, en-US -> en, pt-BR -> pt
 */
function mapBrowserLocaleToAppLocale(browserLocale: string, supportedLocales: string[]): string {
  console.warn('--- 开始语言映射 ---')
  console.warn('输入的浏览器语言:', browserLocale)

  // 精确匹配（不区分大小写）
  const exactMatch = supportedLocales.find(
    locale => locale.toLowerCase() === browserLocale.toLowerCase(),
  )
  if (exactMatch) {
    console.warn('✓ 精确匹配成功:', exactMatch)
    return exactMatch
  }
  console.warn('✗ 精确匹配失败')

  // 处理特殊的语言代码映射
  const localeMap: Record<string, string> = {
    'zh-tw': 'zhTw',
    'zh-hk': 'zhTw',
    'zh-cn': 'zhTw', // 如果有简体中文，可以改为对应的值
  }

  const mappedLocale = localeMap[browserLocale.toLowerCase()]
  if (mappedLocale && supportedLocales.includes(mappedLocale)) {
    console.warn('✓ 特殊映射成功:', browserLocale.toLowerCase(), '->', mappedLocale)
    return mappedLocale
  }
  console.warn('✗ 特殊映射失败')

  // 提取主语言代码（例如 en-US -> en）
  const primaryLang = browserLocale.split('-')[0].toLowerCase()
  console.warn('提取的主语言代码:', primaryLang)

  // 查找匹配的主语言
  const primaryMatch = supportedLocales.find(
    locale => locale.toLowerCase() === primaryLang,
  )
  if (primaryMatch) {
    console.warn('✓ 主语言匹配成功:', primaryMatch)
    return primaryMatch
  }
  console.warn('✗ 主语言匹配失败')

  // 查找以该主语言开头的语言包
  const prefixMatch = supportedLocales.find(
    locale => locale.toLowerCase().startsWith(primaryLang),
  )
  if (prefixMatch) {
    console.warn('✓ 前缀匹配成功:', prefixMatch)
    return prefixMatch
  }
  console.warn('✗ 前缀匹配失败')

  // 未找到匹配，返回默认语言
  console.warn('⚠ 未找到匹配，使用默认语言:', FALLBACK_LOCALE)
  return FALLBACK_LOCALE
}

/**
 * 获取当前语言对应的语言包名称
 * 优先级: localStorage > 浏览器语言 > 默认语言
 */
function getI18nLocale() {
  const langs = languageColumns.map(v => v.value as string)

  console.warn('========== 语言检测调试信息 ==========')
  console.warn('项目支持的语言:', langs)

  // 1. 检查 localStorage 中是否有保存的语言设置
  const storedLocale = localStorage.getItem('language')
  console.warn('localStorage 中保存的语言:', storedLocale)

  // if (storedLocale && langs.includes(storedLocale)) {
  //   console.warn('✅ 使用 localStorage 中的语言:', storedLocale)
  //   console.warn('=====================================')
  //   return storedLocale
  // }

  // 2. 获取浏览器语言
  const browserLocale = getBrowserLanguage()
  console.warn('浏览器检测到的语言:', browserLocale)
  console.warn('navigator.language:', navigator.language)
  console.warn('navigator.languages:', navigator.languages)

  // 3. 映射浏览器语言到项目支持的语言
  const mappedLocale = mapBrowserLocaleToAppLocale(browserLocale, langs)
  console.warn('映射后的语言:', mappedLocale)
  console.warn('✅ 最终使用的语言:', mappedLocale)
  console.warn('=====================================')

  return mappedLocale
}
