<script setup lang="ts">
import type { PickerColumn } from 'vant'
import { languageColumns, locale } from '@/utils/i18n'
import logo from '~/images/logo.png'
import email from '~/images/email.png'
import jianto from '~/images/jianto.png'
import first from '~/images/first.png'
import second from '~/images/second.png'
import three from '~/images/three.png'
import fore from '~/images/fore.png'
import five from '~/images/five.png'
import up from '~/images/up.png'
import spbg from '~/images/sp_bg.webp'
import sp from '~/images/sp.png'
import zero from '~/images/0.png'
import one from '~/images/1.png'
import two from '~/images/2.png'
import thire from '~/images/3.png'
import { getAppConfig } from '@/api'
import { getSafeAreaBottom, isIOSDevice, setSafeAreaCSSVariables, watchSafeAreaChanges } from '@/utils/ios-safe-area'
import type { AppExtData, WebData } from '@/types/appconfig'
import { isAndroidDevice, printDeviceInfo } from '@/utils/device-detect'

const { t } = useI18n()

/**
 * 下载按钮配置项类型
 */
interface DownloadButton {
  /** 图片URL */
  imageUrl: string
  /** 下载名称 */
  downloadName: string
  /** 副标题 */
  subtitle: string
}

/**
 * 下载按钮配置数组
 * 索引对应关系：
 * 0 - App Store (downloadType: "0")
 * 1 - Google Play (downloadType: "1")
 * 2 - APK (Android专用)
 * 3 - TestFlight (downloadType: "3")
 */
const downloadButtons: DownloadButton[] = [
  {
    imageUrl: zero,
    downloadName: 'Google Play',
    subtitle: 'Download on the',
  },
  {
    imageUrl: one,
    downloadName: 'App Store',
    subtitle: 'Download on the',
  },
  {
    imageUrl: two,
    downloadName: 'Apk',
    subtitle: 'Download',
  },
  {
    imageUrl: thire,
    downloadName: 'TestFlight',
    subtitle: 'Download on the',
  },
]

// const checked = computed({
//   get: () => isDark.value,
//   set: () => toggleDark(),
// })

// const menuItems = computed(() => ([
//   { title: t('navbar.Mock'), route: 'mock' },
//   { title: t('navbar.Charts'), route: 'charts' },
//   { title: t('navbar.UnoCSS'), route: 'unocss' },
//   { title: t('navbar.Counter'), route: 'counter' },
//   { title: t('navbar.KeepAlive'), route: 'keepalive' },
//   { title: t('navbar.ScrollCache'), route: 'scroll-cache' },
//   { title: t('navbar.404'), route: 'unknown' },
// ]))

const showLanguagePicker = ref(false)
const languageValues = ref<Array<string>>([locale.value])
const showCustomLanguagePopup = ref(false)
const currentLanguage = computed(() => languageColumns.find(l => l.value === locale.value)?.text || 'English')
const appInstallUrl = ref('')

// Web数据对象
const webData = ref<WebData | null>(null)

// 动态获取App Logo（优先使用webData中的appImg）
const appLogo = computed(() => webData.value?.appImg || logo)

// 动态获取App名称（优先使用webData中的appName）
const appName = computed(() => webData.value?.appName || 'Earo')

/**
 * 根据系统类型和downloadType动态获取当前应该显示的下载按钮
 * Android系统: 固定显示APK按钮（index 2）
 * iOS系统: 根据downloadType决定显示哪个按钮
 */
const currentDownloadButton = computed<DownloadButton>(() => {
  // Android系统，固定使用APK按钮
  if (isAndroidDevice()) {
    console.warn('🤖 Android系统 - 使用APK按钮')
    return downloadButtons[2] // APK 按钮
  }

  // iOS系统，根据downloadType决定
  if (webData.value?.downloadType) {
    const type = webData.value.downloadType
    console.warn('🍎 iOS系统 - downloadType:', type)

    // downloadType 对应按钮索引的映射
    const typeMap: Record<string, number> = {
      0: 0, // App Store
      1: 1, // Google Play
      3: 3, // TestFlight
    }

    const buttonIndex = typeMap[type]
    if (buttonIndex !== undefined && downloadButtons[buttonIndex]) {
      console.warn(`✅ 使用按钮: ${downloadButtons[buttonIndex].downloadName}`)
      return downloadButtons[buttonIndex]
    }
  }

  // 默认返回 App Store 按钮
  console.warn('⚠️ 使用默认按钮: App Store')
  return downloadButtons[0]
})

