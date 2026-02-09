import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { showNotify } from 'vant'
import { STORAGE_TOKEN_KEY } from '@/stores/mutation-type'
import { AppConfigDecryptor, SafetyUtils } from './safety-utils'

// 这里是用于设定请求后端时，所用的 Token KEY
// 可以根据自己的需要修改，常见的如 Access-Token，Authorization
// 需要注意的是，请尽量保证使用中横线`-` 来作为分隔符，
// 避免被 nginx 等负载均衡器丢弃了自定义的请求头
export const REQUEST_TOKEN_KEY = 'Access-Token'

// 创建 axios 实例
// 自定义公参配置（应该放在 body.http_headers 中，而不是 Headers）
const HTTP_HEADERS_CONFIG = {
  'ver': '7.1.8',
  'device-id': '55d74a0d-2cac-489d-b083-b8bce8bf7e0d',
  'model': 'web',
  'lang': 'zh',
  'sys_lan': 'zh',
  'is_anchor': 'false',
  'pkg': 'background.aiposyy.world',
  'platform': 'iOS',
  'device_lang': 'zh',
  'device_country': 'CN',
  'time_zone': 'Asia/Shanghai',
  'platform_ver': '1.0.0',
  'utm-source': '',
  'rc_type': 'SG',
  'sec_ver': '0',
}

const request = axios.create({
  // API 请求的默认前缀
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 6000, // 请求超时时间
  headers: {
    // 只保留必须在 Headers 中的字段
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxOTQ5NzU5MDE3MjkxMjE4OTQ0IiwidXNlcl90eXBlIjoxLCJleHAiOjQ5MDkzNjczNDksImNyZWF0ZWQiOjE3NTM2OTM3NDk5MzR9.8R2QLt7b-R4hJzNm7JpXR1HourH1tIT5mLUMCt6TIuDdJxpIkTl7lmfMlH3wMVbKLyuzV1ql62gP_kfu7Hetbg',
  },
})

export type RequestError = AxiosError<{
  message?: string
  result?: any
  errorMessage?: string
}>

// 异常拦截处理器
function errorHandler(error: RequestError): Promise<any> {
  if (error.response) {
    const { data = {}, status, statusText } = error.response
    // 403 无权限
    if (status === 403) {
      showNotify({
        type: 'danger',
        message: (data && data.message) || statusText,
      })
    }
    // 401 未登录/未授权
    if (status === 401 && data.result && data.result.isLogin) {
      showNotify({
        type: 'danger',
        message: 'Authorization verification failed',
      })
      // 如果你需要直接跳转登录页面
      // location.replace(loginRoutePath)
    }
  }
  return Promise.reject(error)
}

// 请求拦截器
function requestHandler(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> {
  const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY)
  // 如果 token 存在
  // 让每个请求携带自定义 token, 请根据实际情况修改
  if (savedToken)
    config.headers[REQUEST_TOKEN_KEY] = savedToken

  // 【重要】将自定义公参添加到 body.http_headers 中（而不是 Headers）
  // 根据接口文档要求：
  // 1. Content-Type 必须在 Headers 中，值为 "application/json"
  // 2. 自定义公参（pkg、ver、host、platform_ver、Authorization 等）必须放在 body.http_headers 中
  // 3. 不要传 is_repose_aes 参数（这是测试环境用的）
  if (config.method?.toUpperCase() === 'POST' || config.method?.toUpperCase() === 'PUT') {
    // 构建完整的 http_headers（包含公参 + Authorization）
    const httpHeaders = {
      ...HTTP_HEADERS_CONFIG,
      // 【关键】将 Authorization 也添加到 http_headers 中
      Authorization: config.headers.Authorization || config.headers[REQUEST_TOKEN_KEY] || '',
    }

    if (config.data && typeof config.data === 'object') {
      // 将完整的 http_headers 添加到 body
      config.data.http_headers = JSON.stringify(httpHeaders)
    }
    else if (!config.data) {
      // 如果没有 body，创建一个包含 http_headers 的对象
      config.data = {
        http_headers: JSON.stringify(httpHeaders),
      }
    }

    console.warn('http_headers 内容:', httpHeaders)
  }

  // 【appConfig 接口请求加密】
  // 判断是否为 appConfig 接口，需要加密请求体
  const requestUrl = config.url || ''
  if (requestUrl.includes('/config/getAppConfigPostV2')) {
    console.warn('========== appConfig 请求加密 ==========')
    console.warn('请求 URL:', requestUrl)
    console.warn('原始请求数据:', config.data)

    try {
      // 1. 构建完整的请求体（已包含 http_headers）
      const body = config.data || {}
      console.warn('完整请求体:', body)

      // 2. 转为 JSON 字符串
      const plainText = JSON.stringify(body)
      console.warn('JSON 字符串长度:', plainText.length)
      console.warn('JSON 字符串前200个字符:', plainText.substring(0, 200))

      // 3. 获取加密密钥（从域名生成）
      const baseURL = config.baseURL || import.meta.env.VITE_APP_API_BASE_URL || ''
      const appEncryKey = SafetyUtils.getAppEncryKey(baseURL)
      console.warn('域名密钥:', appEncryKey)
      console.warn('域名密钥长度:', appEncryKey.length)

      if (!appEncryKey || appEncryKey.length === 0) {
        throw new Error('无法从 baseURL 生成加密密钥')
      }

      // 4. AES-ECB 加密
      const encryptedData = SafetyUtils.encrypt(plainText, appEncryKey)
      console.warn('加密后数据长度:', encryptedData.length)
      console.warn('加密后数据前200个字符:', encryptedData.substring(0, 200))

      // 5. 替换请求数据为加密字符串
      config.data = encryptedData

      // 6. 保持 Content-Type 为 application/json（不修改）
      // 注意：虽然发送的是加密字符串，但服务器期望 Content-Type 为 application/json
      // config.headers['Content-Type'] 保持原值不变

      console.warn('✅ 请求加密成功')
      console.warn('最终 Content-Type:', config.headers['Content-Type'])
      console.warn('========================================')
    }
    catch (error) {
      console.error('❌ 请求加密失败:', error)
      console.error('错误详情:', error instanceof Error ? error.message : String(error))
      // 加密失败时，继续发送原始数据（降级处理）
    }
  }

  return config
}

