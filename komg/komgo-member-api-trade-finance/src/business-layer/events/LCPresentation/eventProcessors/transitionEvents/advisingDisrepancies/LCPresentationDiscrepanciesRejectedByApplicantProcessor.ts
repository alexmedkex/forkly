import { ILCPresentationTransitionStateProcessor } from '../../ILCPresentationTransitionStateProcessor'
import { ILCPresentationActionPerformer } from '../../ILCPresentationActionPerformer'
import { LCPresentationRole } from '../../../LCPresentationRole'
import { ILC } from '../../../../../../data-layer/models/ILC'
import { ILCPresentation } from '../../../../../../data-layer/models/ILCPresentation'
import { LCPresentationContractStatus } from '../../../LCPresentationContractStatus'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../../../../../inversify/types'
import { ILCPresentationTransactionManager } from '../../../../../blockchain/LCPresentationTransactionManager'
import { LCPresentationProcessorBase } from '../../LCPresentationProcessorBase'
import { IDocumentServiceClient } from '../../../../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../../../../documents/DocumentRequestBuilder'
import { ILCPresentationTaskFactory } from '../../../../../tasks/LCPresentationTaskFactory'
import { TaskManager } from '@komgo/notification-publisher'
import { ILCPresentationNotificationProcessor } from '../../../../../tasks/LCPresentationNotificationProcessor'
import { LCPresentationTaskType } from '../../../../../tasks/LCPresentationTaskType'
import { LCPresentationStatus } from '@komgo/types'

@injectable()
export class LCPresentationDiscrepanciesRejectedByApplicantProcessor extends LCPresentationProcessorBase
  implements ILCPresentationTransitionStateProcessor {
  public state = LCPresentationContractStatus.DiscrepanciesRejectedByApplicant

  private presentationStatus = LCPresentationStatus.DiscrepanciesRejectedByApplicant

  constructor(
    @inject(TYPES.DocumentServiceClient) docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) docRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.LCPresentationTaskFactory) presentationTaskFactory: ILCPresentationTaskFactory,
    @inject(TYPES.TaskManagerClient) taskManager: TaskManager,
    @inject(TYPES.LCPresentationNotificationProcessor)
    presentationNotificationProcessor: ILCPresentationNotificationProcessor,
    @inject(TYPES.LCPresentationTransactionManager) private transactionManager: ILCPresentationTransactionManager
  ) {
    super(docServiceClient, docRequestBuilder, presentationTaskFactory, taskManager, presentationNotificationProcessor)

    this.handlers.set(LCPresentationRole.Applicant, this.processAsApplicant.bind(this))
    this.handlers.set(LCPresentationRole.IssuingBank, this.notifyStateChange.bind(this))
    this.handlers.set(LCPresentationRole.Beneficiary, this.notifyStateChange.bind(this))
    this.handlers.set(LCPresentationRole.NominatedBank, this.notifyStateChange.bind(this))
  }

  async processAsApplicant(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    await this.resolveTask(presentation, lc, LCPresentationTaskType.ReviewPresentationDiscrepancies, false)
  }

  async notifyStateChange(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    await this.sendNotif(presentation, lc, this.presentationStatus, role)
  }
}
