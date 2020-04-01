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
export class LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor extends LCPresentationProcessorBase
  implements ILCPresentationTransitionStateProcessor {
  public state = LCPresentationContractStatus.DiscrepanciesAdvisedByNominatedBank

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
    this.handlers.set(LCPresentationRole.NominatedBank, this.processAsNominatedBank.bind(this))
    this.handlers.set(LCPresentationRole.Beneficiary, this.processAsBeneficiary.bind(this))
  }

  async processAsNominatedBank(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    await this.resolveTask(presentation, lc, LCPresentationTaskType.ReviewPresentation, true)

    this.logger.info('State changed to DiscrepanciesAdvisedByNominatedBank - deploying new contract as Nominated bank')
    await this.transactionManager.deployAdviseDiscrepanciesAsNominatedBank(presentation, lc)
  }

  async processAsBeneficiary(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    await this.sendNotif(presentation, lc, LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank, role)
  }
}
