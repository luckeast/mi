/**
 * iOS安全区域适配工具
 */

// 检测是否为iOS设备
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

// 检测是否支持安全区域
export function supportsSafeArea(): boolean {
  return CSS.supports('padding-bottom', 'env(safe-area-inset-bottom)')
}

// 获取安全区域底部高度
export function getSafeAreaBottom(): number {
  if (!isIOSDevice() || !supportsSafeArea()) {
    return 0
  }

  // 创建一个临时元素来获取安全区域高度
  const tempEl = document.createElement('div')
  tempEl.style.position = 'fixed'
  tempEl.style.bottom = '0'
  tempEl.style.left = '0'
  tempEl.style.width = '1px'
  tempEl.style.height = 'env(safe-area-inset-bottom)'
  tempEl.style.visibility = 'hidden'
  tempEl.style.pointerEvents = 'none'
  document.body.appendChild(tempEl)

  // 获取计算后的高度
  const computedStyle = window.getComputedStyle(tempEl)
  const height = computedStyle.height
  const safeAreaHeight = Number.parseInt(height) || 0

  document.body.removeChild(tempEl)

  return safeAreaHeight
}

// 获取完整的底部间距（安全区域 + 额外间距）
export function getBottomPadding(extraPadding = 20): number {
  const safeAreaHeight = getSafeAreaBottom()
  return safeAreaHeight + extraPadding
}

// 设置CSS变量
export function setSafeAreaCSSVariables(): void {
  if (!isIOSDevice()) {
    return
  }

  const safeAreaBottom = getSafeAreaBottom()
  const bottomPadding = getBottomPadding()

  // 设置CSS变量
  document.documentElement.style.setProperty('--safe-area-inset-bottom', `${safeAreaBottom}px`)
  document.documentElement.style.setProperty('--ios-bottom-padding', `${bottomPadding}px`)
}

// 监听屏幕方向变化，重新计算安全区域
export function watchSafeAreaChanges(): () => void {
  if (!isIOSDevice()) {
    return () => {}
  }

  const handleOrientationChange = () => {
    // 延迟执行，确保屏幕旋转完成
    setTimeout(() => {
      setSafeAreaCSSVariables()
    }, 100)
  }

  window.addEventListener('orientationchange', handleOrientationChange)
  window.addEventListener('resize', handleOrientationChange)

  return () => {
    window.removeEventListener('orientationchange', handleOrientationChange)
    window.removeEventListener('resize', handleOrientationChange)
  }
}
