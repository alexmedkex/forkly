import { getLogger } from '@komgo/logging'
import { LCPresentationRole } from '../../LCPresentationRole'
import { ILC } from '../../../../../data-layer/models/ILC'
import { ILCPresentation } from '../../../../../data-layer/models/ILCPresentation'
import { LCPresentationContractStatus } from '../../LCPresentationContractStatus'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../../../../inversify/types'
import { LCPresentationTaskType } from '../../../../tasks/LCPresentationTaskType'
import { LCPresentationProcessorBase } from '../LCPresentationProcessorBase'
import { IDocumentServiceClient } from '../../../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../../../documents/DocumentRequestBuilder'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'
import { TaskManager } from '@komgo/notification-publisher'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'
import { ILCPresentationReviewService } from '../../../../lc-presentation/ILCPresentationReviewService'
import { LCPresentationStatus } from '@komgo/types'
import { ILCPresentationTransitionStateProcessor } from '../ILCPresentationTransitionStateProcessor'
import { TRADE_FINANCE_ACTION } from '../../../../../business-layer/tasks/permissions'

@injectable()
export class LCPresentationDiscrepantByIssuingBankProcessor extends LCPresentationProcessorBase
  implements ILCPresentationTransitionStateProcessor {
  public state = LCPresentationContractStatus.DocumentsDiscrepantByIssuingBank

  constructor(
    @inject(TYPES.DocumentServiceClient) docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) docRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.LCPresentationTaskFactory) presentationTaskFactory: ILCPresentationTaskFactory,
    @inject(TYPES.TaskManagerClient) taskManager: TaskManager,
    @inject(TYPES.LCPresentationNotificationProcessor)
    presentationNotificationProcessor: ILCPresentationNotificationProcessor,
    @inject(TYPES.LCPresentationReviewService) private readonly presentationReviewService: ILCPresentationReviewService
  ) {
    super(docServiceClient, docRequestBuilder, presentationTaskFactory, taskManager, presentationNotificationProcessor)
    this.logger = getLogger('LCPresentationDiscrepantByIssuingBankProcessor')
    this.handlers.set(LCPresentationRole.Beneficiary, this.processAsBeneficiary.bind(this))
    this.handlers.set(LCPresentationRole.IssuingBank, this.processAsIssuingBank.bind(this))
    this.handlers.set(LCPresentationRole.NominatedBank, this.processAsNominatedBank.bind(this))
  }

  async processAsBeneficiary(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    await this.createTask(
      LCPresentationTaskType.ReviewDiscrepantPresentation,
      presentation,
      lc,
      TRADE_FINANCE_ACTION.ManagePresentation
    )
  }

  async processAsIssuingBank(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    await this.resolveTask(presentation, lc, LCPresentationTaskType.ReviewPresentation, false)

    await this.presentationReviewService.sendDocumentFeedback(presentation)
  }

  async processAsNominatedBank(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    await this.sendNotif(presentation, lc, LCPresentationStatus.DocumentsDiscrepantByIssuingBank, role)
  }
}
