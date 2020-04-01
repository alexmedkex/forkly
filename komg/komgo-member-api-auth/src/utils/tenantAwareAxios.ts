import axios, { AxiosInstance } from 'axios'

export const tenantIdHeaderName = 'X-Tenant-StaticID'

export const tenantAwareAxios = (tenantStaticID: string): AxiosInstance => {
  if (!tenantStaticID) {
    throw new Error('tenantStaticID is empty')
  }

  return axios.create({
    headers: { [tenantIdHeaderName]: tenantStaticID }
  })
}
