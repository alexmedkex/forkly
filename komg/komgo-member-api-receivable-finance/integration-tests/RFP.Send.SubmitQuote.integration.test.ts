import { ReplyType, buildFakeQuoteBase } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as moment from 'moment'
import { v4 as uuid4 } from 'uuid'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { assertRFPCreatedInDB, assertRFPReplyCreatedInDB } from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('RFP.Send.SubmitQuote integration test', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(bank.companyStaticId) // Submit quote flow is done by financial institutions
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)

    await iEnv.start()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  beforeEach(async () => {
    mockUtils.mockSuccessfulTaskOrNotification()

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

  describe('validation', () => {
    it('should fail validation if rdId and quoteId are not defined', async () => {
      try {
        await bank.createNewQuoteSubmission()
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(400)
        expect(data.fields.quoteSubmission.rdId).toBeDefined()
        expect(data.fields.quoteSubmission.quoteId).toBeDefined()
      }
    })

    it('should fail validation if rdId and quoteId are not uuid', async () => {
      try {
        await bank.createNewQuoteSubmission('invalidRdId', 'invalidQuoteId')
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.rdId).toBeDefined()
        expect(data.fields.quoteId).toBeDefined()
      }
    })

    it('should fail validation if rdId does not exist in DB', async () => {
      try {
        await bank.createNewQuoteSubmission(uuid4(), uuid4())
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.rdId).toBeDefined()
      }
    })

    it('should fail validation if the quote does not exist in DB', async () => {
      const rdId = await trader.publishRFPRequest()
      await assertRFPCreatedInDB(rdId)

      try {
        await bank.createNewQuoteSubmission(rdId, uuid4())
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.quoteId).toBeDefined()
      }
    })

    it('should fail validation if a RFPReply already exists for given rdId', async () => {
      const rdId = await trader.publishRFPRequest()
      await assertRFPCreatedInDB(rdId)

      const quoteId = await bank.createNewQuote()

      await mockUtils.mockSuccessfulRFPReply()
      await bank.createNewQuoteSubmission(rdId, quoteId)
      try {
        await bank.createNewQuoteSubmission(rdId, quoteId)
        fail('Expected failure')
      } catch (error) {
        const { status } = error.response
        expect(status).toEqual(409)
      }
    })
  })

  describe('success', () => {
    it('should submit a quote successfully', async () => {
      const rdId = await trader.publishRFPRequest()
      await assertRFPCreatedInDB(rdId)

      const quoteId = await bank.createNewQuote()

      let submitReplyReceivedByRFP
      await mockUtils.mockSuccessfulRFPReply(data => {
        submitReplyReceivedByRFP = JSON.parse(data)
      })

      await bank.createNewQuoteSubmission(rdId, quoteId)

      await assertRFPReplyCreatedInDB(rdId, ReplyType.Submitted, quoteId)

      const savedQuote = await trader.getQuote(quoteId)
      expect(submitReplyReceivedByRFP.responseData.quote).toEqual(savedQuote)

      const { createdAt, updatedAt } = submitReplyReceivedByRFP.responseData.rfpReply
      expect(moment(createdAt, 'YYYY-MM-DD').isValid()).toBeTruthy()
      expect(moment(updatedAt, 'YYYY-MM-DD').isValid()).toBeTruthy()
    })
  })

  describe('failures and retries', () => {
    it('should create a RFPReply successfully if first attempt fails', async () => {
      const rdId = await trader.publishRFPRequest()
      await assertRFPCreatedInDB(rdId)

      const quoteId = await bank.createNewQuote()

      mockUtils.mockErrorApiRFPAndRetryRFPReply()

      // Fails on api-rfp on first attempt
      try {
        await bank.createNewQuoteSubmission(rdId, quoteId)
        fail('Expected failure')
      } catch (error) {
        const { status } = error.response
        expect(status).toEqual(500)
      }

      // Succeeds second attempt
      await bank.createNewRFPRejection(rdId)
      await assertRFPReplyCreatedInDB(rdId, ReplyType.Reject, quoteId)
    })
  })
})
