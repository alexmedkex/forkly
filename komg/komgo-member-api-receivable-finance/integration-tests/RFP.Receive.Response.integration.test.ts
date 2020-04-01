import { IRFPMessage, IRFPResponsePayload } from '@komgo/messaging-types'
import { ReplyType } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { IProductResponse } from '../src/business-layer/types'
import { ReplyModel } from '../src/data-layer/models/replies/ReplyModel'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { createResponseMessage, assertRFPReplyCreatedInDBFromMessage } from './utils/test-utils'

describe('RFP.Receive.Response integration tests', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility
  let rdId: string

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(trader.companyStaticId)
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)

    await iEnv.start()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  beforeEach(async () => {
    await trader.beforeEach(iEnv.iocContainer)
    await bank.beforeEach(iEnv.iocContainer)

    // Trader creates RFP Request
    const participantStaticIds = [bank.companyStaticId]
    mockUtils.mockSuccessfullRFPRequest(participantStaticIds, false)

    rdId = await trader.createNewRD()
    await trader.createNewRFPRequest(rdId, participantStaticIds)
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  afterEach(async () => {
    mockUtils.reset()

    await trader.afterEach()
    await bank.afterEach()

    await messagingTestUtility.afterEach()
  })

  describe('ack', () => {
    it('should create Quote and RFP-Reply', async () => {
      // Bank sends a response (submits a quote)
      const message = createResponseMessage(rdId, bank.companyStaticId, bank.companyStaticId, ReplyType.Submitted)

      await receiveResponseAndVerify(message)
    })

    it('should process message if duplicate and previous RFP-Reply was not saved', async () => {
      // Bank sends a response (submits a quote)
      const message = createResponseMessage(rdId, bank.companyStaticId, bank.companyStaticId, ReplyType.Submitted)

      await receiveResponseAndVerify(message)

      // Simulate RFP data was not well saved
      await ReplyModel.deleteOne({ staticId: message.data.response.rfpReply.staticId })

      // Trader proceses message
      await receiveResponseAndVerify(message)
    })

    it('should process message if duplicate and previous RFP-Reply was already processed', async () => {
      // Bank sends a response (submits a quote)
      const message = createResponseMessage(rdId, bank.companyStaticId, bank.companyStaticId, ReplyType.Submitted)

      // Message is processed by trader
      await receiveResponseAndVerify(message)

      // Second message is processed as well
      await receiveResponseAndVerify(message)
    })
  })

  describe('reject', () => {
    it('should reject message is duplicate and previous RFP-Reply was already processed with different createdAt', async () => {
      // Bank sends a response (submits a quote)
      const message = createResponseMessage(rdId, bank.companyStaticId, bank.companyStaticId, ReplyType.Submitted)
      const options = { messageId: 'fixedMessageId' }

      // Message is processed by trader
      await receiveResponseAndVerify(message, options)

      // Second message is rejected
      message.data.response.rfpReply.createdAt = Date.now().toString()
      await bank.publishRFPResponse(message, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })

    it('should reject message RFP.Response doesnt have a quote', async () => {
      // Bank sends a response without a quote
      const message = createResponseMessage(rdId, bank.companyStaticId, bank.companyStaticId, ReplyType.Submitted, null)
      const options = { messageId: 'fixedMessageId' }
      delete message.data.response.quote

      // Trader rejects message
      await bank.publishRFPResponse(message, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })
  })

  const receiveResponseAndVerify = async (
    message: IRFPMessage<IRFPResponsePayload<IProductResponse>>,
    options?: any
  ) => {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulTaskOrNotification()

    await bank.publishRFPResponse(message, options)
    await assertRFPReplyCreatedInDBFromMessage(message)
    await messagingTestUtility.assertNoRejectedMessageFromRFP()
  }
})
