import { TenantAwareAxios } from '@komgo/microservice-config'
import { IRoleRequest, IRoleResponse } from '@komgo/types'
import { AxiosInstance } from 'axios'
import { inject, injectable } from 'inversify'

import { CONFIG } from '../../inversify/config'

@injectable()
export default class RolesClient {
  constructor(
    @inject(CONFIG.rolesBaseUrl) private readonly rolesBaseUrl: string,
    @inject(TenantAwareAxios) private readonly tenantAwareAxios: AxiosInstance
  ) {}

  public async getRole(roleId: string): Promise<IRoleResponse> {
    const response = await this.tenantAwareAxios.get(`${this.rolesBaseUrl}/v0/roles/${roleId}`)
    return response.data
  }

  public async updateRole(roleId: string, role): Promise<IRoleResponse> {
    const response = await this.tenantAwareAxios.put(`${this.rolesBaseUrl}/v0/roles/${roleId}`, role)
    return response.data
  }

  public async createRole(role: IRoleRequest): Promise<IRoleResponse> {
    const response = await this.tenantAwareAxios.post(`${this.rolesBaseUrl}/v0/roles`, role)
    return response.data
  }

  public async deleteRole(roleId: string): Promise<void> {
    await this.tenantAwareAxios.delete(`${this.rolesBaseUrl}/v0/roles/${roleId}`)
  }
}
