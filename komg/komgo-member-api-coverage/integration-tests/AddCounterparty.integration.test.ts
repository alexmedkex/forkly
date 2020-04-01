import 'reflect-metadata'
import { axiosMock, postAPI } from './utils/axios-utils'

import { MESSAGE_TYPE } from '../src/business-layer/messaging/MessageTypes'
import { STATUSES } from '../src/data-layer/constants/Status'
import { ICompanyCoverageDataAgent } from '../src/data-layer/data-agents/ICompanyCoverageDataAgent'
import { members } from './sampledata/members'
import { generateRandomString, IntegrationEnvironment, sleep } from './utils/environment'
import { TYPES } from '../src/inversify/types'
import { apiroutes } from './utils/apiroutes'

const waitForExpect = require('wait-for-expect')
let coverageDataAgent: ICompanyCoverageDataAgent
const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

describe('AddCounterparty', () => {
  beforeAll(async () => {
    await integrationEnvironment.start(members[0].staticId)
    coverageDataAgent = integrationEnvironment.container.get<ICompanyCoverageDataAgent>(TYPES.CompanyCoverageDataAgent)
  })

  afterAll(async () => {
    await integrationEnvironment.stop(axiosMock)
  })

  beforeEach(async () => {
    await integrationEnvironment.beforeEach(axiosMock)
  })
  afterEach(async () => {
    await integrationEnvironment.afterEach(axiosMock)
  })

  it('send connect request', async () => {
    const senderCompanyStaticId = members[0].staticId
    const companyId = members[1].staticId
    await integrationEnvironment.consumer.startListen(MESSAGE_TYPE.ConnectRequest)

    await postAPI(`counterparties/${companyId}/add`)

    let dbCounterparty
    await waitForExpect(async () => {
      dbCounterparty = await coverageDataAgent.findOne({
        companyId,
        status: STATUSES.PENDING
      })

      expect(dbCounterparty).not.toBeNull()
      expect(dbCounterparty.companyId).toEqual(companyId)

      await integrationEnvironment.consumer.expectMessage(MESSAGE_TYPE.ConnectRequest, {
        data: {
          requesterCompanyId: senderCompanyStaticId,
          receiverCompanyId: companyId,
          requestId: dbCounterparty.coverageRequestId
        }
      })
    })
  })

  it('receive connect request', async () => {
    const senderCompanyStaticId = members[2].staticId
    const memberCompanyId = members[0].staticId
    const requestId = generateRandomString(5)
    await integrationEnvironment.publisher.publishCritical(MESSAGE_TYPE.ConnectRequest, {
      version: 1,
      messageType: MESSAGE_TYPE.ConnectRequest,
      context: {
        requestId
      },
      data: {
        requesterCompanyId: senderCompanyStaticId,
        receiverCompanyId: memberCompanyId,
        requestId
      }
    })

    await sleep(5000)

    await waitForExpect(async () => {
      const dbRequest = await coverageDataAgent.findOne({
        companyId: senderCompanyStaticId,
        covered: false,
        status: STATUSES.WAITING,
        coverageRequestId: requestId
      })

      expect(dbRequest).not.toBeNull()
      expect(dbRequest.coverageRequestId).toEqual(requestId)
    })
  })

  it.skip('receive multiple connect request', async () => {
    const senderCompanyStaticId = members[3].staticId
    const memberCompanyId = members[0].staticId
    const requestId = generateRandomString(5)
    await integrationEnvironment.publisher.publishCritical(MESSAGE_TYPE.ConnectRequest, {
      version: 1,
      messageType: MESSAGE_TYPE.ConnectRequest,
      context: {
        requestId
      },
      data: {
        requesterCompanyId: senderCompanyStaticId,
        receiverCompanyId: memberCompanyId,
        requestId
      }
    })

    await sleep(1000)

    const publishMessage = []
    for (let i = 0; i < 10; i++) {
      publishMessage.push(
        integrationEnvironment.publisher.publishCritical(MESSAGE_TYPE.ConnectRequest, {
          version: 1,
          messageType: MESSAGE_TYPE.ConnectRequest,
          context: {
            requestId
          },
          data: {
            requesterCompanyId: senderCompanyStaticId,
            receiverCompanyId: memberCompanyId,
            requestId
          }
        })
      )
    }

    await Promise.all(publishMessage)

    await waitForExpect(async () => {
      const dbRequest = await coverageDataAgent.find({
        companyId: senderCompanyStaticId,
        covered: false,
        status: STATUSES.WAITING,
        coverageRequestId: requestId
      })

      expect(dbRequest).not.toBeNull()
      expect(dbRequest.length).toEqual(1)
      expect(dbRequest[0].coverageRequestId).toEqual(requestId)
    })
  })

  it('send multiple connect request', async () => {
    const senderCompanyStaticId = members[0].staticId
    const companyId = members[4].staticId
    await integrationEnvironment.consumer.startListen(MESSAGE_TYPE.ConnectRequest)

    await postAPI(`counterparties/${companyId}/add`)

    const sendRequest = []
    for (let i = 0; i < 10; i++) {
      sendRequest.push(
        new Promise(async (resolve, reject) => {
          await postAPI(`counterparties/${companyId}/add`)
            .then(() => resolve())
            .catch(e => {
              resolve()
            })
        })
      )
    }
    await Promise.all(sendRequest)

    await waitForExpect(async () => {
      const counterpartyRequests = await coverageDataAgent.find({
        companyId,
        status: STATUSES.PENDING
      })

      expect(counterpartyRequests).not.toBeNull()
      expect(counterpartyRequests.length).toEqual(1)
      expect(counterpartyRequests[0].companyId).toEqual(companyId)

      await integrationEnvironment.consumer.expectMessage(MESSAGE_TYPE.ConnectRequest, {
        data: {
          requesterCompanyId: senderCompanyStaticId,
          receiverCompanyId: companyId,
          requestId: counterpartyRequests[0].coverageRequestId
        }
      })
    })
  })

  it('send request - failed to fetch company', async () => {
    axiosMock.reset()
    axiosMock
      .onGet(apiroutes.registry.getMembers)
      .reply(500)
      .onPost(apiroutes.notification.create)
      .reply(200)

    // const senderCompanyStaticId = members[0].staticId
    const companyId = members[5].staticId
    // await consumer.startListen(MESSAGE_TYPE.ConnectRequest)

    // await expect(controller.add(companyId)).rejects.toThrowError(Error)
    await expect(postAPI(`counterparties/${companyId}/add`)).rejects.toThrowError(Error)

    await waitForExpect(async () => {
      const dbCounterparty = await coverageDataAgent.findOne({
        companyId,
        status: STATUSES.PENDING
      })

      expect(dbCounterparty).toBeNull()
    })
  })

  it('receive request - failed to fetch company', async () => {
    axiosMock.reset()
    axiosMock
      .onGet(apiroutes.registry.getMembers)
      .reply(500)
      .onPost(apiroutes.notification.create)
      .reply(200)
    const senderCompanyStaticId = members[5].staticId
    const memberCompanyId = members[0].staticId
    const requestId = generateRandomString(5)
    await integrationEnvironment.publisher.publishCritical(MESSAGE_TYPE.ConnectRequest, {
      version: 1,
      messageType: MESSAGE_TYPE.ConnectRequest,
      context: {
        requestId
      },
      data: {
        requesterCompanyId: senderCompanyStaticId,
        receiverCompanyId: memberCompanyId,
        requestId
      }
    })

    await sleep(5000)

    await waitForExpect(async () => {
      const dbCounterparty = await coverageDataAgent.findOne({
        companyId: senderCompanyStaticId,
        status: STATUSES.WAITING
      })

      expect(dbCounterparty).toBeNull()
    })
  })
})
