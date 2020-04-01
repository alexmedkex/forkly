import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IMessagePublisher } from '@komgo/messaging-library'
import { ErrorUtils, requestStorageInstance } from '@komgo/microservice-config'
import { NotificationManager } from '@komgo/notification-publisher'
import {
  Status,
  IActivateCompanyRequest,
  ICompanyRequest,
  IBottomSheetId,
  IUpdateBottomSheet,
  MemberType
} from '@komgo/types'
import * as EmailValidator from 'email-validator'
import { Body, Controller, Delete, Get, Header, Patch, Path, Post, Put, Route, Security, Tags } from 'tsoa'

import { ENSCompanyOnboarder } from '../../business-layer/onboard-member-ens/ENSCompanyOnboarder'
import {
  IUpdateCompany,
  IOnboardedCompany,
  IUpdateCompanyInfo
} from '../../business-layer/onboard-member-ens/interfaces'
import { ICompanyDataAgent, ICompanyProperties } from '../../data-layer/data-agent/CompanyDataAgent'
import { Company } from '../../data-layer/models/Company'
import ICompanyDocument from '../../data-layer/models/ICompanyDocument'
import { ICompanyRegistryService } from '../../infrastructure/api-registry/CompanyRegistryService'
import { IAPIRegistryCompany } from '../../infrastructure/api-registry/IAPIRegistryCompany'
import { RequiredUserActions } from '../../infrastructure/api-users/RequiredUserActions'
import { IUsersService } from '../../infrastructure/api-users/UsersService'
import ICommonMessagingService from '../../infrastructure/common-broker/ICommonMessagingService'
import { IHarborService } from '../../infrastructure/harbor/HarborService'
import { ICompanyModel } from '../../interfaces'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ActionType } from '../../utils/ActionType'
import { ErrorName } from '../../utils/ErrorName'
import generatePw from '../../utils/generatePw'
import getUserId from '../../utils/getUserId'
import isSMS from '../../utils/isSMS'

const STATUS_CODE_NOT_FOUND = 404

/**
 * Companies Class
 *
 * @export
 * @class CompaniesController
 * @extends {Controller}
 */
@Tags('Companies')
@Route('companies')
@provideSingleton(CompaniesController)
export class CompaniesController extends Controller {
  private logger = getLogger('CompaniesController')

  constructor(
    @inject(TYPES.CompanyDataAgent)
    private readonly companyDataAgent: ICompanyDataAgent,
    @inject(TYPES.HarborService) private readonly harborService: IHarborService,
    @inject(TYPES.UsersService) private readonly usersService: IUsersService,
    @inject(TYPES.CommonMessagingService) private readonly commonMessagingService: ICommonMessagingService,
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistryService: ICompanyRegistryService,
    @inject(TYPES.NotificationManager) protected readonly notificationManager: NotificationManager,
    @inject(ENSCompanyOnboarder) protected readonly ensOnboarder: ENSCompanyOnboarder,
    @inject(TYPES.MessagePublisher) private readonly messagePublisher: IMessagePublisher
  ) {
    super()
  }

  /**
   * @summary get companies
   */
  @Security('withPermission', ['administration', 'onboard', 'registerNonMembers'])
  @Get()
  public async getCompanies(): Promise<ICompanyModel[]> {
    return this.companyDataAgent.getCompanies({ isDeactivated: { $ne: true } })
  }

  /**
   * @summary create company
   */
  @Security('withPermission', ['administration', 'onboard', 'registerNonMembers'])
  @Post()
  public async createCompany(@Body() data: ICompanyRequest): Promise<ICompanyModel> {
    if (data.memberType && !isSMS(data.memberType)) {
      throw ErrorUtils.notImplementedException(
        ErrorCode.ValidationInvalidOperation,
        'Onboarding of FMS, LMS nodes is not implemented'
      )
    }
    return this.companyDataAgent.createCompany(data)
  }

  /**
   * @summary get company
   */
  @Security('withPermission', ['administration', 'onboard', 'registerNonMembers'])
  @Get('{staticId}')
  public async getCompany(@Path() staticId: string): Promise<ICompanyModel> {
    return this.companyDataAgent.getCompany(staticId)
  }

