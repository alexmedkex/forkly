import { AMQPConfig } from '@komgo/integration-test-utilities'
import * as logger from 'winston'

import { FEEDBACK_STATUS } from '../../src/business-layer/messaging/enums'
import { DocumentReviewUpdate } from '../../src/service-layer/request/received-documents/DocumentReviewUpdate'
import { DocumentsReviewUpdate } from '../../src/service-layer/request/received-documents/DocumentsReviewUpdate'
import {
  IFullReceivedDocumentsResponse,
  IReceivedDocumentsResponse
} from '../../src/service-layer/responses/received-documents'

import { members } from './sampledata/sampleData'
import { productId, receivedDocId } from './utils/consts'
import { runFixtures } from './utils/fixtures'
import { integrationTest } from './utils/integration-test'
import { TestContainer } from './utils/TestContainer'
import { createInternalQueues } from './utils/utils'

integrationTest(
  'Received Documents Controller Integration',
  [TestContainer.Mongo, TestContainer.MockServer, TestContainer.RabbitMQ],
  test => {
    const amqpConfig = new AMQPConfig()

    beforeAll(async () => {
      try {
        const mockedIds = test.instance.rabbitMqConfig()
        await createInternalQueues(mockedIds, amqpConfig)
      } catch (e) {
        logger.error('Before all failed', e.message)
      }
    })

    beforeEach(async () => {
      await runFixtures({
        dir: __dirname + '/fixtures',
        filter: '.*',
        mongoDbUrl: test.instance.mongoDbUrl()
      })
    })

    it('get received document by id', async () => {
      const response = await test.instance
        .serverConnection()
        .get(`products/${productId}/received-documents/${receivedDocId}`)
      const receivedDocument: IFullReceivedDocumentsResponse = response.data
      expect(receivedDocument).toBeDefined()
      expect(receivedDocument.documents.length).toBeGreaterThan(0)
    })

    it('get received documents by product', async () => {
      const response = await test.instance.serverConnection().get(`products/${productId}/received-documents`)
      const documents: IFullReceivedDocumentsResponse[] = response.data
      expect(documents.length).toBeGreaterThan(0)
      expect(documents.length).toBe(2) // same number of received-docs loaded from fixtures.
    })

    it('update received document status', async () => {
      const documentIdToUpdateStatus = 'fcf4e86a-5b6a-432a-8971-f94f06216885'
      // State for status update as accepted
      const documentsStatusUpdate: DocumentReviewUpdate[] = [
        {
          documentId: documentIdToUpdateStatus,
          note: 'update note',
          status: FEEDBACK_STATUS.Accepted
        }
      ]

      const updateBody: DocumentsReviewUpdate = {
        documents: documentsStatusUpdate
      }

      const response = await test.instance
        .serverConnection()
        .patch(`products/${productId}/received-documents/${receivedDocId}/documents`, updateBody)
      const document: IReceivedDocumentsResponse = response.data
      expect(document.id).toEqual(receivedDocId)
      expect(updateBody.documents.length).toEqual(1)
      expect(updateBody.documents[0].status).toEqual(FEEDBACK_STATUS.Accepted)
      expect(updateBody.documents[0].documentId).toEqual(documentIdToUpdateStatus)
    })

    it('send feedback of received document', async () => {
      await test.instance.mockServer().mockAnyResponse({
        httpRequest: {
          method: 'GET',
          path: test.instance.apiRoutes().registry.getMembers
        },
        httpResponse: {
          body: JSON.stringify(members)
        }
      })

      await test.instance.mockServer().mockAnyResponse({
        httpRequest: {
          method: 'PATCH',
          path: test.instance.apiRoutes().notif.tasks
        },
        httpResponse: {
          body: JSON.stringify(members)
        }
      })

      const response = await test.instance
        .serverConnection()
        .post(`products/${productId}/received-documents/${receivedDocId}/send-feedback`)
      expect(response.status).toBe(204) // we expect no content in reply
    })
  }
)