/**
 * 获取当前下载链接
 * Android系统: 使用 apkdownloadLink
 * iOS系统: 使用 downloadLink
 */
const currentDownloadUrl = computed<string>(() => {
  const defaultUrl = 'https://apps.apple.com/us/app/earo/id6748441626'

  if (isAndroidDevice()) {
    // Android系统使用APK下载链接
    const url = webData.value?.apkdownloadLink || defaultUrl
    console.warn('🤖 Android下载链接:', url)
    return url
  }

  // iOS及其他系统使用通用下载链接
  const url = webData.value?.downloadLink || defaultUrl
  console.warn('🍎 iOS下载链接:', url)
  return url
})

// 添加视频加载状态管理
const isVideoLoaded = ref(true)
const isVideoError = ref(false)

// 添加 swipe 控制相关的响应式变量
const swipeRef = ref()
const isScrolling = ref(false)
const scrollTimeout = ref<number | null>(null)
const secondSwipeItemRef = ref()
const touchStartY = ref(0)
const touchStartScrollTop = ref(0)
const isTouchMoving = ref(false)

// 检测是否为iOS设备
const isIOS = computed(() => isIOSDevice())

// 获取安全区域底部高度
const safeAreaBottom = ref(0)

// 清理安全区域监听器
let cleanupSafeAreaWatcher: (() => void) | null = null

onMounted(async () => {
  // 打印设备信息
  printDeviceInfo()

  await getAppInstallUrl()

  // 初始化iOS安全区域适配
  if (isIOS.value) {
    // 设置CSS变量
    setSafeAreaCSSVariables()

    // 获取安全区域高度
    safeAreaBottom.value = getSafeAreaBottom()

    // 监听屏幕方向变化
    cleanupSafeAreaWatcher = watchSafeAreaChanges()
  }

  // 监听第二个 swipe-item 的滚动事件
  nextTick(() => {
    if (secondSwipeItemRef.value) {
      const element = secondSwipeItemRef.value.$el || secondSwipeItemRef.value
      if (element) {
        element.addEventListener('scroll', handleScroll, { passive: true })
        element.addEventListener('wheel', handleWheel, { passive: false })
        element.addEventListener('touchstart', handleTouchStart, { passive: false })
        element.addEventListener('touchmove', handleTouchMove, { passive: false })
        element.addEventListener('touchend', handleTouchEnd, { passive: true })
      }
    }
  })
})

onUnmounted(() => {
  // 清理事件监听器
  if (secondSwipeItemRef.value) {
    const element = secondSwipeItemRef.value.$el || secondSwipeItemRef.value
    element?.removeEventListener('scroll', handleScroll)
    element?.removeEventListener('wheel', handleWheel)
    element?.removeEventListener('touchstart', handleTouchStart)
    element?.removeEventListener('touchmove', handleTouchMove)
    element?.removeEventListener('touchend', handleTouchEnd)
  }

  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }

  // 清理安全区域监听器
  if (cleanupSafeAreaWatcher) {
    cleanupSafeAreaWatcher()
  }
})
function onLanguageConfirm(event: { selectedOptions: PickerColumn }) {
  locale.value = event.selectedOptions[0].value as string
  showLanguagePicker.value = false
}

function openCustomLanguagePopup() {
  showCustomLanguagePopup.value = true
}

function selectLanguage(lang: any) {
  locale.value = lang
  showCustomLanguagePopup.value = false
}
/**
 * 跳转到网页链接
 * 优先使用 webData 中的 webLink，否则使用默认链接
 */
function jumpToB() {
  const targetUrl = webData.value?.webLink || 'https://test-h5.snoperp.com/h5_web/forWeb/'
  window.open(targetUrl, '_blank')
}

/**
 * 下载App（备用函数，保留用于兼容性）
 * Android系统使用 apkdownloadLink，其他系统使用 downloadLink
 */
