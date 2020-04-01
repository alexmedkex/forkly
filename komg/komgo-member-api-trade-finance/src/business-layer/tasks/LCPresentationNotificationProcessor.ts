import { ILC } from '../../data-layer/models/ILC'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { LCPresentationStatus } from '@komgo/types'
import { LCPresentationRole } from '../events/LCPresentation/LCPresentationRole'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../inversify/types'
import { NotificationManager, NotificationLevel, INotificationCreateRequest } from '@komgo/notification-publisher'
import * as _ from 'lodash'
import { getLogger } from '@komgo/logging'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { TRADE_FINANCE_ACTION } from './permissions'
import { DOCUMENT_PRODUCT } from '../documents/documentTypes'
import { CONFIG } from '../../inversify/config'

export interface ILCPresentationNotificationProcessor {
  sendStateUpdatedNotification(
    presentation: ILCPresentation,
    lc: ILC,
    state: LCPresentationStatus,
    role: LCPresentationRole
  )
}

@injectable()
export class LCPresentationNotificationProcessor implements ILCPresentationNotificationProcessor {
  private logger = getLogger('LCPresentationTaskProcessor')

  constructor(
    @inject(CONFIG.CompanyStaticId) private readonly companyId: string,
    @inject(TYPES.NotificationManagerClient) private readonly notificationManger: NotificationManager,
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistryService: ICompanyRegistryService
  ) {}

  public async sendStateUpdatedNotification(
    presentation: ILCPresentation,
    lc: ILC,
    state: LCPresentationStatus,
    role: LCPresentationRole
  ) {
    const presentationContext = this.getPresentationMetaData(presentation, lc, role)
    try {
      this.logger.info('Sending notification', presentationContext)
      const notification = await this.getStateUpdateNotification(
        presentation,
        lc,
        state,
        await this.getCompanyName(this.companyId),
        this.getActionId(role)
      )
      return this.notificationManger.createNotification(notification)
    } catch (err) {
      this.logger.info('Error sending notification', {
        message: err.message,
        ...presentationContext
      })
      throw new Error('Error sending notification')
      // do nothing, do not fail if just nofication fails
    }
  }

  private async getStateUpdateNotification(
    presentation: ILCPresentation,
    lc: ILC,
    status: LCPresentationStatus,
    performerName: string,
    actionId: TRADE_FINANCE_ACTION = TRADE_FINANCE_ACTION.ManagePresentation
  ): Promise<INotificationCreateRequest> {
    return {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      type: 'LCPresentation.info',
      requiredPermission: {
        productId: DOCUMENT_PRODUCT.TradeFinance,
        actionId
      },
      context: {
        presentationId: presentation ? presentation.staticId : null,
        lcid: lc._id.toString()
      },
      message: await this.getStatusChangeMessage(presentation, status, performerName),
      level: NotificationLevel.info
    }
  }

  private async getStatusChangeMessage(
    presentation: ILCPresentation,
    status: LCPresentationStatus,
    performerName: string
  ) {
    switch (status) {
      case LCPresentationStatus.DocumentsCompliantByNominatedBank:
        return `LC presentation ${
          presentation.reference
        } has been marked compliant by nominated bank ${await this.getCompanyName(presentation.nominatedBankId)}`
      case LCPresentationStatus.DocumentsCompliantByIssuingBank:
        return `LC presentation ${presentation.reference} has been marked compliant by ${await this.getCompanyName(
          presentation.issuingBankId
        )}`
      case LCPresentationStatus.DocumentsDiscrepantByIssuingBank:
        return `LC presentation ${presentation.reference} has been marked as discrepant by ${await this.getCompanyName(
          presentation.issuingBankId
        )}`
      case LCPresentationStatus.DocumentsDiscrepantByNominatedBank:
        return `LC presentation ${presentation.reference} has been marked as discrepant by ${await this.getCompanyName(
          presentation.nominatedBankId
        )}`
      case LCPresentationStatus.DocumentsReleasedToApplicant:
        return `LC presentation ${
          presentation.reference
        } documents have been released to applicant by ${await this.getCompanyName(presentation.issuingBankId)}`
      default:
        return this.getStatusChangeMessageAdvisingDiscrepancies(presentation, status, performerName)
    }
  }

  private async getStatusChangeMessageAdvisingDiscrepancies(
    presentation: ILCPresentation,
    status: LCPresentationStatus,
    performerName: string
  ) {
    switch (status) {
      case LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank:
        return `Documents discrepancies for presentation ${
          presentation.reference
        } has been advised by ${await this.getCompanyName(presentation.nominatedBankId)}`
      case LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank:
        return `Documents discrepancies for presentation ${
          presentation.reference
        } has been advised by ${await this.getCompanyName(presentation.issuingBankId)}`

      case LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank:
        return `Documents discrepancies for presentation ${
          presentation.reference
        } has been accepted by ${await this.getCompanyName(presentation.issuingBankId)}`
      case LCPresentationStatus.DiscrepanciesRejectedByIssuingBank:
        return `Documents discrepancies for presentation ${
          presentation.reference
        } has been rejected by ${await this.getCompanyName(presentation.issuingBankId)}`
      case LCPresentationStatus.DocumentsAcceptedByApplicant:
        return `Documents for presentation ${presentation.reference} has been accepted by ${await this.getCompanyName(
          presentation.applicantId
        )}`
      case LCPresentationStatus.DiscrepanciesRejectedByApplicant:
        return `Documents discrepancies for presentation ${
          presentation.reference
        } has been rejected by ${await this.getCompanyName(presentation.applicantId)}`
      default:
        return `LC presentation ${presentation.reference} changed status to ${status} by ${performerName}`
    }
  }

  private getPresentationMetaData(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    return {
      lcPresentationStaticId: presentation ? presentation.staticId : null,
      lcid: lc && lc._id ? lc._id.toString() : null,
      companyRole: role
    }
  }

  private async getCompanyName(companyId: string) {
    const response = await this.companyRegistryService.getMember(companyId)
    const company = response && response.data ? response.data[0] : null

    return company ? company.x500Name.CN : ''
  }

  private getActionId(role: LCPresentationRole): TRADE_FINANCE_ACTION {
    if (role === LCPresentationRole.Applicant || role === LCPresentationRole.Beneficiary) {
      return TRADE_FINANCE_ACTION.ManagePresentation
    }

    return TRADE_FINANCE_ACTION.ReviewPresentation
  }
}
