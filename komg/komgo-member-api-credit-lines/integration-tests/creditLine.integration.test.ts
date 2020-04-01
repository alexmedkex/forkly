import { ICreditLineSaveRequest, Currency, ICreditLineResponse } from '@komgo/types'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { MessageType } from '../src/business-layer/messaging/MessageTypes'

import { members } from './sampledata/members'
import { axiosMock, postAPI, getAPI, putAPI, deleteAPI } from './utils/axios-utils'
import { IntegrationEnvironment, sleep } from './utils/environment'

const waitForExpect = require('wait-for-expect')

let counterpartyStaticId
let sharedWithStaticId

const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

let mockRequest: ICreditLineSaveRequest

const badCreditLineRequest = {
  counterpartyStaticId: 'bhic0fl3l6ji95hbmq92',
  context: {
    productId: 'tteaj98yb9625jw6h9ka'
  }
}

const expectMessage = async (routingKey, message) => {
  await waitForExpect(async () => {
    await integrationEnvironment.consumer.expectMessage(routingKey, message)
  })
}

describe('Create Credit Line', () => {
  beforeAll(async () => {
    await integrationEnvironment.start()
  })
  afterAll(async () => {
    await integrationEnvironment.stop(axiosMock)
  })
  beforeEach(async () => {
    counterpartyStaticId = uuid4()
    sharedWithStaticId = uuid4()

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
        staticId: sharedWithStaticId,
        isFinancialInstitution: false,
        vaktStaticId: uuid4(),
        komgoMnid: uuid4()
      }
    ])
    mockRequest = {
      counterpartyStaticId,
      context: {
        productId: 'tradeFinance',
        subProductId: 'rd'
      },
      appetite: true,
      currency: Currency.EUR,
      availability: true,
      availabilityAmount: 1000,
      sharedCreditLines: [
        {
          counterpartyStaticId,
          sharedWithStaticId,
          data: {
            appetite: {
              shared: true
            },
            availability: {
              shared: true
            },
            availabilityAmount: {
              shared: true
            }
          }
        }
      ],
      data: {}
    }
    await integrationEnvironment.beforeEach(axiosMock, companies)
    await integrationEnvironment.consumer.startListen(MessageType.ShareCreditLine)
    await integrationEnvironment.consumer.startListen(MessageType.RevokeCreditLine)
  })

  afterEach(async () => {
    await integrationEnvironment.afterEach()
  })

  it('should successfully create credit line', async () => {
    const result = await postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, mockRequest)
    await sleep(1000)

    await waitForExpect(async () => {
      const creditLine = await getAPI<any>(`credit-lines/${result.data}`)
      expect(creditLine.data).not.toBeNull()
      expect(result.data).toEqual(creditLine.data.staticId)
    })

    await expectMessage(MessageType.ShareCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        counterpartyStaticId,
        context: mockRequest.context
      }
    })
  })

  it('should throw bad request error when try create credit line', async () => {
    await expect(
      postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, badCreditLineRequest)
    ).rejects.toMatchObject({
      response: { data: { errorCode: 'EVAL01' } }
    })
  })

  it('should throw error if credit line not found by staticId', async () => {
    await expect(getAPI<any>(`credit-lines/wrongStaticId`)).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT01', message: 'MissingCreditLineDataForStaticId' } }
    })
  })

  it('return all credit lines', async () => {
    const result = await postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, mockRequest)
    const creditLines = await getAPI<any>(`credit-lines/product/tradeFinance/sub-product/rd`)

    expect(result.data).toEqual(creditLines.data[creditLines.data.length - 1].staticId)
  })

  it('should successfully get credit lines by productId, subproductId and counterpartyStatisId.', async () => {
    await postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, mockRequest)

    const getCreditLine = await getAPI<any>(
      `credit-lines/product/${mockRequest.context.productId}/sub-product/${mockRequest.context.subProductId}/${mockRequest.counterpartyStaticId}`
    )

    expect(getCreditLine.data.context.productId).toEqual(mockRequest.context.productId)
    expect(getCreditLine.data.context.subProductId).toEqual(mockRequest.context.subProductId)
    expect(getCreditLine.data.counterpartyStaticId).toEqual(mockRequest.counterpartyStaticId)
  })

  it('throw error on error filter', async () => {
    const filter = {
      failedFilter: false
    }

    await expect(
      getAPI<any>(`credit-lines/product/tradeFinance/sub-product/rd?query=${JSON.stringify(filter)}`)
    ).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT02', message: 'Filter querystring in not valid' } }
    })
  })

  it('should successfully delete credit line', async () => {
    const result = await postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, mockRequest)
    const deleted = await deleteAPI(`credit-lines/${result.data}`)

    expect(deleted.status).toEqual(204)

    await expectMessage(MessageType.RevokeCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        counterpartyStaticId,
        context: mockRequest.context
      }
    })
  })

  it('should not be able to delete credit line, because credit line not found', async () => {
    await expect(deleteAPI(`credit-lines/wrongStaticId`)).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT01', message: 'MissingCreditLineDataForStaticId' } }
    })
  })

  it('should successfully update credit lines', async () => {
    mockRequest.currency = Currency.EUR
    const result = await postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, mockRequest)
    await sleep(1000)

    const creditLine = await getAPI<ICreditLineResponse>(`credit-lines/${result.data}`)

    await expectMessage(MessageType.ShareCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        counterpartyStaticId,
        data: {
          appetite: true,
          availability: true,
          availabilityAmount: 1000,
          currency: Currency.EUR
        }
      }
    })

    mockRequest.availabilityAmount = 2000
    mockRequest.currency = Currency.USD
    mockRequest.sharedCreditLines[0].staticId = creditLine.data.sharedCreditLines[0].staticId
    const update = await putAPI<any>(`credit-lines/${result.data}`, mockRequest)
    await sleep(1000)
    const creditLines = await getAPI<any>(`credit-lines/${result.data}`)

    expect(update.status).toEqual(200)
    expect(creditLines.data.currency).toEqual(Currency.USD)

    await expectMessage(MessageType.ShareCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        counterpartyStaticId,
        data: {
          appetite: true,
          availability: true,
          availabilityAmount: 2000,
          currency: Currency.USD
        }
      }
    })
  })

  it('should throw an error when trying to update non existing credit lines', async () => {
    await expect(putAPI<any>(`credit-lines/wrongId`, mockRequest)).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT01', message: 'MissingCreditLineDataForStaticId' } }
    })
  })

  it('when not shared do not send', async () => {
    mockRequest.sharedCreditLines[0].data.appetite = { shared: false }
    const result = await postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, mockRequest)
    const creditLines = await getAPI<any>(`credit-lines/${result.data}`)

    expect(creditLines.data).not.toBeNull()
    sleep(4000)
    expect(
      await integrationEnvironment.consumer.getReceivedMessages(MessageType.ShareCreditLine, {
        recepientStaticId: sharedWithStaticId,
        counterpartyStaticId
      })
    ).toEqual([])
  })

  it('share on create appetite - false', async () => {
    mockRequest.appetite = false
    mockRequest.sharedCreditLines[0].data = { appetite: { shared: true } }
    const result = await postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, mockRequest)

    await expectMessage(MessageType.ShareCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        counterpartyStaticId,
        data: {
          appetite: false
        }
      }
    })
  })

  it('revoke shared - false', async () => {
    const result = await postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, mockRequest)

    await expectMessage(MessageType.ShareCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        counterpartyStaticId,
        data: {
          appetite: true,
          availability: true,
          availabilityAmount: 1000,
          currency: Currency.EUR
        }
      }
    })

    mockRequest.sharedCreditLines[0].data.appetite = { shared: false }

    const update = await putAPI<any>(`credit-lines/${result.data}`, mockRequest)
    const creditLines = await getAPI<any>(`credit-lines/${result.data}`)

    expect(update.status).toEqual(200)
    expect(creditLines.data).not.toBeNull()

    await expectMessage(MessageType.RevokeCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        counterpartyStaticId
      }
    })
  })

  it('revoke appetite - false', async () => {
    const result = await postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, mockRequest)

    await expectMessage(MessageType.ShareCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        counterpartyStaticId,
        data: {
          appetite: true,
          availability: true,
          availabilityAmount: 1000,
          currency: Currency.EUR
        }
      }
    })

    mockRequest.appetite = false
    const update = await putAPI<any>(`credit-lines/${result.data}`, mockRequest)
    const creditLines = await getAPI<any>(`credit-lines/${result.data}`)

    expect(update.status).toEqual(200)
    expect(creditLines.data).not.toBeNull()

    await expectMessage(MessageType.RevokeCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        counterpartyStaticId
      }
    })
  })
})
