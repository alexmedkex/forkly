import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { TaskStatus } from '@komgo/notification-publisher'
import { inject, injectable } from 'inversify'

import IncomingRequestDataAgent from '../../../data-layer/data-agents/IncomingRequestDataAgent'
import TypeDataAgent from '../../../data-layer/data-agents/TypeDataAgent'
import { IIncomingRequest } from '../../../data-layer/models/incoming-request'
import { CompaniesRegistryClient } from '../../../infrastructure/api-registry/CompaniesRegistryClient'
import { MetricNames, Directions } from '../../../infrastructure/metrics/consts'
import { metric } from '../../../infrastructure/metrics/metrics'
import { TYPES } from '../../../inversify/types'
import { forEachAsyncParallel } from '../../../utils'
import { ErrorName } from '../../../utils/ErrorName'
import { documentRequestContext } from '../../tasks/context-utils'
import { IDocumentRequestTask } from '../../tasks/IDocumentRequestTask'
import { TaskClient } from '../../tasks/TaskClient'
import { EVENT_NAME, TASK_TYPE } from '../enums'
import { DocumentRequestMessage } from '../messages'

import { DocumentProcessorUtils } from './DocumentProcessorUtils'
import { IEventProcessor } from './IEventProcessor'
import InvalidType from './InvalidType'
import { ignoreDuplicatedError } from './utils'

const documentRequest = metric(MetricNames.DocumentRequestSent)

/**
 * Processes document requests events.
 */
@injectable()
export class DocumentRequestProcessor implements IEventProcessor<DocumentRequestMessage> {
  private readonly logger = getLogger('DocumentRequestProcessor')

  constructor(
    @inject(TYPES.TaskClient) private readonly taskClient: TaskClient,
    @inject(TYPES.TypeDataAgent) private readonly typeDataAgent: TypeDataAgent,
    @inject(TYPES.IncomingRequestDataAgent) private readonly incomingRequestDataAgent: IncomingRequestDataAgent,
    @inject(TYPES.CompaniesRegistryClient) private readonly companiesRegistryClient: CompaniesRegistryClient,
    @inject(TYPES.DocumentProcessorUtils) private readonly documentProcessorUtils: DocumentProcessorUtils
  ) {}

  async processEvent(senderStaticId: string, event: DocumentRequestMessage): Promise<void> {
    this.logger.info('Processing documents request', { senderStaticId })
    try {
      const formIds: string[] = event.data.forms ? event.data.forms.map(form => form.id) : []

      await this.documentProcessorUtils.storeNewDocuments(senderStaticId, event.context.productId, event.data.forms)
      const receivedRequest: IIncomingRequest = this.convertFromEvent(senderStaticId, event, formIds)

      await this.validateAllTypesExist(receivedRequest)

      await ignoreDuplicatedError(senderStaticId, async () => {
        this.logger.info('Creating incoming document request', { senderStaticId, requestId: receivedRequest.id })
        await this.incomingRequestDataAgent.create(event.context.productId, receivedRequest)
      })

      await this.createTask(senderStaticId, receivedRequest)

      documentRequest.record(Directions.Inbound)
    } catch (error) {
      if (error instanceof InvalidType) {
        this.logger.error(
          ErrorCode.ValidationInternalAMQP,
          ErrorName.DocumentRequestEventError,
          'Received a request for an unknown document type',
          {
            senderStaticId,
            errorMessage: error.message,
            errorType: 'InvalidType'
          }
        )
      } else {
        throw error
      }
    }
  }

  eventNames(): string[] {
    return [EVENT_NAME.RequestDocuments]
  }

  eventType(): any {
    return DocumentRequestMessage
  }

  private async createTask(senderStaticId: string, incomingRequest: IIncomingRequest) {
    this.logger.info('Getting company name by sender id', { senderStaticId })
    const companyName = await this.companiesRegistryClient.getCompanyNameByStaticId(senderStaticId)
    const summary = `${incomingRequest.types.length} document(s) requested from ${companyName}`

    this.logger.info('Creating a task for a document request', { senderStaticId })
    const newTask: IDocumentRequestTask = this.createDocumentRequestTask(senderStaticId, summary, incomingRequest)
    await this.taskClient.createTask(newTask, summary)
  }

  private createDocumentRequestTask(
    senderStaticId: string,
    summaryInput: string,
    incomingRequest: IIncomingRequest
  ): IDocumentRequestTask {
    return {
      summary: summaryInput,
      taskType: TASK_TYPE.DocumentRequest,
      status: TaskStatus.ToDo,
      counterpartyStaticId: senderStaticId,
      requiredPermission: {
        productId: incomingRequest.productId,
        actionId: 'manageDocRequest'
      },
      context: documentRequestContext(incomingRequest.id)
    }
  }

  private convertFromEvent(senderStaticId: string, event: DocumentRequestMessage, formIds: string[]): IIncomingRequest {
    return {
      id: event.data.requestId,
      productId: event.context.productId,
      companyId: senderStaticId,
      types: event.data.types.map(t => t.id),
      documents: formIds,
      sentDocumentTypes: [],
      sentDocuments: [],
      notes: event.data.notes,
      deadline: event.data.deadline
    }
  }

  private async validateAllTypesExist(incomingRequest: IIncomingRequest): Promise<void> {
    await forEachAsyncParallel(incomingRequest.types, async typeId => {
      const typeExists = this.typeDataAgent.exists(incomingRequest.productId, typeId)
      if (!typeExists) {
        throw new InvalidType(`Unknown type ${typeId} for product ${incomingRequest.productId}`)
      }
    })
  }
}
