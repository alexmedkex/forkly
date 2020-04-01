import { AxiosInstance } from 'axios'

import ICheckPermissionResponse from '../service-layer/response/ICheckPermissionResponse'

import IIsPermittedRequest from './IIsPermittedRequest'

export default async (axios: AxiosInstance, data: IIsPermittedRequest): Promise<boolean> => {
  const resp = await axios.post<ICheckPermissionResponse>(`${process.env.API_ROLES_BASE_URL}/v0/is-permitted`, data, {
    responseType: 'json'
  })
  return resp.data.isPermitted
}
