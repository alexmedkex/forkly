import { AMQPConfig, AMQPUtility, PublisherMicroservice, waitUntilTrue } from '@komgo/integration-test-utilities'
import { MessagingFactory } from '@komgo/messaging-library'
import waitForExpect from 'wait-for-expect'

import * as fs from 'fs'
import * as logger from 'winston'

import { DocumentState } from '../../src/data-layer/models/ActionStates'
import {
  SendDocumentsRequest,
  SendDocumentsRequestExtended,
  UpdateDocumentRequest
} from '../../src/service-layer/request/document'
import { IDocumentResponse } from '../../src/service-layer/responses/document'
import { IFullDocumentResponse } from '../../src/service-layer/responses/document/IFullDocumentResponse'

import { members } from './sampledata/sampleData'
import { uploadSampleFile } from './sampledata/upload-sample-file'
import {
  categoryId,
  fixtureCompanyId,
  fixtureDocumentHash,
  fixtureRequestId,
  productId,
  sampleFilePath,
  typeId,
  fixtureDocumentId
} from './utils/consts'
import { EnvironmentInstance } from './utils/EnvironmentInstance'
import { runFixtures } from './utils/fixtures'
import { integrationTest } from './utils/integration-test'
import { TestContainer } from './utils/TestContainer'
import { createInternalQueues, deleteInternalMQs } from './utils/utils'

