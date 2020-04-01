import { IUserCreateRequest } from '@komgo/types'
import axios from 'axios'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../inversify/types'

export interface IUserProfile {
  createdAt: number
  email: string
  firstName: string
  id: string
  lastName: string
  username: string
}

export interface IUsersService {
  createMemberNodeAccount(user: IUserCreateRequest): Promise<IUserProfile>
}

@injectable()
export default class UsersService implements IUsersService {
  constructor(@inject(TYPES.ApiUsersBaseUrl) private readonly apiUsersBaseUrl: string) {}

  async createMemberNodeAccount(user: IUserCreateRequest): Promise<IUserProfile> {
    const response = await axios.post<IUserProfile>(`${this.apiUsersBaseUrl}/v0/users`, user)

    const createdUser = response.data
    await axios.patch(`${this.apiUsersBaseUrl}/v0/roles/memberNodeAccount/assigned-users`, {
      added: [createdUser.id],
      removed: []
    })

    return response.data
  }
}
