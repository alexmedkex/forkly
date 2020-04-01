import 'reflect-metadata'
import { axiosMock, postAPI, getAPI } from './utils/axios-utils'

import { MESSAGE_TYPE } from '../src/business-layer/messaging/MessageTypes'
import { STATUSES } from '../src/data-layer/constants/Status'
import { ICompanyCoverageDataAgent } from '../src/data-layer/data-agents/ICompanyCoverageDataAgent'
import { TYPES } from '../src/inversify/types'
import { members } from './sampledata/members'
import { generateRandomString, IntegrationEnvironment, sleep } from './utils/environment'

// tslint:disable-next-line:no-implicit-dependencies
const waitForExpect = require('wait-for-expect')

let coverageDataAgent: ICompanyCoverageDataAgent
const integrationEnvironment: IntegrationEnvironment = new IntegrationEnvironment()
jest.setTimeout(90000)

describe('Approve counterparty', () => {
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

  /**
   * Company receives connect request
   * Company approve request, message is sent to requester company
   * Message is lost for any reason
   * When requester company resend connect request, request approved message is sent
   */
  it('resend request approved', async () => {
    const senderCompanyStaticId = members[1].staticId
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

    await integrationEnvironment.consumer.startListen(MESSAGE_TYPE.ApproveConnectRequest)
    await postAPI(`counterparties/${senderCompanyStaticId}/approve`)
    await waitForExpect(async () => {
      await integrationEnvironment.consumer.expectMessage(MESSAGE_TYPE.ApproveConnectRequest, {
        data: {
          requesterCompanyId: senderCompanyStaticId,
          receiverCompanyId: memberCompanyId,
          requestId
        }
      })
    })
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
    await waitForExpect(async () => {
      const messages = await integrationEnvironment.consumer.getReceivedMessages(MESSAGE_TYPE.ApproveConnectRequest, {
        data: {
          requesterCompanyId: senderCompanyStaticId,
          receiverCompanyId: memberCompanyId,
          requestId
        }
      })
      expect(messages.length).toEqual(2)
    })
  })

  /**
   * Company receives connect request
   * Company rejects request, message is sent to requester company
   * Message is lost for any reason
   * When requester company resend connect request, request rejected message is sent
   */
  it('resend reject request', async () => {
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

    await integrationEnvironment.consumer.startListen(MESSAGE_TYPE.RejectConnectRequest)
    await postAPI(`counterparties/${senderCompanyStaticId}/reject`)

    await waitForExpect(async () => {
      await integrationEnvironment.consumer.expectMessage(MESSAGE_TYPE.RejectConnectRequest, {
        data: {
          requesterCompanyId: senderCompanyStaticId,
          receiverCompanyId: memberCompanyId,
          requestId
        }
      })
    })

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
    await waitForExpect(async () => {
      const messages = await integrationEnvironment.consumer.getReceivedMessages(MESSAGE_TYPE.RejectConnectRequest, {
        data: {
          requesterCompanyId: senderCompanyStaticId,
          receiverCompanyId: memberCompanyId,
          requestId
        }
      })
      expect(messages.length).toEqual(2)
    })
  })

  /**
   * Company 1 sends to Company 2 connect request
   * message is lost for some reason
   * Company 1 have in db that request is pending
   * Company 2 does not have request stored in db
   * When Company 2 send connect request to Company 1
   * Company 2 is added as counterparty in Company 1 db
   * Message that request is approved is sent to Company 2
   */
  it('mutual connect request', async () => {
    const memberCompanyId = members[0].staticId
    const companyId = members[4].staticId
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
          requesterCompanyId: memberCompanyId,
          receiverCompanyId: companyId,
          requestId: dbCounterparty.coverageRequestId
        }
      })
    })

    const requestId = generateRandomString(5)
    await integrationEnvironment.publisher.publishCritical(MESSAGE_TYPE.ConnectRequest, {
      version: 1,
      messageType: MESSAGE_TYPE.ConnectRequest,
      context: {
        requestId
      },
      data: {
        requesterCompanyId: companyId,
        receiverCompanyId: memberCompanyId,
        requestId
      }
    })

    await sleep(2000)
    await waitForExpect(async () => {
      const response = await getAPI(`counterparties?query=${JSON.stringify({ staticId: companyId })}`)
      expect(response.data.length).toEqual(1)
      const counterparty = response.data.pop()
      expect(counterparty.staticId).toEqual(companyId)
      expect(counterparty.covered).toBeTruthy()
    })
  })

  /**
   * Company send connect request
   * Message is lost for any reason
   * Company resend connect request
   * Connect message with same request id is sent
   */
  it('resend connect request', async () => {
    const senderCompanyStaticId = members[0].staticId
    const companyId = members[5].staticId
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
    await postAPI(`counterparties/${companyId}/resend`)
    await waitForExpect(async () => {
      const messages = await integrationEnvironment.consumer.getReceivedMessages(MESSAGE_TYPE.ConnectRequest, {
        data: {
          requesterCompanyId: senderCompanyStaticId,
          receiverCompanyId: companyId,
          requestId: dbCounterparty.coverageRequestId
        }
      })
      expect(messages.length).toEqual(2)
    })
  })
})
