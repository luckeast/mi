/*
 * @Author: Chensd ”851329628@qq.com“
 * @Date: 2025-07-24 20:38:09
 * @LastEditors: Chensd ”851329628@qq.com“
 * @LastEditTime: 2025-07-25 12:07:47
 * @FilePath: \web-bl\src\router\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { Router } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import type { EnhancedRouteLocation } from './types'
import { useRouteCacheStore, useUserStore } from '@/stores'

import { isLogin } from '@/utils/auth'
import setPageTitle from '@/utils/set-page-title'

NProgress.configure({ showSpinner: true, parent: '#app' })

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_PUBLIC_PATH),
  routes,
})

// This will update routes at runtime without reloading the page
if (import.meta.hot)
  handleHotUpdate(router)

router.beforeEach(async (to: EnhancedRouteLocation, from, next) => {
  NProgress.start()
  console.warn(from)
  const routeCacheStore = useRouteCacheStore()
  const userStore = useUserStore()

  // Route cache
  routeCacheStore.addRoute(to)

  // Set page title
  setPageTitle(to.meta.title)
  // debugger
  // 首页自动跳转逻辑
  // if (to.name === 'Home') {
  //   if (!isLogin()) {
  //     next({ name: 'Login', replace: true })
  //     return
  //   }
  //   else {
  //     // console.log('xiansh') 改为 console.warn 以通过 lint 检查
  //     console.warn('xiansh')
  //     next({ name: 'newHome', replace: true })
  //     return
  //   }
  // }

  if (isLogin() && !userStore.userInfo?.uid)
    await userStore.info()

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
