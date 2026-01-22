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
    },
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
