import _axios, { type AxiosRequestHeaders } from 'axios'

import { getAccessToken } from '~/store/userContext'

const adminAxios = _axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '',
})

adminAxios.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders
    }
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const adminApiClient = adminAxios
