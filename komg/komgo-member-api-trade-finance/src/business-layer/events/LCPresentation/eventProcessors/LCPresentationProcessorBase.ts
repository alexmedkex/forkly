import { getLogger } from '@komgo/logging'
import { ILCPresentationActionPerformer } from './ILCPresentationActionPerformer'
import { LCPresentationRole } from '../LCPresentationRole'
import { ILC } from '../../../../data-layer/models/ILC'
import { ILCPresentation } from '../../../../data-layer/models/ILCPresentation'
import { injectable } from 'inversify'
import { LCPresentationStatus } from '@komgo/types'
import { ILCPresentationNotificationProcessor } from '../../../tasks/LCPresentationNotificationProcessor'
import { IDocumentServiceClient } from '../../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../../../documents/DocumentRequestBuilder'
import { ILCPresentationTaskFactory } from '../../../tasks/LCPresentationTaskFactory'
import { TaskManager, TaskStatus } from '@komgo/notification-publisher'
import { LCPresentationTaskType } from '../../../tasks/LCPresentationTaskType'
import { DOCUMENT_PRODUCT } from '../../../documents/documentTypes'
import { ErrorCode } from '@komgo/error-utilities'
import { TRADE_FINANCE_ACTION } from '../../../../business-layer/tasks/permissions'

@injectable()
export class LCPresentationProcessorBase {
  protected handlers = new Map<
    LCPresentationRole,
    (presentation: ILCPresentation, lc: ILC, role: LCPresentationRole) => Promise<void>
  >()
  protected logger = getLogger('LCPresentationProcessorBase')

  constructor(
    protected readonly docServiceClient: IDocumentServiceClient,
    protected readonly docRequestBuilder: IDocumentRequestBuilder,
    protected readonly presentationTaskFactory: ILCPresentationTaskFactory,
    protected readonly taskManager: TaskManager,
    protected readonly presentationNotificationProcessor: ILCPresentationNotificationProcessor
  ) {}

  public async processEvent(presentation: ILCPresentation, event, performer: ILCPresentationActionPerformer, lc: ILC) {
    this.logger.info(`Processing as ${performer.role}`, {
      lcid: lc && lc._id ? lc._id.toString() : null,
      presentationId: presentation ? presentation.staticId : null
    })

    const handler = this.handlers.get(performer.role)

    if (handler) {
      await handler(presentation, lc, performer.role)
    } else {
      this.logger.info(`No handler for company role: ${performer.role}`)
    }
  }

  protected async sendNotif(
    presentation: ILCPresentation,
    lc: ILC,
    state: LCPresentationStatus,
    role: LCPresentationRole
  ) {
    try {
      this.logger.info('Sending notification', {
        lcid: lc && lc._id ? lc._id.toString() : null,
        presentationId: presentation ? presentation.staticId : null
      })
      await this.presentationNotificationProcessor.sendStateUpdatedNotification(presentation, lc, state, role)
    } catch (err) {
      return
    }
  }

  protected async createTask(
    taskType: LCPresentationTaskType,
    presentation: ILCPresentation,
    lc: ILC,
    actionId: TRADE_FINANCE_ACTION
  ) {
    this.logger.info('Creating task', { taskType })

    const task = await this.presentationTaskFactory.getTask(taskType, presentation, lc, actionId)
    await this.taskManager.createTask(task.task, task.notification.message)
  }

  protected async sendPresentationDocuments(presentation: ILCPresentation, companies: string[]) {
    try {
      const documents = await this.docServiceClient.getDocuments(
        DOCUMENT_PRODUCT.TradeFinance,
        this.docRequestBuilder.getPresentationDocumentSearchContext(presentation)
      )

      await this.docServiceClient.shareDocument({
        productId: DOCUMENT_PRODUCT.TradeFinance,
        documents: documents.map(doc => doc.id),
        companies,
        context: this.docRequestBuilder.getPresentationDocumentSearchContext(presentation)
      })
    } catch (err) {
      this.logger.info('Error sending documents', {
        error: 'DocumentSendFailed',
        errorMessage: err.message,
        errorObject: err,
        presentationId: presentation ? presentation.staticId : null
      })
      throw err
    }
  }

  protected async resolveTask(
    presentation: ILCPresentation,
    lc: ILC,
    taskType: LCPresentationTaskType,
    outcome: boolean
  ) {
    const context = this.presentationTaskFactory.getTaskContext(taskType, presentation, lc)

    const tasks = await this.taskManager.getTasks({
      taskType,
      context
    })

    if (!tasks || !tasks.length) {
      return
    }

    const task = tasks.filter(t => t.status === TaskStatus.ToDo || t.status === TaskStatus.Pending)[0]

    if (!task) {
      return
    }

    await this.taskManager.updateTaskStatus({
      status: TaskStatus.Done,
      taskType: task.taskType,
      context: task.context,
      outcome
    })
  }
}
