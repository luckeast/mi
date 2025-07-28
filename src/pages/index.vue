<script setup lang="ts">
import type { PickerColumn } from 'vant'
import { languageColumns, locale } from '@/utils/i18n'
import logo from '~/images/logo.png'
import email from '~/images/email.png'
import download from '~/images/download.png'
import ty from '~/images/ty.png'
import jianto from '~/images/jianto.png'
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

function onLanguageConfirm(event: { selectedOptions: PickerColumn }) {
  locale.value = event.selectedOptions[0].value as string
  showLanguagePicker.value = false
}

function openCustomLanguagePopup() {
  showCustomLanguagePopup.value = true
}

function selectLanguage(lang: string) {
  locale.value = lang
  showCustomLanguagePopup.value = false
}
// function turn() {
//   // window.location.href = 'https://test-h5.snoperp.com/h5_web/forweb?webCode=6666'
//   window.open('https://test-h5.snoperp.com/h5_web/forweb?webCode=6666', '_blank')
// }
async function downloadApp() {
  console.warn('downloadApp')
  getAppConfig().then(({ code, result }) => {
    console.warn(result, code)
  })
}
</script>

<template>
  <van-swipe style="height: 100vh;" vertical :loop="false" :show-indicators="false">
    <van-swipe-item style="position: relative; width: 100vw; height: 100vh; overflow: hidden;">
      <video src="@/assets/video/home.mov" autoplay muted :loop="true" style="width: 100%; height: 100%; object-fit: cover; display: block; position: absolute; left: 0; top: 0; z-index: 1;" />
      <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 5;">
        <!-- 顶部栏 -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 40px; height: 40px; background: #ccc; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              <!-- <image src="@/assets/logo.png" /> -->
              <van-image :src="logo" />
            </div>
            <span style="color: #fff; font-size: 24px; font-weight: bold;">AppName</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #fff; font-size: 18px; cursor: pointer;" @click="openCustomLanguagePopup">{{ currentLanguage }}▼</span>
            <div style="width: 40px; height: 40px; background: #ccc; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;">
              <van-image :src="email" />
            </div>
          </div>
        </div>
        <!-- 标题 -->
        <div style="margin-top: 100px; text-align: center;">
          <div style="color: #fff; font-size: 40px; font-weight: bold; line-height: 1.1; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            {{ t('home.mainTitle') }}<br>{{ t('home.mainSubTitle') }}
          </div>
        </div>
        <!-- 底部按钮 -->
        <div style="position: absolute; left: 0; bottom: 40px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px;">
          <div style="display: flex; gap: 16px;">
            <div style="color: #fff; border-radius: 12px; padding: 10px 18px 10px 50px; display: flex; align-items: center; font-size: 18px; font-weight: 500;" @click="downloadApp">
              <van-image :src="download" style="width: 123px;height: 43px;" />
            </div>
            <div style=" color: #fff; border-radius: 12px; padding: 10px 50px 10px 18px; display: flex; align-items: center; font-size: 18px; font-weight: 500;">
              <van-image :src="ty" style="width: 123px;height: 43px;" />
            </div>
          </div>
          <div style="margin-top: 16px;">
            <div style="width: 48px; height: 32px;  display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; opacity: 0.7;">
              <van-image :src="jianto" />
            </div>
          </div>
        </div>
      </div>
    </van-swipe-item>
    <van-swipe-item style="background: #fafbfc; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 0;overflow-y: auto;">
      <!-- 顶部信封icon -->
      <div style="margin-top: 32px; margin-bottom: 12px;">
        <div style="width: 48px; height: 32px; border: 2px dashed #bbb; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 24px;">
          <van-image :src="jianto" style="width: 32px; height: 20px;" />
        </div>
      </div>
      <!-- About Us 标题 -->
      <div style="font-size: 32px; font-weight: bold; text-align: center; margin-bottom: 32px;color: black;">
        {{ t('home.aboutUs') }}
      </div>
      <!-- 第一行：左图右文 -->
      <div style="display: flex; width: 90vw; align-items: flex-start; margin-bottom: 48px;color: black;">
        <div style="flex: 1; display: flex; justify-content: center;">
          <div style="width: 142px; height: 288px; background: #eee; border-radius: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <!-- 手机占位图 -->
            <span style="color: #bbb; font-size: 18px;">Phone Image</span>
          </div>
        </div>
        <div style="flex: 1.2; padding-left: 32px; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">
            {{ t('home.makeFriends') }}<br>{{ t('home.friendsGlobally') }}
          </div>
          <div style="color: #bbb; font-size: 14px; margin-bottom: 24px; line-height: 1.5;">
            {{ t('home.makeFriendsDesc') }}
          </div>
          <div style="display: flex;">
            <button style="background: linear-gradient(90deg, #a18fff 0%, #5ee7df 100%); color: #fff; border: none; border-radius: 32px; padding: 10px 36px; font-size: 14px; font-weight: 500; cursor: pointer;">
              {{ t('home.startVideoChat') }}
            </button>
          </div>
        </div>
      </div>
      <!-- 第二行：左文右图 -->
      <div style="display: flex; width: 90vw; max-width: 700px; align-items: flex-start; flex-direction: row-reverse;color: black;">
        <div style="flex: 1; display: flex; justify-content: center;">
          <div style="width: 142px; height: 288px; background: #eee; border-radius: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <!-- 手机占位图 -->
            <span style="color: #bbb; font-size: 18px;">Phone Image</span>
          </div>
        </div>
        <div style="flex: 1.2; padding-right: 32px; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">
            {{ t('home.instantVideoChat') }}
          </div>
          <div style="color: #bbb; font-size: 14px; margin-bottom: 24px; line-height: 1.5;">
            {{ t('home.instantVideoChatDesc') }}
          </div>
          <div style="display: flex;">
            <button style="background: linear-gradient(90deg, #a18fff 0%, #5ee7df 100%); color: #fff; border: none; border-radius: 32px; padding: 10px 36px; font-size: 14px; font-weight: 500; cursor: pointer;">
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
