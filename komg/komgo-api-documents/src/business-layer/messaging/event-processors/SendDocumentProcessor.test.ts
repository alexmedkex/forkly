import 'jest'
import 'reflect-metadata'

import * as _ from 'lodash'

import { TaskStatus, INotificationCreateRequest, NotificationLevel } from '@komgo/notification-publisher'

import CategoryDataAgent from '../../../data-layer/data-agents/CategoryDataAgent'
import ReceivedDocumentsDataAgent from '../../../data-layer/data-agents/ReceivedDocumentsDataAgent'
import TypeDataAgent from '../../../data-layer/data-agents/TypeDataAgent'
import {
  COMPANY_NAME,
  documentReview,
  RECEIVED_DOCUMENTS_ID,
  receivedDocuments,
  REQUEST_ID,
  SHARE_ID
} from '../../../data-layer/models/test-entities'
import { CompaniesRegistryClient } from '../../../infrastructure/api-registry/CompaniesRegistryClient'
import { mock } from '../../../mock-utils'
import { COMPANY_ID, PRODUCT_ID } from '../../../service-layer/utils/test-entities'
import { IReceivedDocumentsTask } from '../../tasks/IReceivedDocumentsTask'
import { TaskClient } from '../../tasks/TaskClient'
import { EVENT_NAME, TASK_TYPE, NOTIFICATION_TYPE } from '../enums'
import { SendDocumentsMessage } from '../messages'
import { sendDocumentsMessage } from '../messages/test-messages'
import { RabbitMQPublishingClient } from '../RabbitMQPublishingClient'
import { DocumentProcessorUtils } from './DocumentProcessorUtils'
import { SendDocumentProcessor } from './SendDocumentProcessor'
import { NotificationClient } from '../../notifications/NotificationClient'

const documentRequest: SendDocumentsMessage = sendDocumentsMessage()

const documentRequestNoReview: SendDocumentsMessage = {
  ...documentRequest,
  data: {
    ...documentRequest.data,
    reviewNotRequired: true
  }
}

const tradeDocumentRequestNoReview: SendDocumentsMessage = {
  ...documentRequest,
  data: {
    ...documentRequest.data,
    reviewNotRequired: true,
    documentShareNotification: true
  }
}

const NOTIFICATION_REQUEST: IReceivedDocumentsTask = {
  summary: `1 document(s) received from ${COMPANY_NAME}`,
  taskType: TASK_TYPE.DocumentsReview,
  status: TaskStatus.ToDo,
  counterpartyStaticId: COMPANY_ID,
  requiredPermission: {
    productId: 'product-id',
    actionId: 'reviewDoc'
  },
  context: {
    receivedDocumentsId: RECEIVED_DOCUMENTS_ID
  }
}

const NOTIFICATION_CREATE_REQUEST: INotificationCreateRequest = {
  productId: 'product-id',
  type: NOTIFICATION_TYPE.TradeFinanceDocumentShare,
  level: NotificationLevel.info,
  requiredPermission: {
    productId: 'product-id',
    actionId: 'manageDocument'
  },
  context: {
    documentId: 'document-id'
  },
  message: `You have received a trade document from ${COMPANY_NAME}, click here to view it`
}

jest.mock('merkle-tree-solidity')

describe('SendDocumentProcessor', () => {
  let sendDocumentProcessor: SendDocumentProcessor
  let taskClient: TaskClient
  let receivedDocumentsDataAgent: ReceivedDocumentsDataAgent
  let companiesRegistryClient: CompaniesRegistryClient
  let rabbitMQPublishingClient: RabbitMQPublishingClient
  let typeDataAgent: TypeDataAgent
  let categoryDataAgent: CategoryDataAgent
  let documentProcessorUtils: DocumentProcessorUtils
  let notificationClient: NotificationClient

  beforeEach(async () => {
    jest.resetAllMocks()
    taskClient = mock(TaskClient)
    receivedDocumentsDataAgent = mock(ReceivedDocumentsDataAgent)
    companiesRegistryClient = mock(CompaniesRegistryClient)
    rabbitMQPublishingClient = mock(RabbitMQPublishingClient)
    typeDataAgent = mock(TypeDataAgent)
    categoryDataAgent = mock(CategoryDataAgent)
    documentProcessorUtils = mock(DocumentProcessorUtils)
    notificationClient = mock(NotificationClient)

    receivedDocumentsDataAgent.create.mockReset()
    taskClient.createTask.mockReset()
    notificationClient.sendNotification.mockReset()

    sendDocumentProcessor = new SendDocumentProcessor(
      taskClient,
      receivedDocumentsDataAgent,
      companiesRegistryClient,
      rabbitMQPublishingClient,
      categoryDataAgent,
      typeDataAgent,
      documentProcessorUtils,
      notificationClient
    )

    receivedDocumentsDataAgent.create.mockReturnValue(receivedDocuments())
    companiesRegistryClient.getCompanyNameByStaticId.mockReturnValue(COMPANY_NAME)
    categoryDataAgent.getById.mockReturnValue({ name: 'category name' })
    typeDataAgent.getById.mockReturnValue({ name: 'type name' })
  })

  it('subscribes to correct events', () => {
    expect(sendDocumentProcessor.eventNames()).toEqual([EVENT_NAME.SendDocuments])
  })

  it('sends documents notification', async () => {
    await sendDocumentProcessor.processEvent(COMPANY_ID, documentRequest)

    expect(taskClient.createTask).toBeCalledWith(NOTIFICATION_REQUEST, `1 document(s) received from ${COMPANY_NAME}`)
    expect(taskClient.createTask).toHaveBeenCalledTimes(1)
  })

  it('should sends only notification, without creating tasks', async () => {
    await sendDocumentProcessor.processEvent(COMPANY_ID, tradeDocumentRequestNoReview)

    expect(notificationClient.sendNotification).toBeCalledWith(NOTIFICATION_CREATE_REQUEST)
    expect(notificationClient.sendNotification).toHaveBeenCalledTimes(1)
    expect(taskClient.createTask).not.toHaveBeenCalled()
  })

  it('should not send documents notification if review not required', async () => {
    await sendDocumentProcessor.processEvent(COMPANY_ID, documentRequestNoReview)

    expect(notificationClient.sendNotification).not.toHaveBeenCalled()
  })

  it('should not create task and not send documents notification if review not required', async () => {
    await sendDocumentProcessor.processEvent(COMPANY_ID, documentRequestNoReview)

    expect(taskClient.createTask).not.toHaveBeenCalled()
  })

  it('sends an internal message with the right routing key', async () => {
    await sendDocumentProcessor.processEvent(COMPANY_ID, documentRequest)

    const expectedRoutingKey = `INTERNAL.DOCUMENT.DocumentReceived.${documentRequest.context.productId}`

    expect(rabbitMQPublishingClient.sendInternalMessage).toHaveBeenCalledWith(expectedRoutingKey, expect.anything())
  })

  it('stores information about received documents', async () => {
    await sendDocumentProcessor.processEvent(COMPANY_ID, documentRequest)

    expect(receivedDocumentsDataAgent.create).toBeCalledWith(PRODUCT_ID, {
      productId: PRODUCT_ID,
      companyId: COMPANY_ID,
      requestId: REQUEST_ID,
      shareId: SHARE_ID,
      documents: [documentReview()],
      feedbackSent: false
    })
  })
})
