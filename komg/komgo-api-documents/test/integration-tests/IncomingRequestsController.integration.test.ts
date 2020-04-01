import { loadEnvironmentVariables } from './utils/utils'
loadEnvironmentVariables()

import { runFixtures } from './utils/fixtures'
import { integrationTest } from './utils/integration-test'
import { TestContainer } from './utils/TestContainer'

import { IFullIncomingRequestResponse } from '../../src/service-layer/responses/incoming-request/IFullIncomingRequestResponse'

import * as fs from 'fs'
import { DismissTypeRequest } from '../../src/service-layer/request/incoming-request'

integrationTest('Incoming Requests Controller Integration', [TestContainer.Mongo, TestContainer.MockServer], test => {
  beforeEach(async () => {
    await runFixtures({
      dir: __dirname + '/fixtures',
      filter: '.*',
      mongoDbUrl: test.instance.mongoDbUrl()
    })
  })

  it('Get incoming request by product id', async done => {
    const response = await test.instance.serverConnection().get(`products/kyc/incoming-requests`)
    expect(response.status).toBe(200)
    const expected = JSON.parse(fs.readFileSync(`${__dirname}/expecteddata/incoming-requests-by-product.json`, 'utf8'))
    expect(response.data).toEqual(expected)
    done()
  })

  it('Get incoming request by request id', async done => {
    const response = await test.instance
      .serverConnection()
      .get(`products/kyc/incoming-requests/944a11ca-0f1c-45e5-8a95-a1000a3e21d0`)
    expect(response.status).toBe(200)
    const expected = JSON.parse(fs.readFileSync(`${__dirname}/expecteddata/incoming-requests-by-id.json`, 'utf8'))
    expect(response.data).toEqual(expected)
    done()
  })

  it('Get incoming request by unknown request id should return 404', async done => {
    const statusCode = await new Promise(async resolve => {
      try {
        const response = await test.instance
          .serverConnection()
          .get(`products/kyc/incoming-requests/this-does-not-exist`)
        resolve(response.status)
      } catch (e) {
        resolve(e.response.status)
      }
    })
    expect(statusCode).toBe(404)
    done()
  })

  it('Patch incoming request with dismissed type message', async done => {
    const dismissTypeRequest: DismissTypeRequest = {
      typeId: 'passport-of-directors',
      content: 'it is dismissed!',
      date: new Date(0)
    }

    const response = await test.instance
      .serverConnection()
      .patch('products/kyc/incoming-requests/944a11ca-0f1c-45e5-8a95-a1000a3e21d0/dismiss-type', dismissTypeRequest)
    expect(response.status).toBe(200)
    const fullIncomingRequestResponse: IFullIncomingRequestResponse = response.data
    expect(fullIncomingRequestResponse).toBeDefined()
    const receivedDismissedType = fullIncomingRequestResponse.dismissedTypes[0]
    // We parse it for the date (it is a string because of the JSON fixture)
    const parsedDateDismissTypeRequest = {
      ...dismissTypeRequest,
      date: JSON.parse(JSON.stringify(dismissTypeRequest.date))
    }
    expect(receivedDismissedType).toEqual(parsedDateDismissTypeRequest)

    done()
  })
})