integrationTest(
  'SendDocuments Controller integration',
  [TestContainer.Mongo, TestContainer.MockServer, TestContainer.RabbitMQ, TestContainer.Ganache],
  test => {
    const amqpConfig = new AMQPConfig()

    let dummyPublisher: PublisherMicroservice
    const ANON_ROUTING_KEY = 'ANON_ROUTING_KEY'

    let testInstance: EnvironmentInstance

    const messagingFactory = new MessagingFactory(amqpConfig.host, amqpConfig.username, amqpConfig.password)
    let consumer

    beforeEach(async () => {
      // reset fixtures before each test
      // makes them independent of previous tests / data
      testInstance = test.instance

      try {
        await runFixtures({
          dir: __dirname + '/fixtures',
          filter: '.*',
          mongoDbUrl: testInstance.mongoDbUrl()
        })

        const { eventConsumerId } = testInstance.rabbitMqConfig()

        consumer = messagingFactory.createConsumer(eventConsumerId)
      } catch (e) {
        logger.error('Before each failed', e.message)
      }
    })

    afterEach(async () => {
      try {
        await consumer.close()
        const mockedIds = testInstance.rabbitMqConfig()
        await deleteInternalMQs(mockedIds, amqpConfig)
      } catch (e) {
        logger.error('After each failed ', e.message)
      }
    })

    it('should be able to set up an exchange with bound queues to publish and consume a simple message', async () => {
      const mockedIds = test.instance.rabbitMqConfig()
      const { eventToPublisherId } = mockedIds

      let readMessage
      await consumer.listen(testInstance.rabbitMqConfig().eventToPublisherId, ANON_ROUTING_KEY, event => {
        readMessage = event.content
        event.ack()
      })

      dummyPublisher = new PublisherMicroservice(eventToPublisherId, amqpConfig)
      await dummyPublisher.beforeEach()

      const mockMessage = { message: 'bananas!' }

      await dummyPublisher.publish(ANON_ROUTING_KEY, mockMessage)

      await waitUntilTrue(
        {
          timeout: 10000,
          interval: 50
        },
        async () => {
          return !!readMessage
        }
      )

      expect(readMessage).toMatchObject(mockMessage)
      await dummyPublisher.afterEach()
    })

    it('should respond to an adhoc share documents', async () => {
      const uploadResponse: IFullDocumentResponse = await uploadSampleFile(
        sampleFilePath,
        { productId, categoryId, typeId },
        testInstance,
        fixtureDocumentHash
      )

      await waitForExpect(async () => {
        expect(uploadResponse.id).toBeDefined()
      })

      await testInstance.mockServer().reset()

      // update state to emulated document being registered on chain and updated locally
      const updateRequest: UpdateDocumentRequest = {
        id: uploadResponse.id,
        productId: uploadResponse.product.id,
        categoryId: uploadResponse.category.id,
        typeId: uploadResponse.type.id,
        state: DocumentState.Registered
      }

      let updateResponse
      await waitForExpect(async () => {
        updateResponse = await testInstance.serverConnection().patch(`products/${productId}/documents`, updateRequest)
        expect(updateResponse.status).toBe(200)
      })

      const validInput: SendDocumentsRequest = {
        documents: [uploadResponse.id],
        companyId: fixtureCompanyId,
        requestId: fixtureRequestId
      }

      await testInstance.mockServer().mockAnyResponse({
        httpRequest: {
          method: 'GET',
          path: testInstance.apiRoutes().registry.getMembers
        },
        httpResponse: {
          body: JSON.stringify(members)
        }
      })

      await testInstance.mockServer().mockAnyResponse({
        httpRequest: {
          method: 'PATCH',
          path: testInstance.apiRoutes().notif.tasks
        },
        httpResponse: {
          body: JSON.stringify(members)
        }
      })

      await waitForExpect(async () => {
        const response = await testInstance.serverConnection().post(`products/${productId}/send-documents`, validInput)
        expect(response.data.length).toBeGreaterThan(0)

        const actual: IDocumentResponse = response.data[0]
        expect(actual).toBeDefined()
        expect(actual.id).toBe(uploadResponse.id) // same doc that we registered
        expect(actual.state).toBe(updateResponse.data.state)
      })
    })

    it('send documents internal request', async () => {
      const uploadResponse: IFullDocumentResponse = await uploadSampleFile(
        sampleFilePath,
        { productId, categoryId, typeId },
        testInstance,
        fixtureDocumentHash
      )

      await waitForExpect(async () => {
        expect(uploadResponse.id).toBeDefined()
      })

      await testInstance.mockServer().reset()

      // update state to emulated document being registered on chain and updated locally
      const updateRequest: UpdateDocumentRequest = {
        id: uploadResponse.id,
        productId: uploadResponse.product.id,
        categoryId: uploadResponse.category.id,
        typeId: uploadResponse.type.id,
        state: DocumentState.Registered
      }

      const updateResponse = await testInstance
        .serverConnection()
        .patch(`products/${productId}/documents`, updateRequest)
      expect(updateResponse.status).toBe(200)

      const validInput: SendDocumentsRequestExtended = {
        documents: [uploadResponse.id],
        companyId: fixtureCompanyId,
        reviewNotRequired: true,
        context: {}
      }

      await testInstance.mockServer().mockAnyResponse({
        httpRequest: {
          method: 'GET',
          path: testInstance.apiRoutes().registry.getMembers
        },
        httpResponse: {
          body: JSON.stringify(members)
        }
      })

      await testInstance.mockServer().mockAnyResponse({
        httpRequest: {
          method: 'PATCH',
          path: testInstance.apiRoutes().notif.tasks
        },
        httpResponse: {
          body: JSON.stringify(members)
        }
      })

      const response = await testInstance
        .serverConnection()
        .post(`products/${productId}/send-documents/internal`, validInput)
      expect(response.data.length).toBeGreaterThan(0)

      const actual: IDocumentResponse = response.data[0]
      expect(actual).toBeDefined()
      expect(actual.id).toBe(uploadResponse.id) // same doc that we registered
      expect(actual.state).toBe(updateResponse.data.state)
    })

    it('fails to send pending document and reports correctly', async () => {
      const uploadResponse: IFullDocumentResponse = await uploadSampleFile(
        sampleFilePath,
        { productId, categoryId, typeId },
        testInstance,
        fixtureDocumentHash
      )

      await waitForExpect(async () => {
        expect(uploadResponse.id).toBeDefined()
      })

      await testInstance.mockServer().reset()

      const validInput: SendDocumentsRequestExtended = {
        documents: [uploadResponse.id],
        companyId: fixtureCompanyId,
        reviewNotRequired: true,
        context: {}
      }

      await testInstance.mockServer().mockAnyResponse({
        httpRequest: {
          method: 'GET',
          path: testInstance.apiRoutes().registry.getMembers
        },
        httpResponse: {
          body: JSON.stringify(members)
        }
      })

      await testInstance.mockServer().mockAnyResponse({
        httpRequest: {
          method: 'PATCH',
          path: testInstance.apiRoutes().notif.tasks
        },
        httpResponse: {
          body: JSON.stringify(members)
        }
      })

      try {
        await testInstance.serverConnection().post(`products/${productId}/send-documents`, validInput)
      } catch (e) {
        expect(e.response.status).toBe(400)
        expect(e.response.data.message).toBe(`The documents ${uploadResponse.name} are not yet registered`)
      }
    })

    it('Get sent documents by request id', async () => {
      const response = await test.instance.serverConnection().get(`products/kyc/send-documents/${fixtureRequestId}`)
      expect(response.status).toBe(200)
      const expected = JSON.parse(
        fs.readFileSync(`${__dirname}/expecteddata/shared-documents-by-request-id.json`, 'utf8')
      )
      expect(response.data).toEqual(expected)
    })
  }
)
