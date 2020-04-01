import { getLogger } from '@komgo/logging'
import { LCPresentationRole } from '../../LCPresentationRole'
import { ILC } from '../../../../../data-layer/models/ILC'
import { ILCPresentation } from '../../../../../data-layer/models/ILCPresentation'
import { LCPresentationContractStatus } from '../../LCPresentationContractStatus'
import { injectable, inject } from 'inversify'
import { ILCPresentationCreatedProcessor } from '../ILCPresentationCreatedProcessor'
import { TYPES } from '../../../../../inversify/types'

import { LCPresentationProcessorBase } from '../LCPresentationProcessorBase'
import { IDocumentServiceClient } from '../../../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../../../documents/DocumentRequestBuilder'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'
import { TaskManager } from '@komgo/notification-publisher'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'
import { LCPresentationStatus } from '@komgo/types'
import { LCPresentationTaskType } from '../../../../tasks/LCPresentationTaskType'
import { TRADE_FINANCE_ACTION } from '../../../../../business-layer/tasks/permissions'

@injectable()
export class LCPresentationReleasedToApplicantProcessor extends LCPresentationProcessorBase
  implements ILCPresentationCreatedProcessor {
  public state = LCPresentationContractStatus.DocumentsReleasedToApplicant
  readonly createdDocumentsReleasedToApplicant = 'Created as DocumentsReleasedToApplicant'

  constructor(
    @inject(TYPES.DocumentServiceClient) docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) docRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.LCPresentationTaskFactory) presentationTaskFactory: ILCPresentationTaskFactory,
    @inject(TYPES.TaskManagerClient) taskManager: TaskManager,
    @inject(TYPES.LCPresentationNotificationProcessor)
    presentationNotificationProcessor: ILCPresentationNotificationProcessor
  ) {
    super(docServiceClient, docRequestBuilder, presentationTaskFactory, taskManager, presentationNotificationProcessor)
    this.logger = getLogger('LCPresentationReleasedToApplicantProcessor')
    this.handlers.set(LCPresentationRole.Beneficiary, this.processAsBeneficiary.bind(this))
    this.handlers.set(LCPresentationRole.Applicant, this.processAsApplicant.bind(this))
    this.handlers.set(LCPresentationRole.IssuingBank, this.processIssuingBank.bind(this))
  }

  async processAsBeneficiary(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    this.logger.info('Processing as Beneficiary')
    this.logger.info(this.createdDocumentsReleasedToApplicant, {
      lcid: lc && lc._id ? lc._id.toString() : null,
      presentationId: presentation ? presentation.staticId : null
    })
    if (
      presentation &&
      presentation.stateHistory &&
      presentation.stateHistory.every(state => state.toState !== LCPresentationStatus.DocumentsCompliantByNominatedBank)
    ) {
      this.logger.info('Send document to applicant')
      await this.sendPresentationDocuments(presentation, [presentation.applicantId])
    }
    await this.sendNotif(presentation, lc, LCPresentationStatus.DocumentsReleasedToApplicant, role)
  }

  async processAsApplicant(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    this.logger.info('Processing as Applicant')
    this.logger.info(this.createdDocumentsReleasedToApplicant, {
      lcid: lc && lc._id ? lc._id.toString() : null,
      presentationId: presentation ? presentation.staticId : null
    })
    await this.createTask(
      LCPresentationTaskType.ViewPresentedDocuments,
      presentation,
      lc,
      TRADE_FINANCE_ACTION.ManagePresentation
    )
  }

  async processIssuingBank(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    this.logger.info('Processing as IssuingBank')
    this.logger.info(this.createdDocumentsReleasedToApplicant, {
      lcid: lc && lc._id ? lc._id.toString() : null,
      presentationId: presentation ? presentation.staticId : null
    })
    await this.resolveTask(presentation, lc, LCPresentationTaskType.ReviewPresentation, true)
  }
}