function _downloadApp() {
  let downloadUrl = 'https://apps.apple.com/us/app/earo/id6748441626' // 默认iOS链接

  if (webData.value) {
    // 检测是否为Android系统
    if (isAndroidDevice()) {
      // Android系统使用APK下载链接
      downloadUrl = webData.value.apkdownloadLink || webData.value.downloadLink || downloadUrl
      console.warn('🤖 Android系统 - 使用APK下载链接:', downloadUrl)
    }
    else {
      // iOS及其他系统使用通用下载链接
      downloadUrl = webData.value.downloadLink || downloadUrl
      console.warn('🍎 其他系统 - 使用通用下载链接:', downloadUrl)
    }
  }

  window.open(downloadUrl, '_blank')
}

/**
 * 处理下载按钮点击
 * 自动根据系统类型使用对应的下载链接
 */
function handleDownloadClick() {
  const url = currentDownloadUrl.value
  console.warn('========================================')
  console.warn('📥 开始下载')
  console.warn('系统类型:', isAndroidDevice() ? 'Android' : 'iOS')
  console.warn('按钮样式:', currentDownloadButton.value.downloadName)
  console.warn('下载链接:', url)
  console.warn('========================================')
  window.open(url, '_blank')
}
/**
 * 获取App配置信息
 * 包括安装URL和web_data数据
 */
async function getAppInstallUrl() {
  try {
    const response = await getAppConfig()

    // 查找 app_ext_data 配置项
    const extDataItem = Array.isArray(response.data.items)
      ? response.data.items.find(item => item.name === 'app_ext_data')
      : undefined

    if (extDataItem?.data) {
      const extData = extDataItem.data as AppExtData

      // 设置安装URL
      appInstallUrl.value = extData.app_install_url || ''

      // 提取 web_data 数据（取第一个）
      if (extData.web_data && extData.web_data.length > 0) {
        webData.value = extData.web_data[0]

        console.warn('========== App配置信息 ==========')
        console.warn('下载链接-iOS (downloadLink):', webData.value.downloadLink)
        console.warn('下载链接-Android (apkdownloadLink):', webData.value.apkdownloadLink)
        console.warn('App Logo (appImg):', webData.value.appImg)
        console.warn('App名称 (appName):', webData.value.appName)
        console.warn('网页链接 (webLink):', webData.value.webLink)
        console.warn('下载类型 (downloadType):', webData.value.downloadType)
        console.warn('==================================')
      }
    }
  }
  catch (error) {
    console.error('获取App配置失败:', error)
  }
}

// 视频加载事件处理
function handleVideoLoad() {
  isVideoLoaded.value = true
  isVideoError.value = false
}

function handleVideoError() {
  isVideoError.value = true
  isVideoLoaded.value = false
}

// 处理滚动事件，在滚动时禁用 swipe 切换
function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  // 只有在内容可以滚动时才设置滚动状态
  if (scrollHeight > clientHeight) {
    isScrolling.value = true

    // 清除之前的定时器
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }

    // iOS设备使用更短的延迟时间
    const delay = isIOS.value ? 200 : 300
    scrollTimeout.value = window.setTimeout(() => {
      isScrolling.value = false
    }, delay)
  }
}

// 处理鼠标滚轮事件
function handleWheel(event: WheelEvent) {
  const target = event.currentTarget as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  // 检查是否在顶部或底部
  const isAtTop = scrollTop === 0
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 // 添加1px的容差

  // 只有在内容可以滚动时才设置滚动状态
  if (scrollHeight > clientHeight) {
    isScrolling.value = true

    // 清除之前的定时器
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }

    // 设置新的定时器，滚动停止后恢复 swipe 功能
    scrollTimeout.value = window.setTimeout(() => {
      isScrolling.value = false
    }, 500)
  }

  // 只有在真正到达边界时才阻止事件传播
  // 在顶部向上滚动时，允许切换到上一页
  if (isAtTop && event.deltaY < 0) {
    // 允许切换到上一页，不阻止事件
    isScrolling.value = false // 确保可以切换
    return true
  }

  // 在底部向下滚动时，阻止事件传播（因为已经是最后一页）
  if (isAtBottom && event.deltaY > 0) {
    event.preventDefault()
    return false
  }
}

