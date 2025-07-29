<script setup lang="ts">
import type { PickerColumn } from 'vant'
import { languageColumns, locale } from '@/utils/i18n'
import logo from '~/images/logo.png'
import email from '~/images/email.png'
import download from '~/images/download.png'
import ty from '~/images/ty.png'
import jianto from '~/images/jianto.png'
import first from '~/images/first.png'
import second from '~/images/second.png'
import three from '~/images/three.png'
import fore from '~/images/fore.png'
import five from '~/images/five.png'
import up from '~/images/up.png'
import { getAppConfig } from '@/api'

const { t } = useI18n()

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

onMounted(async () => {
  await getAppInstallUrl()
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
function jumpToB() {
  // window.location.href = 'https://test-h5.snoperp.com/h5_web/forweb?webCode=6666'
  window.open('https://test-h5.snoperp.com/h5_web/forweb?webCode=true', '_blank')
}
function downloadApp() {
  if (appInstallUrl.value) {
    window.open(appInstallUrl.value, '_blank')
  }
}
async function getAppInstallUrl() {
  getAppConfig().then((data) => {
    const extData = Array.isArray(data.data.items)
      ? data.data.items.find(item => item.name === 'app_ext_data')
      : undefined
    appInstallUrl.value = extData?.data.app_install_url
  })
}
</script>

<template>
  <van-swipe class="swipe-full-height" vertical :loop="false" :show-indicators="false">
    <van-swipe-item class="swipe-item-bg">
      <video src="@/assets/video/home.mov" autoplay muted :loop="true" class="video-bg" />
      <div class="swipe-item-content">
        <!-- 顶部栏 -->
        <div class="top-bar">
          <div class="top-bar-left">
            <div class="logo-box">
              <!-- <image src="@/assets/logo.png" /> -->
              <van-image :src="logo" />
            </div>
            <span class="app-title">AppName</span>
          </div>
          <div class="top-bar-right">
            <span class="lang-switch" @click="openCustomLanguagePopup">{{ currentLanguage }}▼</span>
            <div class="email-box">
              <van-image :src="email" />
            </div>
          </div>
        </div>
        <!-- 标题 -->
        <div class="main-title-wrap">
          <div class="main-title-text">
            {{ t('home.mainTitle') }}<br>{{ t('home.mainSubTitle') }}
          </div>
        </div>
        <!-- 底部按钮 -->
        <div class="bottom-btns-wrap">
          <div class="bottom-btns">
            <div class="download-btn" @click="downloadApp">
              <van-image :src="download" class="download-img" />
            </div>
            <div class="jump-btn" @click="jumpToB">
              <van-image :src="ty" class="download-img" />
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
    <van-swipe-item class="swipe-item-light">
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
      <div class="about-row about-row-2" style="margin-bottom: 10px;">
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
      <!-- 第四行：左文右图 -->
      <div class="about-row about-row-2" style="margin-bottom: 10px;">
        <div class="about-row-img-box">
          <div class="about-row-img-placeholder">
            <van-image :src="fore" />
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
      <!-- 第五行：左图右文 -->
      <div class="about-row about-row-1">
        <div class="about-row-img-box">
          <div class="about-row-img-placeholder">
            <van-image :src="five" />
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
  width: 40px;
  height: 40px;
  background: #ccc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.app-title {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
}
.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lang-switch {
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}
.email-box {
  width: 40px;
  height: 40px;
  background: #ccc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.main-title-wrap {
  margin-top: 100px;
  text-align: center;
}
.main-title-text {
  color: #fff;
  font-size: 40px;
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
  border-radius: 12px;
  padding: 10px 18px 10px 50px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
}
.jump-btn {
  color: #fff;
  border-radius: 12px;
  padding: 10px 50px 10px 18px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
}
.download-img {
  width: 123px;
  height: 43px;
}
.jianto-wrap {
  margin-top: 16px;
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
}
.about-top-icon {
  margin-top: 32px;
  margin-bottom: 12px;
}
.about-top-icon-inner {
  width: 48px;
  height: 32px;
  border: 2px dashed #bbb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 24px;
}
.about-top-img {
  width: 32px;
  height: 20px;
}
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
  margin-bottom: 30px;
}
.about-row-2 {
  max-width: 700px;
  flex-direction: row-reverse;
}
.about-row-img-box {
  flex: 1;
  display: flex;
  justify-content: center;
}
.about-row-img-placeholder {
  width: 142px;
  height: 288px;
  background: #eee;
  border-radius: 36px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
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
  background: linear-gradient(90deg, #a18fff 0%, #5ee7df 100%);
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
  padding-top: 70px;
}

.language-popup {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 120px;
  margin-right: 60px;
}

.language-option {
  padding: 12px 24px;
  color: #007aff;
  font-size: 16px;
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
