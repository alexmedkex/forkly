import { Currency, ISaveDepositLoanRequest, DepositLoanType, DepositLoanPeriod } from '@komgo/types'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { FeatureType } from '../src/business-layer/enums/feature'
import { MessageType } from '../src/business-layer/messaging/MessageTypes'

import { members } from './sampledata/members'
import { axiosMock, postAPI, getAPI } from './utils/axios-utils'
import { IntegrationEnvironment, sleep } from './utils/environment'

const waitForExpect = require('wait-for-expect')

const requesterCompanyStaticId = uuid4()
let requestFromCompanyStaticId

const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

let createRequest: ISaveDepositLoanRequest

const expectMessage = async (routingKey, message) => {
  await waitForExpect(async () => {
    await integrationEnvironment.consumer.expectMessage(routingKey, message)
  })
}

describe('Deposit loan requests - sent', () => {
  beforeAll(async () => {
    await integrationEnvironment.start(requesterCompanyStaticId)
  })
  afterAll(async () => {
    await integrationEnvironment.stop(axiosMock)
  })
  beforeEach(async () => {
    requestFromCompanyStaticId = uuid4()

    const companies = members.concat([
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
      type: DepositLoanType.Deposit,
      currency: Currency.USD,
      period: DepositLoanPeriod.Months,
      periodDuration: 1,
      comment: 'some comment',
      companyIds: [requestFromCompanyStaticId]
    }
    await integrationEnvironment.beforeEach(axiosMock, companies)
    await integrationEnvironment.consumer.startListen(MessageType.CreditLineRequest)
  })

  afterEach(async () => {
    await integrationEnvironment.afterEach()
  })

  it('should successfully create and get deposit loan request', async () => {
    createRequest.periodDuration = 1
    const result = await postAPI(`deposit-loan-requests/deposit`, createRequest)
    await sleep(1000)

    const requestStaticId = result.data[0]

    await waitForExpect(async () => {
      const request = await getAPI<any>(`deposit-loan-requests/deposit/request-type/requested/${requestStaticId}`)
      expect(request.data).not.toBeNull()
      expect(requestStaticId).toEqual(request.data.staticId)
    })

    await expectMessage(MessageType.CreditLineRequest, {
      version: 1,
      featureType: FeatureType.Deposit,
      companyStaticId: requesterCompanyStaticId,
      recepientStaticId: requestFromCompanyStaticId,
      messageType: MessageType.CreditLineRequest,
      payload: {
        comment: createRequest.comment,
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration: 1,
        type: DepositLoanType.Deposit
      }
    })
  })

  it('should successfully get deposit loans sent requests by period, periodDuration and request type', async () => {
    createRequest.periodDuration = 2
    const result = await postAPI(`deposit-loan-requests/deposit`, createRequest)
    await sleep(1000)

    const requests = await getAPI<any>(
      `deposit-loan-requests/deposit/currency/${createRequest.currency}/period/${createRequest.period}/period-duration/2/request-type/requested`
    )
    expect(requests.data[0]).toMatchObject({
      type: DepositLoanType.Deposit,
      currency: Currency.USD,
      period: DepositLoanPeriod.Months,
      periodDuration: 2,
      comment: 'some comment'
    })
  })

  it('should throw error if deposit loan not found by staticId', async () => {
    await expect(
      getAPI<any>(`deposit-loan-requests/deposit/request-type/requested/wrongStaticId`)
    ).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT01', message: 'MissingDepositLoanRequestDataForStaticId' } }
    })
  })

  it('should successfully create and query deposit loan request', async () => {
    createRequest.periodDuration = 3
    const result = await postAPI(`deposit-loan-requests/deposit`, createRequest)
    await sleep(1000)

    // const requestStaticId = result.data[0]

    await waitForExpect(async () => {
      const query = {
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration: 3
      }
      const requests = await getAPI<any>(
        `deposit-loan-requests/deposit/request-type/requested?query=${JSON.stringify(query)}`
      )
      expect(requests.data).not.toBeNull()
      expect(requests.data[0].companyStaticId).toEqual(createRequest.companyIds[0])
    })
  })
})
