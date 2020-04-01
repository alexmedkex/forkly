import { CreditLineRequestStatus, Currency, DepositLoanPeriod, DepositLoanType } from '@komgo/types'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { FeatureType } from '../src/business-layer/enums/feature'
import {
  IDepositLoanRequestMessage,
  IDepositLoanRequestPayload
} from '../src/business-layer/messaging/messages/IDepositLoanMessage'
import { MessageType } from '../src/business-layer/messaging/MessageTypes'

import { members } from './sampledata/members'
import { axiosMock, postAPI, getAPI, putAPI, deleteAPI } from './utils/axios-utils'
import { IntegrationEnvironment, sleep } from './utils/environment'

const waitForExpect = require('wait-for-expect')

let requesterCompanyStaticId
const financialInstitutionStaticId = uuid4()

const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

let requestMessage: IDepositLoanRequestMessage<IDepositLoanRequestPayload>

describe('Recieved deposit loan requests', () => {
  beforeAll(async () => {
    await integrationEnvironment.start(financialInstitutionStaticId)
  })
  afterAll(async () => {
    await integrationEnvironment.stop(axiosMock)
  })
  beforeEach(async () => {
    requesterCompanyStaticId = uuid4()

    requestMessage = {
      version: 1,
      featureType: FeatureType.Deposit,
      companyStaticId: requesterCompanyStaticId,
      recepientStaticId: financialInstitutionStaticId,
      messageType: MessageType.CreditLineRequest,
      payload: {
        comment: 'test comment',
        currency: Currency.USD,
        period: DepositLoanPeriod.Months,
        periodDuration: 1,
        type: DepositLoanType.Deposit
      }
    }
    const companies = members.concat([
      {
        ...members[1],
        staticId: financialInstitutionStaticId,
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
    await integrationEnvironment.beforeEach(axiosMock, companies)
    await integrationEnvironment.consumer.startListen(MessageType.CreditLineRequest)
  })

  afterEach(async () => {
    await integrationEnvironment.afterEach()
  })

  it('should successfully receive deposit loan request, query and receive task', async () => {
    requestMessage.payload.periodDuration = 1
    await integrationEnvironment.publisher.publishCritical(MessageType.CreditLineRequest, requestMessage)

    await sleep(1000)

    const query = {
      currency: Currency.USD,
      period: DepositLoanPeriod.Months,
      periodDuration: 1
    }
    await waitForExpect(async () => {
      const requests = await getAPI<any>(
        `deposit-loan-requests/deposit/request-type/received?query=${JSON.stringify(query)}`
      )
      expect(requests.data).not.toBeNull()
      expect(requests.data[0].companyStaticId).toEqual(requestMessage.companyStaticId)

      const reg = new RegExp(`.*api-notif:8080/v0/tasks.*`)
      expect(axiosMock.history.post.length).toBeGreaterThanOrEqual(1)
      const taskRequest = axiosMock.history.post.find(x => reg.test(x.url))
      expect(taskRequest).not.toBeNull()
      expect(JSON.parse(taskRequest.data)).toMatchObject({
        task: {
          taskType: 'CL.DepositLoan.ReviewRequest',
          counterpartyStaticId: requestMessage.companyStaticId,
          context: {
            currency: Currency.USD,
            period: DepositLoanPeriod.Months,
            periodDuration: 1,
            type: DepositLoanType.Deposit
          }
        }
      })
    })
  })

  it('should throw error if deposit loan not found by staticId', async () => {
    await expect(
      getAPI<any>(`deposit-loan-requests/deposit/request-type/received/wrongStaticId`)
    ).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT01', message: 'MissingDepositLoanRequestDataForStaticId' } }
    })
  })

  it('should not save request on company not found', async () => {
    requestMessage.companyStaticId = uuid4()

    requestMessage.payload.periodDuration = 2
    await integrationEnvironment.publisher.publishCritical(MessageType.CreditLineRequest, requestMessage)

    await sleep(1000)

    const query = {
      currency: Currency.USD,
      period: DepositLoanPeriod.Months,
      periodDuration: 2
    }
    await waitForExpect(async () => {
      const requests = await getAPI<any>(
        `deposit-loan-requests/deposit/request-type/received?query=${JSON.stringify(query)}`
      )
      expect(requests.data).not.toBeNull()
      expect(requests.data).toEqual([])
    })
  })

  it('should decline requests', async () => {
    requestMessage.payload.periodDuration = 3
    await integrationEnvironment.publisher.publishCritical(MessageType.CreditLineRequest, requestMessage)

    await sleep(1000)

    const query = {
      currency: Currency.USD,
      period: DepositLoanPeriod.Months,
      periodDuration: 3
    }

    await waitForExpect(async () => {
      const requests = await getAPI<any>(
        `deposit-loan-requests/deposit/request-type/received?query=${JSON.stringify(query)}`
      )
      expect(requests.data).not.toEqual([])
      const declineResult = await postAPI(`deposit-loan-requests/deposit/decline`, [requests.data[0].staticId])
      expect(declineResult.status).toEqual(204)

      const declinedRequests = await getAPI<any>(
        `deposit-loan-requests/deposit/request-type/received/${requests.data[0].staticId}`
      )
      expect(declinedRequests.data).not.toBeNull()
      expect(declinedRequests.data.status).toEqual(CreditLineRequestStatus.Declined)
    })
  })
})
