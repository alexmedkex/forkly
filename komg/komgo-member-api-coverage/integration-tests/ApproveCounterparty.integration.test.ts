import 'reflect-metadata'
import { axiosMock, postAPI } from './utils/axios-utils'

import { MESSAGE_TYPE } from '../src/business-layer/messaging/MessageTypes'
import { STATUSES } from '../src/data-layer/constants/Status'
import { ICompanyCoverageDataAgent } from '../src/data-layer/data-agents/ICompanyCoverageDataAgent'
import { TYPES } from '../src/inversify/types'
import { members } from './sampledata/members'
import { apiroutes } from './utils/apiroutes'
import { generateRandomString, IntegrationEnvironment } from './utils/environment'

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

  it('send approve request', async () => {
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
  })

  it('send approve - fail company fetch', async () => {
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
    axiosMock.reset()
    axiosMock
      .onGet(apiroutes.registry.getMembers)
      .reply(500)
      .onPost(apiroutes.notification.create)
      .reply(200)
    await expect(postAPI(`counterparties/${senderCompanyStaticId}/approve`)).rejects.toThrowError(Error)
  })

  it('receive request approved', async () => {
    const senderCompanyStaticId = members[0].staticId
    const companyId = members[2].staticId

    await postAPI(`counterparties/${companyId}/add`)
    let dbCounterparty
    await waitForExpect(async () => {
      dbCounterparty = await coverageDataAgent.findOne({
        companyId,
        status: STATUSES.PENDING
      })

      expect(dbCounterparty).not.toBeNull()
    })
    const requestId = dbCounterparty.coverageRequestId
    await integrationEnvironment.publisher.publishCritical(MESSAGE_TYPE.ApproveConnectRequest, {
      version: 1,
      messageType: MESSAGE_TYPE.ApproveConnectRequest,
      context: {
        requestId
      },
      data: {
        requesterCompanyId: senderCompanyStaticId,
        receiverCompanyId: companyId,
        requestId
      }
    })

    await waitForExpect(async () => {
      const approvedRequest = await coverageDataAgent.findOne({
        companyId,
        status: STATUSES.COMPLETED,
        coverageRequestId: requestId
      })
      expect(approvedRequest).not.toBeNull()
      expect(approvedRequest.covered).toBeTruthy()
      expect(approvedRequest.coverageApprovedOn).not.toBeNull()
    })
  })
})
