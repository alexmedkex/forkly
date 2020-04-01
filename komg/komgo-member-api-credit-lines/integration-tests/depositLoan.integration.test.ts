import { Currency, ICreditLineResponse, ISaveDepositLoan, DepositLoanType, DepositLoanPeriod } from '@komgo/types'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { FeatureType } from '../src/business-layer/enums/feature'
import { MessageType } from '../src/business-layer/messaging/MessageTypes'

import { members } from './sampledata/members'
import { axiosMock, postAPI, getAPI, putAPI, deleteAPI } from './utils/axios-utils'
import { IntegrationEnvironment, sleep } from './utils/environment'

const waitForExpect = require('wait-for-expect')

const ownerStaticId = uuid4()
let sharedWithStaticId
const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

let mockRequest: ISaveDepositLoan

const badCreditLineRequest = {
  type: DepositLoanType.Deposit,
  currency: Currency.EUR,
  failedProperty: 'failed-property'
}

const expectMessage = async (routingKey, message) => {
  await waitForExpect(async () => {
    await integrationEnvironment.consumer.expectMessage(routingKey, message)
  })
}

describe('Deposit Loan', () => {
  beforeAll(async () => {
    await integrationEnvironment.start(ownerStaticId)
  })
  afterAll(async () => {
    await integrationEnvironment.stop(axiosMock)
  })
  beforeEach(async () => {
    sharedWithStaticId = uuid4()

    const companies = members.concat([
      {
        ...members[1],
        staticId: ownerStaticId,
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
      type: DepositLoanType.Deposit,
      currency: Currency.EUR,
      period: DepositLoanPeriod.Months,
      appetite: true,
      pricing: 1.0,
      sharedWith: [
        {
          sharedWithStaticId,
          appetite: {
            shared: true
          },
          pricing: {
            shared: true,
            pricing: 1.0
          }
        }
      ]
    }
    await integrationEnvironment.beforeEach(axiosMock, companies)
    await integrationEnvironment.consumer.startListen(MessageType.ShareCreditLine)
    await integrationEnvironment.consumer.startListen(MessageType.RevokeCreditLine)
  })

  afterEach(async () => {
    await integrationEnvironment.afterEach()
  })

  it('should successfully create deposit loan', async () => {
    const result = await postAPI(`deposit-loan/deposit`, { ...mockRequest, periodDuration: 1 })
    await sleep(1000)

    await waitForExpect(async () => {
      const depositLoan = await getAPI<any>(`deposit-loan/deposit/${result.data}`)
      expect(depositLoan.data).not.toBeNull()
      expect(result.data).toEqual(depositLoan.data.staticId)
    })

    await expectMessage(MessageType.ShareCreditLine, {
      recepientStaticId: sharedWithStaticId,
      ownerStaticId,
      featureType: FeatureType.Deposit,
      payload: {
        currency: mockRequest.currency,
        period: mockRequest.period,
        periodDuration: 1,
        type: mockRequest.type,
        data: {
          appetite: true,
          pricing: 1.0
        }
      }
    })
  })

  it('should throw bad request error when try create deposit loan', async () => {
    await expect(postAPI(`deposit-loan/deposit`, badCreditLineRequest)).rejects.toMatchObject({
      response: { data: { errorCode: 'EVAL01' } }
    })
  })

  it('should throw error if deposit loan not found by staticId', async () => {
    await expect(getAPI<any>(`deposit-loan/deposit/wrongStaticId`)).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT01', message: 'MissingDepositLoanDataForStaticId' } }
    })
  })

  it('return all deposit loans', async () => {
    const result = await postAPI(`deposit-loan/deposit`, { ...mockRequest, periodDuration: 2 })
    const depositLoans = await getAPI<any>(`deposit-loan/deposit?query={}`)
    expect(depositLoans.data.some(x => x.staticId === result.data)).toBeTruthy()
  })

  it('throw error on error filter', async () => {
    const filter = {
      failedFilter: false
    }

    await expect(getAPI<any>(`deposit-loan/deposit?query=${JSON.stringify(filter)}`)).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT02', message: 'Filter querystring in not valid' } }
    })
  })

  it('should successfully delete deposit loan', async () => {
    const result = await postAPI(`deposit-loan/deposit`, { ...mockRequest, periodDuration: 3 })
    const deleted = await deleteAPI(`deposit-loan/deposit/${result.data}`)

    expect(deleted.status).toEqual(204)
    const depositLoans = await getAPI<any>(`deposit-loan/deposit?query={}`)
    expect(depositLoans.data.some(x => x.staticId === result.data)).toBeFalsy()

    await expectMessage(MessageType.RevokeCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        currency: mockRequest.currency,
        period: mockRequest.period,
        periodDuration: 3,
        type: mockRequest.type
      }
    })
  })

  it('should not be able to delete deposit loan, because deposit loan not found', async () => {
    await expect(deleteAPI(`deposit-loan/deposit/wrongStaticId`)).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT01', message: 'MissingDepositLoanDataForStaticId' } }
    })
  })

  it('should successfully update deposit loans', async () => {
    const result = await postAPI(`deposit-loan/deposit`, { ...mockRequest, periodDuration: 6 })
    await sleep(1000)

    const depositLoan = await getAPI<ICreditLineResponse>(`deposit-loan/deposit/${result.data}`)
    expect(depositLoan.data).not.toBeNull()

    await expectMessage(MessageType.ShareCreditLine, {
      recepientStaticId: sharedWithStaticId,
      ownerStaticId,
      featureType: FeatureType.Deposit,
      payload: {
        currency: mockRequest.currency,
        period: mockRequest.period,
        periodDuration: 6,
        type: mockRequest.type,
        data: {
          appetite: true,
          pricing: 1.0
        }
      }
    })

    mockRequest.pricing = 2.0
    mockRequest.sharedWith[0].pricing.pricing = 2.0
    const update = await putAPI<any>(`deposit-loan/deposit/${result.data}`, { ...mockRequest, periodDuration: 6 })
    await sleep(1000)
    const depositLoans = await getAPI<any>(`deposit-loan/deposit/${result.data}`)

    expect(update.status).toEqual(200)
    expect(depositLoans.data.pricing).toEqual(2)

    await expectMessage(MessageType.ShareCreditLine, {
      recepientStaticId: sharedWithStaticId,
      ownerStaticId,
      featureType: FeatureType.Deposit,
      payload: {
        currency: mockRequest.currency,
        period: mockRequest.period,
        periodDuration: 6,
        type: mockRequest.type,
        data: {
          appetite: true,
          pricing: 2.0
        }
      }
    })
  })

  // it('should throw an error when trying to update non existing deposit loans', async () => {
  //   await expect(putAPI<any>(`deposit-loan/deposit/wrongId`, mockRequest)).rejects.toMatchObject({
  //     response: { data: { errorCode: 'EDAT01', message: 'DepositLoanUpdateFailed' } }
  //   })
  // })

  it('revoke appetite - false', async () => {
    const result = await postAPI(`deposit-loan/deposit`, { ...mockRequest, periodDuration: 12 })
    await sleep(1000)

    await expectMessage(MessageType.ShareCreditLine, {
      recepientStaticId: sharedWithStaticId,
      ownerStaticId,
      featureType: FeatureType.Deposit,
      payload: {
        currency: mockRequest.currency,
        period: mockRequest.period,
        periodDuration: 12,
        type: mockRequest.type,
        data: {
          appetite: true,
          pricing: 1.0
        }
      }
    })

    mockRequest.appetite = false
    mockRequest.sharedWith[0].appetite.shared = false
    const update = await putAPI<any>(`deposit-loan/deposit/${result.data}`, { ...mockRequest, periodDuration: 12 })
    await sleep(1000)
    const depositLoans = await getAPI<any>(`deposit-loan/deposit/${result.data}`)

    expect(update.status).toEqual(200)
    expect(depositLoans.data).not.toBeNull()

    await expectMessage(MessageType.RevokeCreditLine, {
      recepientStaticId: sharedWithStaticId,
      payload: {
        currency: mockRequest.currency,
        period: mockRequest.period,
        periodDuration: 12,
        type: mockRequest.type
      }
    })
  })
})
