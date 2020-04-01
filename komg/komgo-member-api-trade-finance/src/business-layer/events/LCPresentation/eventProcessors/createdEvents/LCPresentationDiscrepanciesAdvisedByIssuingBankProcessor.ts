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
import { TRADE_FINANCE_ACTION } from '../../../../../business-layer/tasks/permissions'

@injectable()
export class LCPresentationDiscrepanciesAdvisedByIssuingBankProcessor extends LCPresentationProcessorBase
  implements ILCPresentationCreatedProcessor {
  public state = LCPresentationContractStatus.DiscrepanciesAdvisedByIssuingBank

  constructor(
    @inject(TYPES.DocumentServiceClient) docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) docRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.LCPresentationTaskFactory) presentationTaskFactory: ILCPresentationTaskFactory,
    @inject(TYPES.TaskManagerClient) taskManager: TaskManager,
    @inject(TYPES.LCPresentationNotificationProcessor)
    presentationNotificationProcessor: ILCPresentationNotificationProcessor
  ) {
    super(docServiceClient, docRequestBuilder, presentationTaskFactory, taskManager, presentationNotificationProcessor)
    this.logger = getLogger('LCPresentationDiscrepanciesAdvisedByIssuingBankProcessor')
    this.handlers.set(LCPresentationRole.Applicant, this.processAsApplicant.bind(this))
  }

  async processAsApplicant(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    await this.createTask(
      LCPresentationTaskType.ReviewPresentationDiscrepancies,
      presentation,
      lc,
      TRADE_FINANCE_ACTION.ManagePresentation
    )
  }
}
