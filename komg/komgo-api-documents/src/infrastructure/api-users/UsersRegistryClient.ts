import { getLogger } from '@komgo/logging'
import Axios from 'axios'
import { injectable, inject } from 'inversify'

import { CONFIG_KEYS } from '../../inversify/config_keys'

import IUserProfile from './IUserProfile'

@injectable()
export class UsersRegistryClient {
  private readonly logger = getLogger('CompaniesRegistryClient')

  constructor(@inject(CONFIG_KEYS.ApiUsersUrl) private readonly usersServerUrl: string) {}

  async getUserProfile(jwt: string): Promise<IUserProfile> {
    const url: string = `${this.usersServerUrl}/v0/profile`
    this.logger.info(`Fetching user profile at : ${url}`)

    try {
      const response = await Axios.get(url, { headers: { Authorization: jwt } })
      this.logger.info(`Response status for users profile fetch : ${response.status}`)

      return response.data
    } catch (e) {
      throw new Error(`Request to get user's profile failed. url : ${url}`)
    }
  }
}
