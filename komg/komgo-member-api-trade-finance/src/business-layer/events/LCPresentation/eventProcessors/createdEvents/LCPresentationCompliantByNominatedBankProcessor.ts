import { getLogger } from '@komgo/logging'
import { LCPresentationRole } from '../../LCPresentationRole'
import { ILC } from '../../../../../data-layer/models/ILC'
import { ILCPresentation } from '../../../../../data-layer/models/ILCPresentation'
import { LCPresentationContractStatus } from '../../LCPresentationContractStatus'
import { injectable, inject } from 'inversify'
import { ILCPresentationCreatedProcessor } from '../ILCPresentationCreatedProcessor'
import { TYPES } from '../../../../../inversify/types'
import { LCPresentationTaskType } from '../../../../tasks/LCPresentationTaskType'
import { LCPresentationProcessorBase } from '../LCPresentationProcessorBase'
import { IDocumentServiceClient } from '../../../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../../../documents/DocumentRequestBuilder'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'
import { TaskManager } from '@komgo/notification-publisher'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'
import { LCPresentationStatus } from '@komgo/types'
import { TRADE_FINANCE_ACTION } from '../../../../../business-layer/tasks/permissions'

@injectable()
export class LCPresentationCompliantByNominatedBankProcessor extends LCPresentationProcessorBase
  implements ILCPresentationCreatedProcessor {
  public state = LCPresentationContractStatus.DocumentsCompliantByNominatedBank
  readonly createdDocumentsCompliantByNominatedBank = 'Created as DocumentsCompliantByNominatedBank'

  constructor(
    @inject(TYPES.DocumentServiceClient) docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) docRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.LCPresentationTaskFactory) presentationTaskFactory: ILCPresentationTaskFactory,
    @inject(TYPES.TaskManagerClient) taskManager: TaskManager,
    @inject(TYPES.LCPresentationNotificationProcessor)
    presentationNotificationProcessor: ILCPresentationNotificationProcessor
  ) {
    super(docServiceClient, docRequestBuilder, presentationTaskFactory, taskManager, presentationNotificationProcessor)
    this.logger = getLogger('LCPresentationCompliantByNominatedBankProcessor')
    this.handlers.set(LCPresentationRole.Beneficiary, this.processAsBeneficiary.bind(this))
    this.handlers.set(LCPresentationRole.NominatedBank, this.processAsNominatedBank.bind(this))
    this.handlers.set(LCPresentationRole.IssuingBank, this.processAsIssuingBank.bind(this))
  }

  async processAsBeneficiary(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    this.logger.info('Processing as Beneficiary')
    this.logger.info(this.createdDocumentsCompliantByNominatedBank, {
      lcid: lc && lc._id ? lc._id.toString() : null,
      presentationId: presentation ? presentation.staticId : null
    })
    await this.sendPresentationDocuments(presentation, [presentation.applicantId, presentation.issuingBankId])
    await this.sendNotif(presentation, lc, LCPresentationStatus.DocumentsCompliantByNominatedBank, role)
  }

  async processAsNominatedBank(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    this.logger.info('Processing as NominatedBank')
    this.logger.info(this.createdDocumentsCompliantByNominatedBank, {
      lcid: lc && lc._id ? lc._id.toString() : null,
      presentationId: presentation ? presentation.staticId : null
    })
    await this.resolveTask(presentation, lc, LCPresentationTaskType.ReviewPresentation, true)
  }

  async processAsIssuingBank(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    this.logger.info('Processing as IssuingBank')
    this.logger.info(this.createdDocumentsCompliantByNominatedBank, {
      lcid: lc && lc._id ? lc._id.toString() : null,
      presentationId: presentation ? presentation.staticId : null
    })
    await this.createTask(
      LCPresentationTaskType.ReviewPresentation,
      presentation,
      lc,
      TRADE_FINANCE_ACTION.ReviewPresentation
    )
  }
}
