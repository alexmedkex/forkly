import { CreditLineRequestStatus, Currency } from '@komgo/types'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { FeatureType } from '../src/business-layer/enums/feature'
import { ICreditLineRequestMessage } from '../src/business-layer/messaging/messages/ICreditLineRequestMessage'
import { MessageType } from '../src/business-layer/messaging/MessageTypes'

import { members } from './sampledata/members'
import { axiosMock, postAPI, getAPI, putAPI, deleteAPI } from './utils/axios-utils'
import { IntegrationEnvironment, sleep } from './utils/environment'

const waitForExpect = require('wait-for-expect')

let requesterCompanyStaticId
let counterpartyStaticId
const financialInstitutionStaticId = uuid4()

const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

let requestMessage: ICreditLineRequestMessage

describe('Recieved credit line requests', () => {
  beforeAll(async () => {
    await integrationEnvironment.start(financialInstitutionStaticId)
  })
  afterAll(async () => {
    await integrationEnvironment.stop(axiosMock)
  })
  beforeEach(async () => {
    counterpartyStaticId = uuid4()
    requesterCompanyStaticId = uuid4()

    requestMessage = {
      version: 1,
      context: { productId: 'tradeFinance', subProductId: 'rd' },
      messageType: MessageType.CreditLineRequest,
      companyStaticId: requesterCompanyStaticId,
      counterpartyStaticId,
      recepientStaticId: financialInstitutionStaticId,
      comment: 'test comment',
      featureType: FeatureType.RiskCover
    }
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

  it('should successfully receive credit line request', async () => {
    await integrationEnvironment.publisher.publishCritical(MessageType.CreditLineRequest, requestMessage)

    await sleep(1000)

    await waitForExpect(async () => {
      const requests = await getAPI<any>(
        `requests/product/${requestMessage.context.productId}/sub-product/${requestMessage.context.subProductId}/${requestMessage.counterpartyStaticId}/received`
      )
      expect(requests.data).not.toBeNull()
      expect(requests.data[0].companyStaticId).toEqual(requestMessage.companyStaticId)

      const reg = new RegExp(`.*api-notif:8080/v0/tasks.*`)
      expect(axiosMock.history.post.length).toBeGreaterThanOrEqual(1)
      const taskRequest = axiosMock.history.post.find(x => reg.test(x.url))
      expect(taskRequest).not.toBeNull()
      expect(JSON.parse(taskRequest.data)).toMatchObject({
        task: {
          taskType: 'CL.ReviewRequest',
          counterpartyStaticId: requestMessage.companyStaticId,
          context: {
            productId: 'tradeFinance',
            subProductId: 'rd',
            counterpartyStaticId: requestMessage.counterpartyStaticId,
            companyStaticId: requestMessage.companyStaticId
          }
        }
      })
    })
  })

  it('should successfully query credit line request', async () => {
    await integrationEnvironment.publisher.publishCritical(MessageType.CreditLineRequest, requestMessage)

    await sleep(1000)

    const query = JSON.stringify({ companyStaticId: requestMessage.companyStaticId })
    await waitForExpect(async () => {
      const requests = await getAPI<any>(`requests/received/product/tradeFinance/sub-product/rd?query=${query}`)
      expect(requests.data).not.toBeNull()
      expect(requests.data[0].companyStaticId).toEqual(requestMessage.companyStaticId)
    })
  })

  it('should throw error if credit line not found by staticId', async () => {
    await expect(getAPI<any>(`requests/received/wrongStaticId`)).rejects.toMatchObject({
      response: { data: { errorCode: 'EDAT01', message: 'MissingCreditLineRequestForStaticId' } }
    })
  })

  it('should successfully receive - get by counterparty', async () => {
    await integrationEnvironment.publisher.publishCritical(MessageType.CreditLineRequest, requestMessage)

    await sleep(1000)

    await waitForExpect(async () => {
      const requests = await getAPI<any>(
        `requests/product/tradeFinance/sub-product/rd/${requestMessage.counterpartyStaticId}/received`
      )
      expect(requests.data).not.toBeNull()
      expect(requests.data[0].companyStaticId).toEqual(requestMessage.companyStaticId)
    })
  })

  it('should not save request on counterparty not found', async () => {
    requestMessage.counterpartyStaticId = uuid4()

    await integrationEnvironment.publisher.publishCritical(MessageType.CreditLineRequest, requestMessage)

    await sleep(1000)

    await waitForExpect(async () => {
      const requests = await getAPI<any>(
        `requests/product/tradeFinance/sub-product/rd/${requestMessage.counterpartyStaticId}/received`
      )
      expect(requests.data).toEqual([])
    })
  })

  it('should not save request on company not found', async () => {
    requestMessage.companyStaticId = uuid4()

    await integrationEnvironment.publisher.publishCritical(MessageType.CreditLineRequest, requestMessage)

    await sleep(1000)

    await waitForExpect(async () => {
      const requests = await getAPI<any>(
        `requests/product/tradeFinance/sub-product/rd/${requestMessage.counterpartyStaticId}/received`
      )
      expect(requests.data).toEqual([])
    })
  })

  it('should decline requests', async () => {
    await integrationEnvironment.publisher.publishCritical(MessageType.CreditLineRequest, requestMessage)

    await sleep(1000)

    await waitForExpect(async () => {
      const requests = await getAPI<any>(
        `requests/product/tradeFinance/sub-product/rd/${requestMessage.counterpartyStaticId}/received`
      )
      expect(requests.data).not.toEqual([])
      const declineResult = await postAPI(
        `requests/${requestMessage.context.productId}/sub-product/${requestMessage.context.subProductId}/${requestMessage.counterpartyStaticId}/decline`,
        [requests.data[0].staticId]
      )
      expect(declineResult.status).toEqual(204)

      const declinedRequests = await getAPI<any>(
        `requests/product/tradeFinance/sub-product/rd/${requestMessage.counterpartyStaticId}/received`
      )
      expect(declinedRequests.data).not.toEqual([])
      expect(declinedRequests.data[0].status).toEqual(CreditLineRequestStatus.Declined)
    })
  })

  it.skip('should disclose requests', async () => {
    await integrationEnvironment.publisher.publishCritical(MessageType.CreditLineRequest, requestMessage)

    await sleep(1000)

    const saveCreditLine = {
      counterpartyStaticId: requestMessage.counterpartyStaticId,
      context: requestMessage.context,
      appetite: true,
      currency: Currency.EUR,
      availability: true,
      availabilityAmount: 1000,
      sharedCreditLines: [
        {
          counterpartyStaticId: requestMessage.counterpartyStaticId,
          sharedWithStaticId: requestMessage.companyStaticId,
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

    await waitForExpect(async () => {
      const requests = await getAPI<any>(`requests/${requestMessage.counterpartyStaticId}/received`)
      expect(requests.data).not.toEqual([])
    })

    await postAPI(`credit-lines/product/tradeFinance/sub-product/rd`, saveCreditLine)

    await waitForExpect(async () => {
      const disclosedRequests = await getAPI<any>(`requests/${requestMessage.counterpartyStaticId}/received`)
      expect(disclosedRequests.data).not.toEqual([])
      expect(disclosedRequests.data[0].status).toEqual(CreditLineRequestStatus.Disclosed)
    })
  })
})