// Add a request interceptor
request.interceptors.request.use(requestHandler, errorHandler)

// 响应拦截器
function responseHandler(response: AxiosResponse<any>) {
  // 判断是否为 appConfig 接口，需要解密
  const config = response.config
  const requestUrl = config.url || ''
  const fullUrl = config.baseURL ? `${config.baseURL}${requestUrl}` : requestUrl

  console.warn('========== 响应拦截器 ==========')
  console.warn('请求 URL:', requestUrl)
  console.warn('完整 URL:', fullUrl)
  console.warn('响应状态:', response.status)
  console.warn('响应头 Content-Type:', response.headers['content-type'])
  console.warn('响应数据类型:', typeof response.data)
  console.warn('响应数据:', response.data)
  console.warn('响应数据前200个字符:', typeof response.data === 'string' ? response.data.substring(0, 200) : JSON.stringify(response.data).substring(0, 200))

  // 判断是否为 appConfig 接口，需要解密
  if (requestUrl.includes('/config/getAppConfigPostV2') || fullUrl.includes('/config/getAppConfigPostV2')) {
    console.warn('✅ 匹配到 appConfig 接口，开始解密...')
    try {
      const baseURL = config.baseURL || import.meta.env.VITE_APP_API_BASE_URL || ''
      const baseUrl = baseURL || window.location.origin

      console.warn('BaseURL:', baseURL)
      console.warn('使用的 baseUrl:', baseUrl)

      // 获取服务器返回的加密字符串
      // 如果已经是字符串，直接使用；如果是对象，检查是否需要解密
      let encryptedResponse: string | null = null

      if (typeof response.data === 'string') {
        console.warn('响应数据是字符串，检查是否需要解密')
        // 先尝试解析为 JSON，如果成功且包含业务字段，说明已经是解密后的数据
        try {
          const parsed = JSON.parse(response.data)
          if (parsed && typeof parsed === 'object' && 'code' in parsed && 'key' in parsed && 'data' in parsed) {
            console.warn('✅ 字符串是有效的 JSON 且包含业务字段，说明已经解密，直接返回')
            return parsed
          }
        }
        catch {
          // 解析失败，说明是加密字符串，需要解密
          console.warn('字符串不是有效的 JSON，需要解密')
        }
        encryptedResponse = response.data
      }
      else if (response.data && typeof response.data === 'object') {
        // 检查是否已经是解密后的数据格式
        // 如果已经有 code、key、msg 字段，且 data 字段是对象（不是加密字符串），说明已经解密
        const hasCode = 'code' in response.data
        const hasKey = 'key' in response.data
        const hasMsg = 'msg' in response.data
        const hasData = 'data' in response.data && typeof response.data.data === 'object'

        if (hasCode && hasKey && hasMsg && hasData) {
          console.warn('✅ 响应数据已经是解密后的格式，直接返回')
          console.warn('数据内容:', response.data)
          return response.data
        }

        // 如果是对象但没有业务字段，可能是加密的 JSON 字符串被解析了，需要重新序列化
        console.warn('响应数据是对象，但需要解密，序列化为字符串')
        encryptedResponse = JSON.stringify(response.data)
      }
      else {
        console.warn('响应数据格式未知，尝试作为字符串处理')
        encryptedResponse = String(response.data)
      }

      if (!encryptedResponse || encryptedResponse.trim().length === 0) {
        console.error('❌ 加密响应字符串为空')
        return response.data
      }

      console.warn('加密响应字符串长度:', encryptedResponse.length)
      console.warn('加密响应前100个字符:', encryptedResponse.substring(0, 100))
      console.warn('加密响应后100个字符:', encryptedResponse.substring(Math.max(0, encryptedResponse.length - 100)))

      // 解密响应
      console.warn('开始调用解密函数...')
      const decryptedData = AppConfigDecryptor.decryptAppConfigResponse(
        encryptedResponse,
        baseUrl,
      )

      console.warn('========== AppConfig 解密结果 ==========')
      console.warn('解密后的数据:', decryptedData)
      console.warn('数据格式:', {
        code: decryptedData?.code,
        key: decryptedData?.key,
        msg: decryptedData?.msg,
        hasData: !!decryptedData?.data,
        dataKeys: decryptedData?.data ? Object.keys(decryptedData.data) : [],
      })
      console.warn('==========================================')

      // 返回解密后的数据
      return decryptedData
    }
    catch (error) {
      console.error('❌ 响应解密失败:', error)
      console.error('错误堆栈:', error instanceof Error ? error.stack : String(error))
      // 解密失败返回原始数据
      return response.data
    }
  }
  else {
    console.warn('❌ 不是 appConfig 接口，跳过解密')
  }

  console.warn('==========================================')
  return response.data
}

// Add a response interceptor
request.interceptors.response.use(responseHandler, errorHandler)

export default request