  /**
   * @summary generate member package
   * @description creates member node account and harbor account
   */
  @Security('withPermission', ['administration', 'onboard', 'registerAndOnboardAnyMember'])
  @Post('{staticId}/member-package')
  public async generateMemberPackage(@Path() staticId: string): Promise<ICompanyModel> {
    const member = await this.getMember(staticId)
    const email = member.companyAdminEmail ? member.companyAdminEmail.toLowerCase() : ''

    if (member.isMember === true && isSMS(member.memberType) && !EmailValidator.validate(email)) {
      const errorMessage = 'Invalid company admin email'
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, errorMessage, {
        companyAdminEmail: [errorMessage]
      })
    }

    this.ensureStatus(member.status, Status.Draft)

    const commonMQCredentials = {
      rabbitMQCommonUser: `${member.komgoMnid}-USER`,
      rabbitMQCommonPassword: generatePw()
    }

    // generate Harbor credentials only for SMS members
    const harborCredentials = isSMS(member.memberType)
      ? await this.harborService.createUser(member.companyAdminEmail, member.x500Name.O, member.staticId)
      : {}

    const userProfile = await this.usersService.createMemberNodeAccount({
      username: email,
      firstName: member.x500Name.O,
      lastName: '(Service account)',
      email,
      // if it's SMS member, set required actions UPDATE_PASSWORD and VERIFY_EMAIL
      // in order to trigger email with reset password link
      requiredActions: isSMS(member.memberType)
        ? [RequiredUserActions.UPDATE_PASSWORD, RequiredUserActions.VERIFY_EMAIL]
        : []
    })

