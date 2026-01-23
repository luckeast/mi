import request from '@/utils/request'

export async function queryProse(): Promise<any> {
  return request('/prose')
}

export async function getAppConfig(): Promise<any> {
  return request({
    url: '/config/getAppConfigPostV2',
    method: 'POST',
    data: {
      ver: 0,
      // http_headers 会由请求拦截器自动添加
    },
    // 确保响应以文本形式返回，不被自动解析为 JSON
    // 这样我们可以获取到原始的加密字符串进行解密
    responseType: 'text',
  })
}
