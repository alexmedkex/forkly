import { IRFPMessage, IRFPPayload, IRFPResponsePayload } from '@komgo/messaging-types'
import { ReplyType } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { v4 as uuid4 } from 'uuid'

import { IProductResponse } from '../src/business-layer/types'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { createResponseMessage, assertRFPReplyCreatedInDBFromMessage, assertRFPCreatedInDB } from './utils/test-utils'

describe('RFP.Receive.Accept integration tests', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(bank.companyStaticId) // Only banks receive RFP requests
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)

    await iEnv.start()
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
    it('should create Quote and RFP-Reply', async () => {
      // Bank receives a RFP Request from trader
      const rdId = await publishRFPAndVerify()

      // Banks submits quote to trader
      mockUtils.mockSuccessfulRFPReply()
      const quoteId = await bank.createNewQuote()
      await bank.createNewQuoteSubmission(rdId, quoteId)

      // Bank receives accept quote from trader
      const message = getAcceptMessage(rdId)
      await receiveAcceptAndVerify(message)
    })
  })

  describe('reject', () => {
    it('should reject a quote accept message if no RFP Request was submitted', async () => {
      // Bank receives accept quote from trader but didn't receive a RFP request
      const message = getAcceptMessage(uuid4())

      const options = { messageId: 'fixedMessageId' }
      await publishRFPAccept(message, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })

    it('should reject a quote accept message if no quote was submitted', async () => {
      // Bank receives a RFP Request from trader
      const rdId = await publishRFPAndVerify()

      // Bank receives accept quote from trader but didn't submit a quote
      const message = getAcceptMessage(rdId)

      const options = { messageId: 'fixedMessageId' }
      await publishRFPAccept(message, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })

    it('should reject a quote accept message if the RD request was already rejected', async () => {
      // Bank receives a RFP Request from trader
      const rdId = await publishRFPAndVerify()

      // Bank rejects it
      mockUtils.mockSuccessfulRFPReply()
      await bank.createNewRFPRejection(rdId)

      // Bank receives accept quote from trader but already rejected it
      const message = getAcceptMessage(rdId)
      const options = { messageId: 'fixedMessageId' }
      await publishRFPAccept(message, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })

    it('should reject a quote accept message if a previous RFP Accept was already received', async () => {
      // Bank receives a RFP Request from trader
      const rdId = await publishRFPAndVerify()

      // Banks submits quote to trader
      mockUtils.mockSuccessfulRFPReply()
      const quoteId = await bank.createNewQuote()
      await bank.createNewQuoteSubmission(rdId, quoteId)

      // Bank receives accept quote from trader
      const message = getAcceptMessage(rdId)
      const options = { messageId: 'fixedMessageId' }
      await receiveAcceptAndVerify(message, options)

      // Second fails as already received
      await publishRFPAccept(message, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })
  })

  const publishRFPAndVerify = async (): Promise<string> => {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulTaskOrNotification()

    const rdId = await trader.publishRFPRequest()
    await assertRFPCreatedInDB(rdId)
    return rdId
  }

  const publishRFPAccept = async (message: IRFPMessage<IRFPPayload>, options?: any) => {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulTaskOrNotification()
    await trader.publishRFPAccept(message, options)
  }

  const receiveAcceptAndVerify = async (message: IRFPMessage<IRFPResponsePayload<IProductResponse>>, options?: any) => {
    await publishRFPAccept(message, options)
    await assertRFPReplyCreatedInDBFromMessage(message)
    await messagingTestUtility.assertNoRejectedMessageFromRFP()
  }

  const getAcceptMessage = (rdId: string) => {
    return createResponseMessage(rdId, bank.companyStaticId, trader.companyStaticId, ReplyType.Accepted)
  }
})
