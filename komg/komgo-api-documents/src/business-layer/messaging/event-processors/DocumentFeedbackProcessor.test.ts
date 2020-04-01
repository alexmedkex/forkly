import { NotificationLevel } from '@komgo/notification-publisher'
import 'reflect-metadata'

import DocumentDataAgent from '../../../data-layer/data-agents/DocumentDataAgent'
import SharedDocumentsDataAgent from '../../../data-layer/data-agents/SharedDocumentsDataAgent'
import {
  COMPANY_ID,
  COMPANY_NAME,
  document,
  DOCUMENT_NAME,
  PRODUCT_ID,
  sharedDocuments
} from '../../../data-layer/models/test-entities'
import { CompaniesRegistryClient } from '../../../infrastructure/api-registry/CompaniesRegistryClient'
import { mock } from '../../../mock-utils'
import { IDocumentFeedbackNotification } from '../../notifications/IDocumentFeedbackNotification'
import { NotificationClient } from '../../notifications/NotificationClient'
import { FEEDBACK_STATUS, NOTIFICATION_TYPE, EVENT_NAME } from '../enums'
import { DocumentFeedbackMessage } from '../messages'
import { documentFeedbackMessage } from '../messages/test-messages'

import { DocumentFeedbackProcessor } from './DocumentFeedbackProcessor'

function createFeedbackNotification(message: string): IDocumentFeedbackNotification {
  return {
    productId: PRODUCT_ID,
    type: NOTIFICATION_TYPE.DocumentInfo,
    level: NotificationLevel.info,
    requiredPermission: {
      productId: PRODUCT_ID,
      actionId: 'manageDocRequest'
    },
    context: {
      companyId: COMPANY_ID
    },
    message
  }
}

const notificationClient = mock(NotificationClient)
const documentDataAgent = mock(DocumentDataAgent)
const companiesRegistryClient = mock(CompaniesRegistryClient)
const sharedDocumentDataAgent = mock(SharedDocumentsDataAgent)

describe('DocumentFeedbackProcessor', () => {
  let documentFeedbackProcessor: DocumentFeedbackProcessor

  beforeEach(async () => {
    jest.resetAllMocks()
    sharedDocumentDataAgent.update.mockReset()

    // TODO: Workaround for: https://github.com/facebook/jest/issues/7083
    notificationClient.sendNotification.mockReset()

    documentFeedbackProcessor = new DocumentFeedbackProcessor(
      documentDataAgent,
      notificationClient,
      companiesRegistryClient,
      sharedDocumentDataAgent
    )

    companiesRegistryClient.getCompanyNameByStaticId.mockReturnValue(COMPANY_NAME)
    documentDataAgent.getBareById.mockReturnValue(document())
    sharedDocumentDataAgent.getBareById.mockReturnValue(sharedDocuments())
  })

  it('subscribes to correct events', () => {
    expect(documentFeedbackProcessor.eventNames()).toEqual([EVENT_NAME.SendDocumentFeedback])
  })

  it('sends document request notification for a rejected document', async () => {
    await documentFeedbackProcessor.processEvent(COMPANY_ID, rejectedFeedbackMessage(null))

    expect(notificationClient.sendNotification).toBeCalledWith(
      createFeedbackNotification(`Document "${DOCUMENT_NAME}" refused by ${COMPANY_NAME}`)
    )
  })

  it('save document feedback for a rejected document', async () => {
    await documentFeedbackProcessor.processEvent(COMPANY_ID, rejectedFeedbackMessage('Reject note'))

    const doc = sharedDocuments()
    doc.feedbackReceived = true
    doc.documents[0].status = FEEDBACK_STATUS.Rejected
    doc.documents[0].note = 'Reject note'
    expect(sharedDocumentDataAgent.update).toBeCalledWith(PRODUCT_ID, doc)
  })

  it('does not stores feedback if share not exitst', async () => {
    sharedDocumentDataAgent.getBareById.mockReturnValue(null)
    await documentFeedbackProcessor.processEvent(COMPANY_ID, rejectedFeedbackMessage('Reject note'))
    expect(sharedDocumentDataAgent.update).not.toBeCalled()
  })

  it('does not stores feedback if ids missmatch ', async () => {
    const doc = sharedDocuments()
    doc.documents[0].documentId = 'failed'
    sharedDocumentDataAgent.getBareById.mockReturnValue(doc)
    await documentFeedbackProcessor.processEvent(COMPANY_ID, rejectedFeedbackMessage('Reject note'))
    expect(sharedDocumentDataAgent.update).not.toBeCalled()
  })

  it('send document request notification if a document in a feedback is not found', async () => {
    documentDataAgent.getBareById.mockReturnValue(null)

    await documentFeedbackProcessor.processEvent(COMPANY_ID, rejectedFeedbackMessage(null))

    expect(notificationClient.sendNotification).toBeCalledWith(
      createFeedbackNotification(`Document "<unknown>" refused by ${COMPANY_NAME}`)
    )
  })

  it('sends document request notification for a rejected document with rejection message', async () => {
    await documentFeedbackProcessor.processEvent(COMPANY_ID, rejectedFeedbackMessage('Out of date'))

    expect(notificationClient.sendNotification).toBeCalledWith(
      createFeedbackNotification(`Document "${DOCUMENT_NAME}" refused by ${COMPANY_NAME}. Out of date.`)
    )
  })
  // KOMGO-2671: Commented, not sure if it is going to last for long time
  // it('sends document request notification for an approved document', async () => {
  //   await documentFeedbackProcessor.processEvent(COMPANY_ID, approvedFeedbackMessage())

  //   expect(notificationClient.sendNotification).toBeCalledWith(
  //     createFeedbackNotification(`Document "${DOCUMENT_NAME}" approved by ${COMPANY_NAME}`)
  //   )
  // })
})

function rejectedFeedbackMessage(message: string): DocumentFeedbackMessage {
  const documentFeedbackRejectedMessage: DocumentFeedbackMessage = documentFeedbackMessage(FEEDBACK_STATUS.Rejected)
  documentFeedbackRejectedMessage.data.documents[0].notes = message

  return documentFeedbackRejectedMessage
}

// KOMGO-2671: Commented, not sure if it is going to last for long time
// function approvedFeedbackMessage(): DocumentFeedbackMessage {
//   return documentFeedbackMessage(FEEDBACK_STATUS.Accepted)
// }
