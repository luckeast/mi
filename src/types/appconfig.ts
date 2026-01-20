/**
 * Web数据对象类型定义
 */
export interface WebData {
  /** iOS下载链接 */
  iosdownloadLink: string
  /** iOS下载类型 ("0": App Store, "1": TestFlight) */
  iosdownloadType: string
  /** Android下载类型 ("0": Google Play, "1": APK) */
  androiddownloadType: string
  /** APK下载链接（Android系统专用） */
  apkdownloadLink: string
  /** App图标/Logo */
  appImg: string
  /** App名称 */
  appName: string
  /** 网页跳转链接 */
  webLink: string
  /** 下载类型（旧字段，保留用于兼容） */
  downloadType?: string
  /** 下载链接（旧字段，保留用于兼容） */
  downloadLink?: string
}

/**
 * App扩展数据类型定义
 */
export interface AppExtData {
  app_dominate: string
  flash_noti_title: string
  h5_fullpath: string
  flash_wait_content: string
  flash_noti_content: string
  flash_noti_enabled: string
  app_screenshot_num: string
  app_input_check_enabled: string
  app_sub_dominate: string
  h5_subpath: string
  app_dominate_count: string
  web_data: WebData[]
  loading_img_url: string
  flash_time: string
  safety: string
  banner_enabled: string
  flash_no_perrsion: string
  app_screenshot_enabled: string
  app_install_url: string
  flash_times: string
}

/**
 * AppConfig配置项
 */
export interface AppConfigItem {
  name: string
  data: any
}

/**
 * AppConfig响应数据
 */
export interface AppConfigResponse {
  code: number
  key: string
  msg: string
  data: {
    rvsta: string
    ver: string
    items: AppConfigItem[]
    riskControlInfoConfig: {
      k_interval: number
      k_factor: string
      k_factor_num: string
    }
  }
  success: boolean
  fail: boolean
}
