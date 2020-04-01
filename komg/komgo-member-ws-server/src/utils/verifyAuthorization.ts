import axios, { AxiosPromise } from 'axios'
import { v4 as uuid4 } from 'uuid'

const { API_AUTH_BASE_URL } = process.env

export function verifyAuthorization(token: string): AxiosPromise<any> {
  const headers = {
    Authorization: `Bearer ${token}`,
    'X-Request-ID': `${Date.now()}${uuid4()}`
  }
  return axios.get(`${API_AUTH_BASE_URL}/is-signed-in`, { headers })
}
