/**
 * 设备检测工具
 * 用于识别当前运行环境是 iOS、Android 还是其他平台
 */

/**
 * 设备类型枚举
 */
export enum DeviceType {
  IOS = 'iOS',
  ANDROID = 'Android',
  WINDOWS = 'Windows',
  MAC = 'Mac',
  LINUX = 'Linux',
  UNKNOWN = 'Unknown',
}

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  type: DeviceType
  userAgent: string
  platform: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  browser: string
  osVersion: string
}

/**
 * 检测是否为 iOS 设备
 */
export function isIOSDevice(): boolean {
  const ua = navigator.userAgent
  const platform = navigator.platform

  return (
    /iPad|iPhone|iPod/.test(ua)
    || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/**
 * 检测是否为 Android 设备
 */
export function isAndroidDevice(): boolean {
  return /Android/i.test(navigator.userAgent)
}

/**
 * 检测是否为 Windows 设备
 */
export function isWindowsDevice(): boolean {
  return /Windows/i.test(navigator.userAgent)
}

/**
 * 检测是否为 Mac 设备（非 iOS）
 */
export function isMacDevice(): boolean {
  return /Macintosh|MacIntel/.test(navigator.userAgent) && navigator.maxTouchPoints <= 1
}

/**
 * 检测是否为 Linux 设备
 */
export function isLinuxDevice(): boolean {
  return /Linux/i.test(navigator.userAgent) && !isAndroidDevice()
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  return isIOSDevice() || isAndroidDevice() || /Mobile/i.test(navigator.userAgent)
}

/**
 * 检测是否为平板设备
 */
export function isTabletDevice(): boolean {
  const ua = navigator.userAgent
  return (
    /iPad/.test(ua)
    || (/Android/i.test(ua) && !/Mobile/i.test(ua))
    || /Tablet/i.test(ua)
  )
}

/**
 * 获取设备类型
 */
export function getDeviceType(): DeviceType {
  if (isIOSDevice())
    return DeviceType.IOS
  if (isAndroidDevice())
    return DeviceType.ANDROID
  if (isWindowsDevice())
    return DeviceType.WINDOWS
  if (isMacDevice())
    return DeviceType.MAC
  if (isLinuxDevice())
    return DeviceType.LINUX

  return DeviceType.UNKNOWN
}

/**
 * 获取浏览器类型
 */
export function getBrowserType(): string {
  const ua = navigator.userAgent

  if (/MicroMessenger/i.test(ua))
    return 'WeChat'
  if (/QQ\//i.test(ua))
    return 'QQ'
  if (/AlipayClient/i.test(ua))
    return 'Alipay'
  if (/Chrome/i.test(ua) && !/Edge/i.test(ua))
    return 'Chrome'
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua))
    return 'Safari'
  if (/Firefox/i.test(ua))
    return 'Firefox'
  if (/Edge/i.test(ua))
    return 'Edge'
  if (/MSIE|Trident/i.test(ua))
    return 'IE'

  return 'Unknown'
}

/**
 * 获取操作系统版本
 */
export function getOSVersion(): string {
  const ua = navigator.userAgent
  let version = 'Unknown'

  if (isIOSDevice()) {
    const match = ua.match(/OS (\d+)_(\d+)(?:_(\d+))?/)
    if (match)
      version = `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`
  }
  else if (isAndroidDevice()) {
    const match = ua.match(/Android (\d+\.?\d*\.?\d*)/)
    if (match)
      version = match[1]
  }
  else if (isWindowsDevice()) {
    if (/Windows NT 10\.0/.test(ua))
      version = '10'
    else if (/Windows NT 6\.3/.test(ua))
      version = '8.1'
    else if (/Windows NT 6\.2/.test(ua))
      version = '8'
    else if (/Windows NT 6\.1/.test(ua))
      version = '7'
  }
  else if (isMacDevice()) {
    const match = ua.match(/Mac OS X (\d+)[._](\d+)(?:[._](\d+))?/)
    if (match)
      version = `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`
  }

  return version
}

/**
 * 获取完整的设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    type: getDeviceType(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isMobile: isMobileDevice(),
    isTablet: isTabletDevice(),
    isDesktop: !isMobileDevice() && !isTabletDevice(),
    browser: getBrowserType(),
    osVersion: getOSVersion(),
  }
}

/**
 * 打印设备信息到控制台（格式化输出）
 */
export function printDeviceInfo(): DeviceInfo {
  const info = getDeviceInfo()

  console.warn('========================================')
  console.warn('🔍 设备信息检测')
  console.warn('========================================')
  console.warn(`📱 设备类型: ${info.type}`)
  console.warn(`💻 设备分类: ${info.isMobile ? '移动设备' : info.isTablet ? '平板设备' : '桌面设备'}`)
  console.warn(`🌐 浏览器: ${info.browser}`)
  console.warn(`📊 系统版本: ${info.type} ${info.osVersion}`)
  console.warn(`🔧 Platform: ${info.platform}`)
  console.warn('----------------------------------------')
  console.warn('详细信息:')
  console.warn(`  • 是否为移动设备: ${info.isMobile ? '是' : '否'}`)
  console.warn(`  • 是否为平板设备: ${info.isTablet ? '是' : '否'}`)
  console.warn(`  • 是否为桌面设备: ${info.isDesktop ? '是' : '否'}`)
  console.warn(`  • 是否为iOS: ${isIOSDevice() ? '是' : '否'}`)
  console.warn(`  • 是否为Android: ${isAndroidDevice() ? '是' : '否'}`)
  console.warn('----------------------------------------')
  console.warn('UserAgent:')
  console.warn(info.userAgent)
  console.warn('========================================')

  return info
}

/**
 * 简化版打印（只显示关键信息）
 */
export function printDeviceInfoSimple(): void {
  const deviceType = getDeviceType()
  const osVersion = getOSVersion()

  console.warn('========================================')
  console.warn(`📱 当前系统: ${deviceType} ${osVersion}`)
  console.warn(`🌐 浏览器: ${getBrowserType()}`)
  console.warn('========================================')
}