// 处理 swipe 切换事件
function handleSwipeChange(index: number) {
  // 当切换到第二页时，重置滚动状态
  if (index === 1) {
    isScrolling.value = false
  }
}

// 处理触摸开始事件
function handleTouchStart(event: TouchEvent) {
  const target = event.currentTarget as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  // 记录触摸开始位置
  const touch = event.touches[0]
  touchStartY.value = touch.clientY
  touchStartScrollTop.value = scrollTop
  isTouchMoving.value = false

  // 检查是否在顶部或底部
  const isAtTop = scrollTop === 0
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1

  // 存储到 dataset 中供 touchmove 使用
  target.dataset.isAtTop = isAtTop.toString()
  target.dataset.isAtBottom = isAtBottom.toString()
}

// 处理触摸移动事件
function handleTouchMove(event: TouchEvent) {
  const target = event.currentTarget as HTMLElement
  const touch = event.touches[0]
  const deltaY = touch.clientY - touchStartY.value

  // 检查当前滚动位置
  const currentScrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight
  const currentIsAtTop = currentScrollTop === 0
  const currentIsAtBottom = currentScrollTop + clientHeight >= scrollHeight - 1

  // 标记正在触摸移动
  isTouchMoving.value = true

  // iOS特殊处理：在顶部向上滑动时，允许切换到上一页
  if (currentIsAtTop && deltaY > 0) {
    // 允许切换到上一页，不阻止事件
    isScrolling.value = false // 确保可以切换
    return true
  }

  // iOS特殊处理：在底部向下滑动时，阻止事件传播
  if (currentIsAtBottom && deltaY < 0) {
    event.preventDefault()
    return false
  }

  // 如果内容有滚动，标记正在滚动并允许正常滚动
  if (target.scrollHeight > target.clientHeight) {
    isScrolling.value = true

    // 清除之前的定时器
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }

    // iOS设备使用更短的延迟时间
    const delay = isIOS.value ? 200 : 300
    scrollTimeout.value = window.setTimeout(() => {
      isScrolling.value = false
    }, delay)

    return true
  }

  // 如果内容没有滚动，允许 swipe 切换
  return true
}

// 处理触摸结束事件
function handleTouchEnd() {
  // 重置触摸移动状态
  isTouchMoving.value = false

  // 在触摸结束时，如果正在滚动，则恢复 swipe 功能
  if (isScrolling.value) {
    // iOS设备需要更长的延迟来确保滚动动画完成
    const delay = isIOS.value ? 150 : 100
    setTimeout(() => {
      isScrolling.value = false
    }, delay)
  }
}
</script>

