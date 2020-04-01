import { getLogger } from '@komgo/logging'
import { ILCPresentationTransitionStateProcessor } from '../ILCPresentationTransitionStateProcessor'
import { ILCPresentationActionPerformer } from '../ILCPresentationActionPerformer'
import { LCPresentationRole } from '../../LCPresentationRole'
import { ILC } from '../../../../../data-layer/models/ILC'
import { ILCPresentation } from '../../../../../data-layer/models/ILCPresentation'
import { LCPresentationContractStatus } from '../../LCPresentationContractStatus'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../../../../inversify/types'
import { ILCPresentationTransactionManager } from '../../../../blockchain/LCPresentationTransactionManager'
import { LCPresentationProcessorBase } from '../LCPresentationProcessorBase'
import { IDocumentServiceClient } from '../../../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../../../documents/DocumentRequestBuilder'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'
import { TaskManager } from '@komgo/notification-publisher'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'

@injectable()
export class LCPresentationCompliantByNominatedBankProcessor extends LCPresentationProcessorBase
  implements ILCPresentationTransitionStateProcessor {
  public state = LCPresentationContractStatus.DocumentsCompliantByNominatedBank

  constructor(
    @inject(TYPES.DocumentServiceClient) docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) docRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.LCPresentationTaskFactory) presentationTaskFactory: ILCPresentationTaskFactory,
    @inject(TYPES.TaskManagerClient) taskManager: TaskManager,
    @inject(TYPES.LCPresentationNotificationProcessor)
    presentationNotificationProcessor: ILCPresentationNotificationProcessor,
    @inject(TYPES.LCPresentationTransactionManager)
    private readonly transactionManager: ILCPresentationTransactionManager
  ) {
    super(docServiceClient, docRequestBuilder, presentationTaskFactory, taskManager, presentationNotificationProcessor)
    this.logger = getLogger('LCPresentationCompliantByNominatedBankProcessor')
    this.handlers.set(LCPresentationRole.NominatedBank, this.processAsNominatedBank.bind(this))
  }

  async processAsNominatedBank(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    this.logger.info('State changed to DocumentsCompliantByNominatedBank - deploying as Nominated bank', {
      lcid: lc && lc._id ? lc._id.toString() : null,
      presentationId: presentation ? presentation.staticId : null
    })

    const txHash = await this.transactionManager.deployCompliantAsNominatedBank(presentation, lc)
    return txHash
  }
}
