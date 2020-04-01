import { IRFPMessage, IRFPPayload } from '@komgo/messaging-types'
import { ReplyType, RDStatus } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { v4 as uuid4 } from 'uuid'

import { RFPRequestModel } from '../src/data-layer/models/rfp/RFPRequestModel'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import {
  assertAutoRFPDeclineCreatedInDBFromMessage,
  assertRFPCreatedInDB,
  assertRFPReplyCreatedInDBFromMessage,
  createResponseMessage
} from './utils/test-utils'

describe('RFP.Receive.Decline integration tests', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(bank.companyStaticId)
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
    it('should create RFP-Reply if RD was requested but no quote was submitted', async () => {
      const rdId = await publishRFPAndVerify()

      const message = getDeclineMessage(rdId)
      await publishDeclineAndVerify(message)
    })

    it('should create RFP-Reply if bank submitted a quote', async () => {
      const rdId = await publishRFPAndVerify()

      mockUtils.mockSuccessfulRFPReply()
      const quoteId = await bank.createNewQuote()
      await bank.createNewQuoteSubmission(rdId, quoteId)

      const message = getDeclineMessage(rdId)
      await publishDeclineAndVerify(message)
    })

    it('should be declined if auto-declined (and bank submitted a quote)', async () => {
      const rdId = await publishRFPAndVerify()
      const rfpRequest = await RFPRequestModel.findOne({ rdId })

      mockUtils.mockSuccessfulRFPReply()
      const quoteId = await bank.createNewQuote()
      await bank.createNewQuoteSubmission(rdId, quoteId)

      const message = getDeclineMessage(rdId)
      delete message.data.response
      message.data.rfpId = rfpRequest.rfpId
      await publishDeclineAndVerify(message, true)

      const info = await bank.getRDInfo(rdId)
      expect(info.status).toEqual(RDStatus.QuoteDeclined)
    })
  })

  describe('reject', () => {
    it('should reject a RFP.Decline message if no RD request was previously received', async () => {
      const message = getDeclineMessage(uuid4())
      const options = { messageId: 'fixedMessageId' }

      await trader.publishRFPDecline(message, options)

      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })

    it('should reject a Decline message if the RD request was already rejected', async () => {
      const rdId = await publishRFPAndVerify()

      mockUtils.mockSuccessfulRFPReply()
      await bank.createNewRFPRejection(rdId)

      const declineMessage = getDeclineMessage(rdId)
      const options = { messageId: 'fixedMessageId' }
      await publishDecline(declineMessage, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })

    it('should reject a Decline message if the Accept message was already received', async () => {
      const rdId = await publishRFPAndVerify()

      mockUtils.mockSuccessfulRFPReply()
      const quoteId = await bank.createNewQuote()
      await bank.createNewQuoteSubmission(rdId, quoteId)

      mockUtils.mockSuccessfulGetCompanyEntry()
      mockUtils.mockSuccessfulTaskOrNotification()
      const acceptMessage = createResponseMessage(
        rdId,
        bank.companyStaticId,
        trader.companyStaticId,
        ReplyType.Accepted
      )
      await trader.publishRFPAccept(acceptMessage)
      await assertRFPReplyCreatedInDBFromMessage(acceptMessage)

      const message = getDeclineMessage(rdId)
      const options = { messageId: 'fixedMessageId' }

      await publishDecline(message, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })

    it('should reject a Decline message if a previous decline was already received', async () => {
      const rdId = await publishRFPAndVerify()

      const message = getDeclineMessage(rdId)
      const options = { messageId: 'fixedMessageId' }

      await publishDeclineAndVerify(message, false, options)

      await publishDecline(message, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })
  })

  const getDeclineMessage = (rdId: string) => {
    return createResponseMessage(rdId, bank.companyStaticId, trader.companyStaticId, ReplyType.Declined, false)
  }

  const publishRFPAndVerify = async (): Promise<string> => {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulTaskOrNotification()

    const rdId = await trader.publishRFPRequest()
    await assertRFPCreatedInDB(rdId)
    return rdId
  }

  const publishDecline = async (message: IRFPMessage<IRFPPayload>, options?: any) => {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulTaskOrNotification()

    await trader.publishRFPDecline(message, options)
  }

  const publishDeclineAndVerify = async (message: IRFPMessage<IRFPPayload>, isAuto = false, options?: any) => {
    await publishDecline(message, options)

    if (isAuto) {
      await assertAutoRFPDeclineCreatedInDBFromMessage()
    } else {
      await assertRFPReplyCreatedInDBFromMessage(message)
    }
    await messagingTestUtility.assertNoRejectedMessageFromRFP()
  }
})
