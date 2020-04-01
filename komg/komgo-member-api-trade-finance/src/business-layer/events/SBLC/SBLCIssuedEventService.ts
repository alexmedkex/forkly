import { SBLCBaseEventService } from './SBLCBaseEventService'
import {
  IStandbyLetterOfCredit,
  StandbyLetterOfCreditStatus,
  CompanyRoles,
  StandbyLetterOfCreditTaskType
} from '@komgo/types'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { ISBLCDataAgent } from '../../../data-layer/data-agents'
import { CONFIG } from '../../../inversify/config'
import { TaskManager, NotificationManager } from '@komgo/notification-publisher'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import { ISBLCDocumentManager } from './SBLCDocumentManager'
import { DOCUMENT_TYPE } from '../../documents/documentTypes'
import { getLogger } from '@komgo/logging'

@injectable()
export class SBLCIssuedEventService extends SBLCBaseEventService {
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
      getLogger('SBLCIssuedEventService'),
      dataAgent,
      companyStaticId,
      taskManager,
      notificationManger,
      companyRegistryService,
      sblcDocumentManager,
      kapsuleBaseUrl
    )
    this.roleActions[CompanyRoles.Applicant] = this.processApplicant
    this.roleActions[CompanyRoles.IssuingBank] = this.processIssuingBank
    this.roleActions[CompanyRoles.Beneficiary] = this.processBeneficiary
  }

  async doEvent(sblc: IStandbyLetterOfCredit, decodedEvent: any, rawEvent: any) {
    this.logger.info('SBLC was issued, updating status and state history', {
      sblcStaticId: sblc.staticId
    })

    sblc.status = StandbyLetterOfCreditStatus.Issued
    if (!sblc.stateHistory) {
      sblc.stateHistory = []
    }
    sblc.stateHistory.push({
      date: new Date().toISOString(),
      fromState: StandbyLetterOfCreditStatus.Requested,
      toState: StandbyLetterOfCreditStatus.Issued,
      performer: this.companyStaticId
    })
    await this.dataAgent.update({ staticId: sblc.staticId }, sblc)
    this.logger.info('SBLC state updated', {
      sblcStaticId: sblc.staticId
    })
    await this.processPartyActions(sblc)
  }

  private async processPartyActions(sblc: IStandbyLetterOfCredit) {
    const role: CompanyRoles = this.getCompanyRole(sblc)
    this.logger.info('Retrieved company role in this SBLC', {
      sblcStaticId: sblc.staticId,
      role
    })
    if (!role) {
      this.logger.info('SBLC ISSUED event: not specific actions for this node', {
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

  private async processApplicant(sblc: IStandbyLetterOfCredit, self: any) {
    self.logger.info('Company is applicant, creating notification', {
      sblcStaticId: sblc.staticId
    })
    const issuingBankName = await self.getCompanyNameByStaticId(sblc.issuingBankId)
    const notificationMessage = `Request for SBLC [${sblc.reference}] ${
      sblc.issuingBankReference
    } accepted by ${issuingBankName}`
    await self.createNotification(sblc, notificationMessage, {}, StandbyLetterOfCreditTaskType.ReviewIssued)
  }

  private async processIssuingBank(sblc: IStandbyLetterOfCredit, self: any) {
    self.logger.info('Company is issuing bank, solving task', {
      sblcStaticId: sblc.staticId
    })

    await self.resolveTask(sblc, StandbyLetterOfCreditTaskType.ReviewRequested, true)
    if (sblc.documentHash && sblc.documentHash !== '') {
      self.logger.info('Sharing document with applicant')
      await self.sblcDocumentManager.shareDocument(sblc, DOCUMENT_TYPE.SBLC, [sblc.applicantId])
    } else {
      self.logger.info('There is no document to share for this SBLC', {
        sblcStaticId: sblc.staticId
      })
    }
  }

  private async processBeneficiary(sblc: IStandbyLetterOfCredit, self: any) {
    self.logger.info('Company is beneficiary, creating task', {
      sblcStaticId: sblc.staticId
    })
    const issuingBankName = await self.getCompanyNameByStaticId(sblc.issuingBankId)
    const taskMessage = `Request for SBLC ${sblc.reference} ${sblc.issuingBankReference} accepted by ${issuingBankName}`
    await self.createTask(
      sblc,
      taskMessage,
      StandbyLetterOfCreditTaskType.ReviewIssued,
      '[Komgo][SBLC Issued]',
      'Review SBLC Issued',
      `${self.kapsuleBaseUrl}/tasks`
    )
  }
}
