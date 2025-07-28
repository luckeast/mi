import request from '@/utils/request'

export async function queryProse(): Promise<any> {
  return request('/prose')
}

export async function getAppConfig(): Promise<any> {
  return request('/config/getAppConfig')
}
