import axios from 'axios'
import { stringify } from 'qs'

import authService from '../utils/AutheticationService'
import { getRealmName } from './user-storage'

const axiosConfig = {
  baseURL: `${process.env.REACT_APP_API_GATEWAY_URL}/api`
}

export const axiosWithoutAuth = axios.create(axiosConfig)

axiosWithoutAuth.interceptors.request.use(config => ({
  ...config,
  paramsSerializer: params => stringify(params)
}))

const axiosWithAuth = axios.create(axiosConfig)

axiosWithAuth.interceptors.request.use(async config => {
  const realmName = getRealmName()
  const jwt = await authService(realmName).getJWT()
  return {
    ...config,
    paramsSerializer: params => stringify(params),
    headers: {
      Authorization: `Bearer ${jwt}`,
      ...config.headers
    }
  }
})

export default axiosWithAuth
