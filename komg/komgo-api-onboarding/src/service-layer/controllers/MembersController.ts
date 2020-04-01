import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { NotificationManager, NotificationLevel } from '@komgo/notification-publisher'
import { Status, IPublicKeyRequest } from '@komgo/types'
import { Controller, Route, Header, Put, Tags, Body, Security, Get } from 'tsoa'
import { v4 as uuid4 } from 'uuid'

import { ICompanyDataAgent } from '../../data-layer/data-agent/CompanyDataAgent'
import { IMemberPackage } from '../../interfaces'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/ErrorName'
import getUserId from '../../utils/getUserId'

const PRODUCT_ID = 'administration'
const NOTYFICATION_TYPE = 'Administration.info'
const CONTEXT_TYPE = 'setPublicKey'
const ACTION_ID = 'onboard'

/**
 * Members Class
 *
 * @export
 * @class MembersController
 * @extends {Controller}
 */
@Tags('Members')
@Route('members')
@provideSingleton(MembersController)
export class MembersController extends Controller {
  private logger = getLogger('MembersController')

  constructor(
    @inject(TYPES.CompanyDataAgent)
    private readonly companyDataAgent: ICompanyDataAgent,
    @inject(TYPES.NotificationManager) protected readonly notificationManager: NotificationManager
  ) {
    super()
  }

  /**
   * @summary download a member package
   */
  @Security('withPermission', ['administration', 'manageCustomerData', 'read'])
  @Get('member-package')
  public async downloadMemberPackage(@Header('Authorization') authHeader: string): Promise<IMemberPackage> {
    const keycloakUserId = getUserId(authHeader)
    const member = await this.companyDataAgent.getMemberByKeycloakUserId(keycloakUserId)
    if (member.status === Status.Draft) {
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, `Member package is not ready yet`, null)
    }

    const memberPackage: IMemberPackage = {
      ensAddress: process.env.ENS_REGISTRY_CONTRACT_ADDRESS,
      staticId: member.staticId,
      komgoMnid: member.komgoMnid,
      rabbitMQCommonUser: member.rabbitMQCommonUser,
      rabbitMQCommonPassword: member.rabbitMQCommonPassword,
      harborUser: member.harborUser,
      harborEmail: member.harborEmail,
      harborPassword: member.harborPassword
    }

    return memberPackage
  }

  /**
   * @summary add public keys
   */
  @Security('withPermission', ['administration', 'manageCustomerData', 'crud'])
  @Put('public-keys')
  public async addPublicKeys(
    @Header('Authorization') authHeader: string,
    @Body() data: IPublicKeyRequest
  ): Promise<void> {
    const keycloakUserId = getUserId(authHeader)
    const member = await this.companyDataAgent.getMemberByKeycloakUserId(keycloakUserId)
    if (member.status === Status.Onboarded) {
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpContent,
        `Public keys has already been added to blockchain ENS registry. You cannot update them`,
        null
      )
    }

    const publicKeysExist = !!member.messagingPublicKey
    await this.companyDataAgent.update(member.staticId, data)

    const message = `${member.x500Name.O} has ${publicKeysExist ? 'updated' : 'added'} public keys`
    const notification = {
      productId: PRODUCT_ID,
      type: NOTYFICATION_TYPE,
      level: NotificationLevel.info,
      requiredPermission: {
        productId: PRODUCT_ID,
        actionId: ACTION_ID
      },
      context: {
        type: CONTEXT_TYPE,
        requestId: uuid4()
      },
      message
    }
    try {
      await this.notificationManager.createNotification(notification)
    } catch (err) {
      this.logger.warn(ErrorCode.ConnectionMicroservice, ErrorName.NotificationServiceError, err.message, {
        stacktrace: err.stack
      })
    }
  }
}