<template>
  <van-swipe
    ref="swipeRef"
    class="swipe-full-height"
    vertical
    :loop="false"
    :show-indicators="false"
    :touchable="!isScrolling"
    @change="handleSwipeChange"
  >
    <van-swipe-item class="swipe-item-bg" :class="{ 'ios-device': isIOS }">
      <!-- <div style="position: absolute;top: 70px;left: 40px;color: red;z-index: 3333;">
        {{ isIOS }}{{ 1 }}
      </div> -->
      <!-- 视频占位图片，在视频未加载时显示 -->
      <div v-if="!isVideoLoaded && !isVideoError" class="video-placeholder">
        <van-image :src="spbg" class="video-placeholder-img" />
      </div>
      <!-- 视频元素 -->
      <video
        src="@/assets/video/home.mp4"
        autoplay
        muted
        playsinline
        :loop="true"
        class="video-bg"
        :class="{ 'video-loaded': isVideoLoaded }"
        :poster="spbg"
        @loadeddata="handleVideoLoad"
        @error="handleVideoError"
      />
      <!-- 蒙层 -->
      <div class="video-overlay" />
      <div class="swipe-item-content">
        <!-- 顶部栏 -->
        <div class="top-bar">
          <div class="top-bar-left">
            <div class="logo-box">
              <!-- <image src="@/assets/logo.png" /> -->
              <van-image :src="appLogo" />
            </div>
            <span class="app-title">{{ appName }}</span>
          </div>
          <div class="top-bar-right">
            <span class="lang-switch" @click="openCustomLanguagePopup">{{ currentLanguage }}▼</span>
            <a href="mailto:earohelpcenter@outlook.com">
              <div class="email-box">
                <van-image :src="email" />
              </div>
            </a>
          </div>
        </div>
        <!-- 标题 -->
        <div class="main-title-wrap">
          <div class="main-title-text">
            {{ t('home.mainTitle') }}<br>{{ t('home.mainSubTitle') }}
          </div>
        </div>
        <!-- 底部按钮 -->
        <div class="bottom-btns-wrap" :class="{ 'ios-device': isIOS }">
          <div class="bottom-btns">
            <!-- 根据系统和downloadType动态显示下载按钮 -->
            <div class="download-btn" @click="handleDownloadClick">
              <van-image
                :src="currentDownloadButton.imageUrl"
                class="download-img"
                style="width: 25px; height: 25px;margin-right: 5px;"
              />
              <div class="jump-btn-text">
                <p style="font-size: 10px;">
                  {{ currentDownloadButton.subtitle }}
                </p>
                <p style="font-size: 16px;line-height: 18px;font-weight: 600;">
                  {{ currentDownloadButton.downloadName }}
                </p>
              </div>
            </div>
            <!-- 跳转按钮 -->
            <div class="jump-btn" @click="jumpToB">
              <van-image :src="sp" class="download-img" style="width: 26px; height: 22px;margin-right: 5px;" />
              <div class="jump-btn-text">
                <p style="font-size: 10px;">
                  {{ t('home.Videochat') }}
                </p>
                <p style="font-size: 16px;line-height: 18px;font-weight: 600;">
                  {{ t('home.Startnow') }}
                </p>
              </div>
            </div>
          </div>
          <div class="jianto-wrap">
            <div class="jianto-img-box">
              <van-image :src="jianto" />
            </div>
          </div>
        </div>
      </div>
    </van-swipe-item>
    <van-swipe-item ref="secondSwipeItemRef" class="swipe-item-light" :class="{ 'ios-device': isIOS }">
      <!-- 顶部信封icon -->
      <div class="about-top-icon">
        <div class="about-top-icon-inner">
          <van-image :src="up" class="about-top-img" />
        </div>
      </div>
      <!-- About Us 标题 -->
      <div class="about-title">
        {{ t('home.aboutUs') }}
      </div>
      <!-- 第一行：左图右文 -->
      <div class="about-row about-row-1">
        <div class="about-row-img-box">
          <div class="about-row-img-placeholder">
            <van-image :src="first" />
          </div>
        </div>
        <div class="about-row-content about-row-content-1">
          <div class="about-row-title">
            {{ t('home.makeFriends') }}<br>{{ t('home.friendsGlobally') }}
          </div>
          <div class="about-row-desc">
            {{ t('home.makeFriendsDesc') }}
          </div>
          <div class="about-row-btns" @click="jumpToB">
            <button class="about-row-btn">
              {{ t('home.startVideoChat') }}
            </button>
          </div>
        </div>
      </div>
      <!-- 第二行：左文右图 -->
      <div class="about-row about-row-2">
        <div class="about-row-img-box">
          <div class="about-row-img-placeholder">
            <van-image :src="second" />
          </div>
        </div>
        <div class="about-row-content about-row-content-2">
          <div class="about-row-title" @click="jumpToB">
            {{ t('home.instantVideoChat') }}
          </div>
          <div class="about-row-desc">
            {{ t('home.instantVideoChatDesc') }}
          </div>
          <div class="about-row-btns" @click="jumpToB">
            <button class="about-row-btn">
              {{ t('home.startVideoChat') }}
            </button>
          </div>
        </div>
      </div>
      <!-- 第三行：左图右文 -->
      <div class="about-row about-row-1">
        <div class="about-row-img-box">
          <div class="about-row-img-placeholder">
            <van-image :src="three" />
          </div>
        </div>
        <div class="about-row-content about-row-content-1">
          <div class="about-row-title">
            {{ t('home.Interactive') }}<br>{{ t('home.subInteractive') }}
          </div>
          <div class="about-row-desc">
            {{ t('home.Interactivedesc') }}
          </div>
          <div class="about-row-btns" @click="jumpToB">
            <button class="about-row-btn">
              {{ t('home.startVideoChat') }}
            </button>
          </div>
        </div>
      </div>
      <!-- 第四行：左文右图 -->
      <div class="about-row about-row-2">
        <div class="about-row-img-box">
          <div class="about-row-img-placeholder">
            <van-image :src="fore" />
          </div>
        </div>
        <div class="about-row-content about-row-content-2">
          <div class="about-row-title" @click="jumpToB">
            {{ t('home.Security') }}<br>{{ t('home.guaranteed') }}<br>{{ t('home.Privacy') }}
          </div>
          <div class="about-row-desc">
            {{ t('home.Securitydesc') }}
          </div>
          <div class="about-row-btns" @click="jumpToB">
            <button class="about-row-btn">
              {{ t('home.startVideoChat') }}
            </button>
          </div>
        </div>
      </div>
      <!-- 第五行：左图右文 -->
      <div class="about-row about-row-1" :class="{ 'ios-device': isIOS }">
        <div class="about-row-img-box">
          <div class="about-row-img-placeholder">
            <van-image :src="five" />
          </div>
        </div>
        <div class="about-row-content about-row-content-1">
          <div class="about-row-title">
            {{ t('home.Interest') }}<br>{{ t('home.Matching') }}
          </div>
          <div class="about-row-desc">
            {{ t('home.Interestdesc') }}
          </div>
          <div class="about-row-btns" @click="jumpToB">
            <button class="about-row-btn">
              {{ t('home.startVideoChat') }}
            </button>
          </div>
        </div>
      </div>
    </van-swipe-item>
  </van-swipe>
  <!-- <van-cell-group :title="$t('home.settings')" :border="false" :inset="true">
    <van-cell center :title="$t('home.darkMode')">
      <template #right-icon>
        <van-switch
          v-model="checked"
          size="20px"
          aria-label="on/off Dark Mode"
        />
      </template>
    </van-cell>

    <van-cell
      is-link
      :title="$t('home.language')"
      :value="language"
      @click="showLanguagePicker = true"
    />

    <div @click="turn">
      跳转
    </div>
  </van-cell-group> -->

  <!-- <van-cell-group :title="$t('home.examples')" :border="false" :inset="true">
    <template v-for="item in menuItems" :key="item.route">
      <van-cell :title="item.title" :to="item.route" is-link />
    </template>
  </van-cell-group> -->

  <van-popup v-model:show="showLanguagePicker" position="bottom">
    <van-picker
      v-model="languageValues"
      :columns="languageColumns"
      @confirm="onLanguageConfirm"
      @cancel="showLanguagePicker = false"
    />
  </van-popup>

  <!-- 自定义多语言弹窗 -->
  <div v-if="showCustomLanguagePopup" class="language-popup-overlay" @click="showCustomLanguagePopup = false">
    <div class="language-popup" @click.stop>
      <div
        v-for="lang in languageColumns"
        :key="lang.value"
        class="language-option"
        @click="selectLanguage(lang.value)"
      >
        {{ lang.text }}
      </div>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'Home'
}
</route>

