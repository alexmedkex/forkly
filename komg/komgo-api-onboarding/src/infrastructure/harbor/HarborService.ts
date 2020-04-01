import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import axios from 'axios'
import { inject, injectable } from 'inversify'

import { IHarborCredentials } from '../../interfaces'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/ErrorName'
import generateIdFromName from '../../utils/generateIdFromName'
import generatePw from '../../utils/generatePw'

export interface IHarborService {
  createUser(companyAdminEmail: string, companyName: string, staticId: string): Promise<IHarborCredentials>
}

enum HarborRoleId {
  projectAdmin = 1,
  developer = 2,
  guest = 3,
  master = 4
}

@injectable()
export default class HarborService implements IHarborService {
  private readonly logger = getLogger('Harbor')
  constructor(
    @inject(TYPES.HarborAdminPass) private readonly harborAdminPass: string,
    @inject(TYPES.HarborAdminName) private readonly harborAdminName: string,
    @inject(TYPES.HarborProjectId) private readonly harborProjectId: string,
    @inject(TYPES.HarborUrl) private readonly harborUrl: string,
    @inject(TYPES.MonitoringDevEnv) private readonly MonitoringDevEnv: string
  ) {}

  async createUser(companyAdminEmail: string, companyName: string, staticId: string): Promise<IHarborCredentials> {
    // SMS-<env name from MONITORING_DEPLOYMENT_ENVIRONMENT>-<last 4 chars from static id>-<camelcased company name. first 10 chars>
    const companyNameCamelCase = generateIdFromName(companyName).substring(0, 10)

    const envName = this.MonitoringDevEnv ? `-${this.MonitoringDevEnv}` : ''
    const companyShortId = `SMS${envName}-${staticId.substring(staticId.length - 4)}-${companyNameCamelCase}`

    // use random email because companies may because companies may be onboarded in different envs (i.e. UAT, DEV, PROD)
    // and that will cause errors when we try to create users with the same email in Harbor
    const harborEmail = `${companyShortId}@komgo.io`

    const userCredentials: IHarborCredentials = {
      harborUser: companyShortId,
      harborEmail,
      harborPassword: generatePw(12)
    }

    this.logger.info('Creating user...', { username: companyShortId })
    const { headers } = await this.harborRequest('POST', '/api/users', {
      Username: userCredentials.harborUser,
      Email: userCredentials.harborEmail,
      Password: userCredentials.harborPassword,
      RealName: companyName,
      Comment: 'N/A'
    })
    this.logger.warn(ErrorCode.Authorization, 'headers', headers)

    const { location } = headers
    const userId: string = location.replace('/api/users/', '')

    if (!userId) {
      throw ErrorUtils.badRequestException(ErrorCode.UnexpectedError, 'user was not created in harbor', null)
    }

    this.logger.info(`User ID: ${userId}`)
    this.logger.info('Retrieving Project...')

    const { data } = await this.harborRequest('GET', `/api/projects/${this.harborProjectId}`)
    const projectName: string = data.name
    this.logger.info(`Project name: ${projectName}`)

    const requestBody = {
      role_id: HarborRoleId.guest,
      member_user: {
        user_id: parseInt(userId, 10),
        username: userCredentials.harborUser
      },
      member_group: {
        id: parseInt(this.harborProjectId, 10),
        group_name: projectName
      }
    }
    this.logger.info('Assigning User to Project...', requestBody)
    await this.harborRequest('POST', `/api/projects/${this.harborProjectId}/members`, requestBody)

    return userCredentials
  }

  private async harborRequest(method: string, route: string, data?: object) {
    try {
      return await axios({
        method,
        url: `${this.harborUrl}${route}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${this.harborAdminName}:${this.harborAdminPass}`).toString('base64')}`
        },
        data
      })
    } catch (e) {
      this.logger.error(ErrorCode.Connection, ErrorName.HarborError, e.message, {
        stacktrace: e.stack,
        statusCode: this.isAxiosError(e) ? e.response.status : null,
        method,
        route
      })
      throw ErrorUtils.internalServerException(ErrorCode.Connection, 'Harbor request error')
    }
  }

  private isAxiosError(err: any) {
    return err.response && err.response.status
  }
}
