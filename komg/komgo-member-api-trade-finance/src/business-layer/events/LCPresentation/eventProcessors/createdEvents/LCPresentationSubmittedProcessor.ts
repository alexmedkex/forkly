import { IDocumentServiceClient } from '../../../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../../../documents/DocumentRequestBuilder'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../../../../inversify/types'
import { getLogger } from '@komgo/logging'
import { ILCPresentation } from '../../../../../data-layer/models/ILCPresentation'
import { LCPresentationRole } from '../../LCPresentationRole'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'
import { TaskManager, TaskStatus } from '@komgo/notification-publisher'
import { ILC } from '../../../../../data-layer/models/ILC'
import { LC_TASK_TYPE } from '../../../../tasks/LCTaskType'
import { ILCTaskFactory } from '../../../../tasks/LCTaskFactory'
import { ILCPresentationCreatedProcessor } from '../ILCPresentationCreatedProcessor'
import { LCPresentationContractStatus } from '../../LCPresentationContractStatus'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'
import { LCPresentationProcessorBase } from '../LCPresentationProcessorBase'
import { LCPresentationTaskType } from '../../../../tasks/LCPresentationTaskType'
import { TRADE_FINANCE_ACTION } from '../../../../../business-layer/tasks/permissions'

@injectable()
export class LCPresentationSubmittedProcessor extends LCPresentationProcessorBase
  implements ILCPresentationCreatedProcessor {
  public state = LCPresentationContractStatus.DocumentsPresented

  constructor(
    @inject(TYPES.LCTaskFactory) private lcTaskFactory: ILCTaskFactory,
    @inject(TYPES.DocumentServiceClient) docServiceClient: IDocumentServiceClient,
    @inject(TYPES.DocumentRequestBuilder) docRequestBuilder: IDocumentRequestBuilder,
    @inject(TYPES.LCPresentationTaskFactory) presentationTaskFactory: ILCPresentationTaskFactory,
    @inject(TYPES.TaskManagerClient) taskManager: TaskManager,
    @inject(TYPES.LCPresentationNotificationProcessor)
    presentationNotificationProcessor: ILCPresentationNotificationProcessor
  ) {
    super(docServiceClient, docRequestBuilder, presentationTaskFactory, taskManager, presentationNotificationProcessor)
    this.logger = getLogger('LCPresentationSubmittedProcessor')
    this.handlers.set(LCPresentationRole.Beneficiary, this.processAsBeneficiary.bind(this))
    this.handlers.set(LCPresentationRole.NominatedBank, this.processAsReviewingBank.bind(this))
    this.handlers.set(LCPresentationRole.IssuingBank, this.processAsReviewingBank.bind(this))
  }

  private async processAsBeneficiary(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    await this.sendPresentationDocuments(
      presentation,
      presentation.nominatedBankId ? [presentation.nominatedBankId] : [presentation.issuingBankId]
    )
    await this.resolveLCTask(lc)
  }

  private async processAsReviewingBank(presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) {
    await this.createTask(
      LCPresentationTaskType.ReviewPresentation,
      presentation,
      lc,
      TRADE_FINANCE_ACTION.ReviewPresentation
    )
  }

  private async resolveLCTask(lc: ILC) {
    const context = this.lcTaskFactory.getTaskContext(LC_TASK_TYPE.ManagePresentation, lc)

    const tasks = await this.taskManager.getTasks({
      status: TaskStatus.ToDo,
      taskType: LC_TASK_TYPE.ManagePresentation,
      context
    })

    if (!tasks || !tasks.length) {
      return
    }

    const task = tasks[0]

    await this.taskManager.updateTaskStatus({
      status: TaskStatus.Done,
      taskType: task.taskType,
      context: task.context,
      outcome: true
    })
  }
}
