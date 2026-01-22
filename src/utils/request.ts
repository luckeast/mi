import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { showNotify } from 'vant'
import { STORAGE_TOKEN_KEY } from '@/stores/mutation-type'

// 这里是用于设定请求后端时，所用的 Token KEY
// 可以根据自己的需要修改，常见的如 Access-Token，Authorization
// 需要注意的是，请尽量保证使用中横线`-` 来作为分隔符，
// 避免被 nginx 等负载均衡器丢弃了自定义的请求头
export const REQUEST_TOKEN_KEY = 'Access-Token'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 6000, // 请求超时时间
  headers: {
    'ver': '7.1.8',
    'device-id': '55d74a0d-2cac-489d-b083-b8bce8bf7e0d',
    'model': 'web',
    'lang': 'zh',
    'sys_lan': 'zh',
    'is_anchor': 'false',
    'pkg': 'app.vidchat.live',
    'platform': 'iOS',
    'device_lang': 'zh',
    'device_country': 'CN',
    'time_zone': 'Asia/Shanghai',
    'platform_ver': '1.0.0',
    'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxOTQ5NzU5MDE3MjkxMjE4OTQ0IiwidXNlcl90eXBlIjoxLCJleHAiOjQ5MDkzNjczNDksImNyZWF0ZWQiOjE3NTM2OTM3NDk5MzR9.8R2QLt7b-R4hJzNm7JpXR1HourH1tIT5mLUMCt6TIuDdJxpIkTl7lmfMlH3wMVbKLyuzV1ql62gP_kfu7Hetbg',
    'utm-source': '',
    'rc_type': 'SG',
    'sec_ver': '0',
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

  return config
}

// Add a request interceptor
request.interceptors.request.use(requestHandler, errorHandler)

// 响应拦截器
function responseHandler(response: { data: any }) {
  return response.data
}

// Add a response interceptor
request.interceptors.response.use(responseHandler, errorHandler)

export default request
