import { ICreditLineSaveRequest, Currency, ICreditLineResponse, ICreateCreditLineRequest } from '@komgo/types'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { MessageType } from '../src/business-layer/messaging/MessageTypes'

import { members } from './sampledata/members'
import { axiosMock, postAPI, getAPI } from './utils/axios-utils'
import { IntegrationEnvironment, sleep } from './utils/environment'

const waitForExpect = require('wait-for-expect')

const requesterCompanyStaticId = uuid4()
let counterpartyStaticId
let requestFromCompanyStaticId

const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

let createRequest: ICreateCreditLineRequest

const expectMessage = async (routingKey, message) => {
  await waitForExpect(async () => {
    await integrationEnvironment.consumer.expectMessage(routingKey, message)
  })
}

describe('Credit line requests - sent', () => {
  beforeAll(async () => {
    await integrationEnvironment.start(requesterCompanyStaticId)
  })
  afterAll(async () => {
    await integrationEnvironment.stop(axiosMock)
  })
  beforeEach(async () => {
    counterpartyStaticId = uuid4()
    requestFromCompanyStaticId = uuid4()

    const companies = members.concat([
      {
        ...members[1],
        staticId: counterpartyStaticId,
        isFinancialInstitution: false,
        vaktStaticId: uuid4(),
        komgoMnid: uuid4()
      },
      {
        ...members[1],
        staticId: requestFromCompanyStaticId,
        isFinancialInstitution: true,
        vaktStaticId: uuid4(),
        komgoMnid: uuid4()
      },
      {
        ...members[1],
        staticId: requesterCompanyStaticId,
        isFinancialInstitution: false,
        vaktStaticId: uuid4(),
        komgoMnid: uuid4()
      }
    ])
    createRequest = {
      counterpartyStaticId,
      context: {
        productId: 'tradeFinance',
        subProductId: 'rd'
      },
      comment: 'some comment',
      companyIds: [requestFromCompanyStaticId]
    }
    await integrationEnvironment.beforeEach(axiosMock, companies)
    await integrationEnvironment.consumer.startListen(MessageType.CreditLineRequest)
  })

  afterEach(async () => {
    await integrationEnvironment.afterEach()
  })

  it('should successfully create and get credit line request', async () => {
    const result = await postAPI(`requests/product/tradeFinance/sub-product/rd`, createRequest)
    await sleep(1000)

    const requestStaticId = result.data[0]

    await waitForExpect(async () => {
      const request = await getAPI<any>(`requests/sent/${result.data}`)
      expect(request.data).not.toBeNull()
      expect(requestStaticId).toEqual(request.data.staticId)
    })

    await expectMessage(MessageType.CreditLineRequest, {
      recepientStaticId: requestFromCompanyStaticId,
      counterpartyStaticId,
      context: createRequest.context,
      comment: createRequest.comment,
      companyStaticId: requesterCompanyStaticId
    })
  })

  it('should return counterparty sent credit lines requests', async () => {
    const result = await postAPI(`requests/product/tradeFinance/sub-product/rd`, createRequest)
    const creditLines = await getAPI<any>(
      `requests/product/tradeFinance/sub-product/rd/${createRequest.counterpartyStaticId}/sent`
    )

    expect(result.data[0]).toEqual(creditLines.data[creditLines.data.length - 1].staticId)
  })

  it('should successfully get credit lines sent requests by productId, subproductId and counterpartyStatisId.', async () => {
    await postAPI(`requests/product/tradeFinance/sub-product/rd`, createRequest)

    const requests = await getAPI<any>(
      `requests/${createRequest.context.productId}/sub-product/${createRequest.context.subProductId}/${createRequest.counterpartyStaticId}/sent`
    )
    expect(requests.data[0]).toMatchObject({
      context: createRequest.context,
      counterpartyStaticId: createRequest.counterpartyStaticId
    })
  })

  it('should throw bad request on counterparty not found', async () => {
    createRequest.counterpartyStaticId = uuid4()

    await expect(postAPI(`requests/product/tradeFinance/sub-product/rd`, createRequest)).rejects.toMatchObject({
      response: { status: 400, data: { errorCode: 'EDAT02' } }
    })
  })

  it('should throw bad request on company not found', async () => {
    createRequest.companyIds = [uuid4()]

    await expect(postAPI(`requests/product/tradeFinance/sub-product/rd`, createRequest)).rejects.toMatchObject({
      response: { status: 400, data: { errorCode: 'EDAT02' } }
    })
  })

  it('should throw error if credit line not found by staticId', async () => {
    await expect(getAPI<any>(`requests/sent/wrongStaticId`)).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT01', message: 'MissingCreditLineRequestForStaticId' } }
    })
  })
})