<style scoped>
.swipe-full-height {
  height: 100vh;
  /* iOS Safari 优化 */
  -webkit-overflow-scrolling: touch;
  /* 防止iOS的橡皮筋效果 */
  overscroll-behavior: none;
}
.swipe-item-bg {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.video-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-bg.video-loaded {
  opacity: 1;
}

.video-placeholder {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.video-placeholder-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 3;
}
.swipe-item-content {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}
.top-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-box {
  width: 32px;
  height: 32px;
  /* background: #ccc; */
  /* border-radius: 12px; */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
  /* font-size: 24px; */
}
.app-title {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}
.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lang-switch {
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
.email-box {
  width: 24px;
  height: 24px;
  background: #ccc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.main-title-wrap {
  margin-top: 60px;
  text-align: center;
  padding: 0 20px;
}
.main-title-text {
  color: #fff;
  font-size: 32px;
  font-weight: bold;
  line-height: 1.1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.bottom-btns-wrap {
  position: absolute;
  left: 0;
  bottom: 40px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.bottom-btns {
  display: flex;
  gap: 16px;
}
.download-btn {
  color: #fff;
  border-radius: 7px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  background: #000;
  border: 1px solid #b2b4b6;
}
.jump-btn {
  color: #fff;
  border-radius: 7px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  background: linear-gradient(90deg, #8746ff 0%, #45d9e7 100%);
  border: 1px solid #b2b4b6;
}
.download-img {
  width: 123px;
  height: 43px;
}
.jianto-wrap {
  /* margin-top: 16px; */
}
.jianto-img-box {
  width: 48px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  opacity: 0.7;
}
.swipe-item-light {
  background: #fafbfc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  overflow-y: auto;
  /* 确保滚动容器正常工作 */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  /* 防止滚动时触发 swipe 切换 */
  touch-action: pan-y;
  /* 确保内容可以正常滚动 */
  position: relative;
  z-index: 1;
  /* iOS Safari 兼容性优化 */
  overscroll-behavior: none;
  /* 防止iOS的橡皮筋效果干扰swipe切换 */
  -webkit-overflow-scrolling: touch;
  /* 确保触摸事件能正确处理 */
  transform: translateZ(0);
  /* 启用硬件加速 */
  will-change: scroll-position;
}

/* iOS设备底部安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .swipe-item-light {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* 为iOS设备添加额外的底部间距 */
.ios-device {
  padding-bottom: calc(env(safe-area-inset-bottom) + 70px);
}

/* 使用CSS变量动态设置底部间距 */
.swipe-item-light {
  --ios-bottom-padding: 0px;
  --safe-area-inset-bottom: 0px;
}

.swipe-item-light.ios-device {
  --ios-bottom-padding: calc(var(--safe-area-inset-bottom) + 20px);
  padding-bottom: var(--ios-bottom-padding);
}

/* iOS安全区域底部占位 */
.ios-safe-area-bottom {
  width: 100%;
  background: transparent;
  /* 确保在iOS设备上有足够的底部间距 */
  min-height: var(--safe-area-inset-bottom);
}
.about-top-icon {
  margin-top: 32px;
  margin-bottom: 12px;
}
.about-top-icon-inner {
  width: 48px;
  height: 32px;
  /* border: 2px dashed #bbb; */
  /* border-radius: 8px; */
  display: flex;
  align-items: center;
  justify-content: center;
  /* color: #bbb; */
  font-size: 24px;
}
/* .about-top-img {
  width: 32px;
  height: 20px;
} */
.about-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 32px;
  color: black;
}
.about-row {
  display: flex;
  width: 90vw;
  align-items: flex-start;
  color: black;
}
.about-row-1 {
  margin-bottom: 40px;
}
.about-row-2 {
  max-width: 700px;
  flex-direction: row-reverse;
  margin-bottom: 40px;
}
.about-row-img-box {
  flex: 1;
  display: flex;
  justify-content: center;
}
.about-row-img-placeholder {
  width: 142px;
  height: 288px;
  /* background: #eee; */
  /* border-radius: 36px; */
  /* box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.about-row-img-placeholder-text {
  color: #bbb;
  font-size: 18px;
}
.about-row-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.about-row-content-1 {
  flex: 1.2;
  padding-left: 32px;
}
.about-row-content-2 {
  flex: 1.2;
  padding-right: 25px;
}
.about-row-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}
.about-row-desc {
  color: #bbb;
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.3;
}
.about-row-btns {
  display: flex;
}
.about-row-btn {
  background: linear-gradient(90deg, #8746ff 0%, #45d9e7 100%);
  color: #fff;
  border: none;
  border-radius: 32px;
  padding: 10px 26px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.language-popup-overlay {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding-top: 55px;
}

.language-popup {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 120px;
  margin-right: 60px;
  max-height: 310px;
  overflow-y: auto;
}

.language-option {
  padding: 10px 24px;
  color: #007aff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

.language-option:last-child {
  border-bottom: none;
}

.language-option:hover {
  background-color: #f8f9fa;
}
</style>
