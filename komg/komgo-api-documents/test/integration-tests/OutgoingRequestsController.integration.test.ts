import { AMQPConfig, AMQPUtility, waitUntilTrue } from '@komgo/integration-test-utilities'
import { MessagingFactory } from '@komgo/messaging-library'
import * as fs from 'fs'
import waitForExpect from 'wait-for-expect'
import * as logger from 'winston'

import { CreateOutgoingRequestRequest } from '../../src/service-layer/request/outgoing-request/CreateOutgoingRequestRequest'
import { IDocumentResponse } from '../../src/service-layer/responses/document'
import { IFullDocumentResponse } from '../../src/service-layer/responses/document/IFullDocumentResponse'
import { IOutgoingRequestResponse } from '../../src/service-layer/responses/request/IRequestResponse'

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
import { createInternalQueues, deleteInternalMQs, loadEnvironmentVariables } from './utils/utils'

loadEnvironmentVariables()

integrationTest(
  'Outgoing Requests Controller Integration',
  [TestContainer.Mongo, TestContainer.RabbitMQ, TestContainer.MockServer, TestContainer.Ganache],
  test => {
    const amqpConfig = new AMQPConfig()

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
      } catch (error) {
        logger.error('Before each failed', error.message)
      }
    })

    afterEach(async () => {
      try {
        await consumer.close()
        const mockedIds = testInstance.rabbitMqConfig()
        await deleteInternalMQs(mockedIds, amqpConfig)
      } catch (error) {
        logger.error('After each failed ', error.message)
      }
    })

    it('Get outgoing request by product id', async done => {
      const response = await testInstance.serverConnection().get(`products/kyc/outgoing-requests`)
      expect(response.status).toBe(200)
      const expected = JSON.parse(
        fs.readFileSync(`${__dirname}/expecteddata/outgoing-requests-by-product.json`, 'utf8')
      )
      expect(response.data).toEqual(expected)
      done()
    })

    it('Get outgoing request by request id', async done => {
      const response = await testInstance
        .serverConnection()
        .get(`products/kyc/outgoing-requests/f049c0e0-5550-4744-bd1d-a09ec50f1b9f`)
      expect(response.status).toBe(200)
      const expected = JSON.parse(fs.readFileSync(`${__dirname}/expecteddata/outgoing-requests-by-id.json`, 'utf8'))
      expect(response.data).toEqual(expected)
      done()
    })

    it('Get outgoing request by unknown request id should return 404', async done => {
      const statusCode = await new Promise(async resolve => {
        try {
          const response = await testInstance
            .serverConnection()
            .get(`products/kyc/outgoing-requests/this-does-not-exist`)
          resolve(response.status)
        } catch (e) {
          resolve(e.response.status)
        }
      })
      expect(statusCode).toBe(404)
      done()
    })

    it('Post outgoing request with form attached', async done => {
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

      const createOutgoingRequest: CreateOutgoingRequestRequest = {
        companyId: fixtureCompanyId,
        types: [uploadResponse.type.id],
        forms: [uploadResponse.id]
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
        const response = await testInstance
          .serverConnection()
          .post('products/kyc/outgoing-requests', createOutgoingRequest)
        expect(response.status).toBe(200)
        const outgoingRequestResponse: IOutgoingRequestResponse = response.data
        expect(outgoingRequestResponse).toBeDefined()
        expect(outgoingRequestResponse.types[0]).toBe(uploadResponse.type.id)
        expect(outgoingRequestResponse.forms[0]).toBe(uploadResponse.id)
      })

      done()
    })
  }
)
