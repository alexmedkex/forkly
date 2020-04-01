import 'reflect-metadata'
import { injectable, inject } from 'inversify'
import {
  IStandbyLetterOfCredit,
  StandbyLetterOfCreditStatus,
  CompanyRoles,
  StandbyLetterOfCreditTaskType
} from '@komgo/types'
import { ISBLCCreatedEvent } from './ISBLCCreatedEvent'
import { SBLCBaseEventService } from './SBLCBaseEventService'
import { NotificationManager, TaskManager } from '@komgo/notification-publisher'
import { ISBLCDataAgent } from '../../../data-layer/data-agents'
import { TYPES } from '../../../inversify/types'
import { CONFIG } from '../../../inversify/config'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import { ISBLCDocumentManager } from './SBLCDocumentManager'
import { getLogger } from '@komgo/logging'

const pako = require('pako')
const web3Utils = require('web3-utils')

@injectable()
export class SBLCCreatedService extends SBLCBaseEventService {
  private roleActions = {}

  constructor(
    @inject(TYPES.SBLCDataAgent) dataAgent: ISBLCDataAgent,
    @inject(CONFIG.CompanyStaticId) companyStaticId: string,
    @inject(TYPES.TaskManagerClient) taskManager: TaskManager,
    @inject(TYPES.NotificationManagerClient) notificationManger: NotificationManager,
    @inject(TYPES.CompanyRegistryService) companyRegistryService: ICompanyRegistryService,
    @inject(TYPES.SBLCDocumentManager) protected readonly sblcDocumentManager: ISBLCDocumentManager,
    @inject(CONFIG.KapsuleUrl) protected readonly kapsuleBaseUrl: string
  ) {
    super(
      getLogger('SBLCCreatedService'),
      dataAgent,
      companyStaticId,
      taskManager,
      notificationManger,
      companyRegistryService,
      sblcDocumentManager,
      kapsuleBaseUrl
    )
    this.roleActions[CompanyRoles.IssuingBank] = this.processIssuingBank
    this.roleActions[CompanyRoles.Beneficiary] = this.processBeneficiary
  }

  async doEvent(sblc: IStandbyLetterOfCredit, decodedEvent: ISBLCCreatedEvent, rawEvent: any) {
    this.logger.info('Processing SBLCCreated decodedEvent')
    const contractAddress = web3Utils.toChecksumAddress(rawEvent.address)
    const transactionHash = rawEvent.transactionHash
    let sblcDataObject: IStandbyLetterOfCredit
    try {
      this.logger.info('Parsing SBLCCreated event data')
      const data = pako.inflate(decodedEvent.data, { to: 'string' })
      sblcDataObject = JSON.parse(data)
      sblcDataObject.status = StandbyLetterOfCreditStatus.Requested

      this.logger.info(`About to update SBLC in local cache', with address=${contractAddress}}`, {
        SBLCAddress: contractAddress,
        transactionHash
      })
      await this.dataAgent.update(
        { staticId: sblcDataObject.staticId },
        {
          ...sblcDataObject,
          transactionHash,
          contractAddress
        }
      )
    } catch (error) {
      return
    }
    await this.processPartyActions(sblcDataObject)
  }

  private async processPartyActions(sblc: IStandbyLetterOfCredit) {
    const role: CompanyRoles = this.getCompanyRole(sblc)
    this.logger.info('Retrieved company role in this SBLC', {
      sblcStaticId: sblc.staticId,
      role
    })
    if (!role) {
      this.logger.info('SBLCCreated event: not specific actions for this node', {
        sblcStaticId: sblc.staticId,
        companyStaticId: this.companyStaticId,
        role
      })
      return
    }
    this.logger.info('Checking if there is some action for this role')
    const partyAction = this.roleActions[role]
    this.logger.info('Action for this role:', {
      partyAction
    })
    if (!partyAction) {
      this.logger.info('No action has to be performed by this party', {
        sblcStaticId: sblc.staticId,
        companyStaticId: this.companyStaticId,
        role
      })
      return
    }
    await partyAction(sblc, this)
  }

  private async processIssuingBank(sblc: IStandbyLetterOfCredit, self: any) {
    self.logger.info('Company is issuing bank, creating task', {
      sblcStaticId: sblc.staticId,
      companyId: self.companyStaticId
    })
    const applicantName = await self.getCompanyNameByStaticId(sblc.applicantId)
    await self.createTask(
      sblc,
      `SBLC [${sblc.reference}] has been requested by ${applicantName}`,
      StandbyLetterOfCreditTaskType.ReviewRequested,
      '[Komgo][SBLC Requested]',
      'Review SBLC Request',
      `${self.kapsuleBaseUrl}/tasks`
    )
  }

  private async processBeneficiary(sblc: IStandbyLetterOfCredit, self: any) {
    self.logger.info('Company is beneficiary, creating notification', {
      sblcStaticId: sblc.staticId,
      companyId: self.companyStaticId
    })
    const applicantName = await self.getCompanyNameByStaticId(sblc.applicantId)
    // no need to check if beneficiary is a Komgo member or not, if this code is running, it means it is a Komgo member
    await self.createNotification(
      sblc,
      `SBLC [${sblc.reference}] has been requested by ${applicantName}`,
      {},
      StandbyLetterOfCreditTaskType.ReviewRequested
    )
  }
}