    return this.companyDataAgent.update(staticId, {
      ...commonMQCredentials,
      ...harborCredentials,
      keycloakUserId: userProfile.id
    })
  }

  /**
   * @summary add company to ENS
   */
  @Security('withPermission', ['administration', 'onboard', 'registerAnyMember'])
  @Put('{staticId}/ens')
  public async addCompanyToENS(
    @Header('Authorization') token: string,
    @Path() staticId: string,
    @Body() data: IBottomSheetId
  ): Promise<void> {
    const userId = getUserId(token)
    this.onboardCompany(userId, staticId, data.bottomsheetId)
  }

  /**
   * @summary configure Common MQ for a new company
   */
  @Security('withPermission', ['administration', 'onboard', 'registerAnyMember'])
  @Post('{staticId}/configure-mq')
  public async configureMQRoute(
    @Header('Authorization') token: string,
    @Path() staticId: string,
    @Body() data: IBottomSheetId
  ): Promise<void> {
    const userId = getUserId(token)
    const member = await this.getMember(staticId)
    this.ensureStatus(member.status, Status.Ready)
    this.configureMQ(userId, staticId, data.bottomsheetId, member)
  }

  /**
   * @summary activate/deactivate company
   */
  @Security('withPermission', ['administration', 'onboard', 'registerAnyMember'])
  @Patch('{staticId}/is-active')
  public async activateCompany(@Path() staticId: string, @Body() data: IActivateCompanyRequest): Promise<void> {
    const companyFromENS = await this.findCompanyInENS(staticId)
    if (!companyFromENS) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Company not found')
    }
    await this.ensOnboarder.setDeactivated(staticId, data.active)

    const companyFromDb = await this.findCompanyInDb(staticId)
    if (companyFromDb) {
      await this.companyDataAgent.update(staticId, { isDeactivated: !data.active })
    }
  }

  /**
   * @summary update company in the DB and ENS (if it's registered)
   */
  @Security('withPermission', ['administration', 'onboard', 'registerAnyMember'])
  @Patch('{staticId}')
  public async updateCompany(
    @Header('Authorization') token: string,
    @Path() staticId: string,
    @Body() data: IUpdateCompany
  ): Promise<void> {
    const companyFromDb = await this.findCompanyInDb(staticId)
    const companyFromENS = await this.findCompanyInENS(staticId)
    const updates = {
      x500Name: data.x500Name,
      hasSWIFTKey: data.hasSWIFTKey,
      isFinancialInstitution: data.isFinancialInstitution,
      isMember: data.isMember,
      companyAdminEmail: data.companyAdminEmail,
      memberType: data.memberType,
      vakt: data.vakt
    }

    if (!companyFromDb && !companyFromENS) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Company not found')
    }

    if (companyFromDb) {
      await this.validateChanges(companyFromDb, updates)
    }

    if (companyFromENS) {
      this.throwIfChangingMemberType(data, companyFromENS)
    }

    const userId = getUserId(token)
    this.update(companyFromENS, data, companyFromDb, staticId, updates, data.bottomsheetId, userId)
  }

  /**
   * @summary delete company from the DB (used in E2E tests only). This endpoint doesn't delete company in ENS!
   */
  @Security('withPermission', ['administration', 'onboard', 'registerAnyMember'])
  @Delete('{staticId}/')
  public async deleteCompany(@Path() staticId: string): Promise<void> {
    const company = await this.companyDataAgent.getCompany(staticId)
    const allowedStatuses = [Status.Draft, Status.Onboarded, Status.Registered]
    if (
      allowedStatuses.indexOf(company.status) > -1 ||
      (company.status === Status.Ready && company.isMember === false)
    ) {
      await this.companyDataAgent.deleteCompany(staticId)
    } else {
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpContent,
        'Only members with status Draft or non-members with status Ready can be deleted',
        null
      )
    }
  }

  private async validateChanges(companyFromDb: ICompanyModel, updates: ICompanyProperties): Promise<void> {
    const updatedCompany = new Company({ ...companyFromDb, ...updates })
    await updatedCompany.validate()
  }

  /**
   * Returns an object with an updated properties of a company
   */
  private prepareNewCompanyObject(data: ICompanyRequest, companyFromENS: IAPIRegistryCompany): IUpdateCompanyInfo {
    const company: IUpdateCompanyInfo = {
      ...companyFromENS,
      x500Name: {
        ...data.x500Name,
        CN: data.x500Name.O // make sure CN is the same as O
      },
      hasSWIFTKey: data.hasSWIFTKey,
      isFinancialInstitution: data.isFinancialInstitution,
      memberType: data.memberType || MemberType.Empty
    }
    if (data.vakt) {
      company.vakt = {
        staticId: data.vakt.staticId,
        mnid: data.vakt.mnid,
        messagingPublicKey: data.vakt.messagingPublicKey
      }
    }
    return company
  }

  private throwIfChangingMemberType(data: ICompanyRequest, companyFromENS: IAPIRegistryCompany): void {
    if (data.isMember !== companyFromENS.isMember) {
      throw ErrorUtils.notImplementedException(
        ErrorCode.ValidationInvalidOperation,
        'Changing membership for a registered company is not supported'
      )
    }
  }

  private async findCompanyInDb(staticId: string): Promise<ICompanyModel | null> {
    try {
      const company = await this.companyDataAgent.getCompany(staticId)
      return company.toJSON()
    } catch (e) {
      if (e.status === STATUS_CODE_NOT_FOUND) {
        return null
      } else {
        throw e
      }
    }
  }

  private async findCompanyInENS(staticId: string): Promise<IAPIRegistryCompany | null> {
    try {
      return await this.companyRegistryService.getCompany(staticId)
    } catch (e) {
      if (e.status === STATUS_CODE_NOT_FOUND) {
        return null
      } else {
        throw e
      }
    }
  }

  private async getMember(staticId: string): Promise<ICompanyModel> {
    const member = await this.companyDataAgent.getCompany(staticId)
    if (!member.isMember) {
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpContent,
        `Company "${member.x500Name.O}" is not a member`,
        null
      )
    }

    return member
  }

  /**
   * Throws an HTTP exception if company status doesn't match expected status
   */
  private ensureStatus(actualStatus: Status, expectedStatus: Status): void {
    if (actualStatus !== expectedStatus) {
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpContent,
        `This operation is not allowed. Company status: ${actualStatus}. Expected status: ${expectedStatus}`,
        null
      )
    }
  }

  private async onboardCompany(userId: string, staticId: string, bottomsheetId: string) {
    const company = await this.companyDataAgent.getCompany(staticId)
    try {
      this.ensureStatus(company.status, Status.Ready)
      await this.ensOnboarder.onboard(company.toJSON())
      const updatedCompany: IOnboardedCompany = await this.companyDataAgent.update(staticId, { addedToENS: true })
      this.updateBottomSheet({
        bottomsheetId,
        staticId,
        userId,
        displayStatus: updatedCompany.isMember ? 'onboarded' : 'registered'
      })
      this.publishWSMessage(updatedCompany, userId, ActionType.ADD_COMPANY_TO_ENS_SUCCESS)
    } catch (error) {
      this.updateBottomSheet({ bottomsheetId, staticId, userId, error, errorName: ErrorName.OnboardFailed })
    }
  }

  private async configureMQ(userId: string, staticId: string, bottomsheetId: string, member: ICompanyModel) {
    try {
      await this.commonMessagingService.configure(
        member.komgoMnid,
        member.rabbitMQCommonUser,
        member.rabbitMQCommonPassword
      )
      const updatedCompany: ICompanyDocument = await this.companyDataAgent.update(staticId, { addedToMQ: true })
      this.updateBottomSheet({ bottomsheetId, staticId, userId, displayStatus: 'configured' })
      this.publishWSMessage(updatedCompany, userId, ActionType.CONFIGURE_MQ_SUCCESS)
    } catch (error) {
      this.updateBottomSheet({ bottomsheetId, staticId, userId, error, errorName: ErrorName.ConfigureFailed })
    }
  }

  private async update(
    companyFromENS,
    data: ICompanyRequest,
    companyFromDb: ICompanyModel | null,
    staticId: string,
    updates: ICompanyProperties,
    bottomsheetId: string,
    userId: string
  ): Promise<void> {
    try {
      let newCompany: IUpdateCompanyInfo
      if (companyFromENS) {
        newCompany = this.prepareNewCompanyObject(data, companyFromENS)
        this.logger.info(`Company ${staticId} was found in ENS. Updating...`)
        await this.ensOnboarder.update(newCompany, companyFromENS)
      }

      let updatedCompanyInDb: ICompanyDocument
      if (companyFromDb) {
        this.logger.info(`Company ${staticId} was found in the DB. Updating...`)
        updatedCompanyInDb = await this.companyDataAgent.update(staticId, updates)
        newCompany = updatedCompanyInDb ? updatedCompanyInDb.toJSON() : newCompany
      }
      this.updateBottomSheet({ bottomsheetId, staticId, userId, displayStatus: 'updated' })
      this.publishWSMessage(newCompany, userId, ActionType.UPDATE_COMPANY_SUCCESS)
    } catch (error) {
      this.updateBottomSheet({ bottomsheetId, staticId, userId, error, errorName: ErrorName.UpdateFailed })
    }
  }

  private updateBottomSheet(params: IUpdateBottomSheet): void {
    const { bottomsheetId, staticId, userId, displayStatus, error, errorName } = params
    const actionType = '@@btsh/UPDATE_BOTTOMSHEET_ITEM'
    if (error) {
      this.logger.error(ErrorCode.Connection, errorName, error.message, {
        companyStaticId: staticId,
        stacktrace: error.stack
      })
    }
    this.publishWSMessage(
      {
        id: bottomsheetId,
        name: staticId,
        state: error ? 'FAILED' : 'REGISTERED',
        displayStatus
      },
      userId,
      actionType
    )
  }

  private async publishWSMessage(payload, userId: string, actionType: string): Promise<void> {
    const requestId = requestStorageInstance.get('requestId')
    try {
      await this.messagePublisher.publish(
        'INTERNAL.WS.action',
        {
          recipient: userId,
          type: actionType,
          version: '1',
          payload
        },
        { requestId }
      )
    } catch (e) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.PublishMessageFailed, e.message, {
        payload,
        stacktrace: e.stack
      })
    }
  }
}
