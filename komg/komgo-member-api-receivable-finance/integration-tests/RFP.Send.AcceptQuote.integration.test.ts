import { ReplyType, buildFakeQuote, buildFakeQuoteBase } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as moment from 'moment'
import { v4 as uuid4 } from 'uuid'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { assertRFPReplyCreatedInDB, createResponseMessage } from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('RFP.Send.AcceptQuote integration test', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(trader.companyStaticId) // Accept quote flow is done by corporates
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
    it('should fail validation if rdId, quoteId and participantStaticId are not defined', async () => {
      try {
        await trader.createNewQuoteAccept()
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(400)
        expect(data.fields.quoteAccept.rdId).toBeDefined()
        expect(data.fields.quoteAccept.quoteId).toBeDefined()
        expect(data.fields.quoteAccept.participantStaticId).toBeDefined()
      }
    })

    it('should fail validation if rdId and quoteId are not uuid', async () => {
      try {
        await trader.createNewQuoteAccept('invalidRdId', 'invalidQuoteId', 'invalidParticipantStaticId')
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
        await trader.createNewQuoteAccept(uuid4(), uuid4(), uuid4())
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.rdId).toEqual(['The specified Receivable discounting data could not be found'])
      }
    })

    it('should fail validation if the quote does not exist in DB', async () => {
      const rdId = await createRFP()

      try {
        await trader.createNewQuoteAccept(rdId, uuid4(), bank.companyStaticId)
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.quoteId).toEqual(['The specified quote could not be found'])
      }
    })

    it('should fail validation if no quote has been provided yet by the bank', async () => {
      const rdId = await createRFP()
      const quoteId = await bank.createNewQuote()

      try {
        await trader.createNewQuoteAccept(rdId, quoteId, bank.companyStaticId)
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.rdId).toEqual([
          'The action cannot be performed for the specified Receivable Discounting application due to an invalid status'
        ])
      }
    })

    it('should fail validation if a quote has already been accepted for a specific bank', async () => {
      // Trader creates RFP
      const rdId = await createRFP()

      // Trader receives submission from bank
      const quoteSubmissionMessage = createResponseMessage(
        rdId,
        bank.companyStaticId,
        bank.companyStaticId,
        ReplyType.Submitted
      )
      await bank.publishRFPResponse(quoteSubmissionMessage)
      await assertRFPReplyCreatedInDB(rdId, ReplyType.Submitted)

      // Trader accepts quote and fails if he tries to accept again
      const quoteId = await trader.createNewQuote()
      await mockUtils.mockSuccessfulRFPReplyAccept()
      await trader.createNewQuoteAccept(rdId, quoteId, bank.companyStaticId)
      try {
        await trader.createNewQuoteAccept(rdId, quoteId, bank.companyStaticId)
        fail('Expected failure')
      } catch (error) {
        const { status } = error.response
        expect(status).toEqual(409)
      }
    })
  })

  describe('success', () => {
    it('should accept a quote successfully', async () => {
      // Trader creates RFP
      const rdId = await createRFP()

      // Trader receives submission from bank
      const quoteSubmissionMessage = createResponseMessage(
        rdId,
        bank.companyStaticId,
        bank.companyStaticId,
        ReplyType.Submitted
      )
      await bank.publishRFPResponse(quoteSubmissionMessage)
      await assertRFPReplyCreatedInDB(rdId, ReplyType.Submitted)

      // Trader accepts quote
      const quoteId = await trader.createNewQuote()

      let acceptReplyReceivedByRFP
      await mockUtils.mockSuccessfulRFPReplyAccept(data => {
        acceptReplyReceivedByRFP = JSON.parse(data)
      })
      await trader.createNewQuoteAccept(rdId, quoteId, bank.companyStaticId)

      await assertRFPReplyCreatedInDB(rdId, ReplyType.Accepted, quoteId)

      const savedQuote = await trader.getQuote(quoteId)
      expect(acceptReplyReceivedByRFP.responseData.quote).toEqual(savedQuote)

      const { createdAt, updatedAt } = acceptReplyReceivedByRFP.responseData.rfpReply
      expect(moment(createdAt, 'YYYY-MM-DD').isValid()).toBeTruthy()
      expect(moment(updatedAt, 'YYYY-MM-DD').isValid()).toBeTruthy()
    })

    describe('failures and retries', () => {
      it('should create a RFPReply successfully if first attempt fails', async () => {
        // Trader creates RFP
        const rdId = await createRFP()

        // Trader receives submission from bank
        const quoteSubmissionMessage = createResponseMessage(
          rdId,
          bank.companyStaticId,
          bank.companyStaticId,
          ReplyType.Submitted
        )
        await bank.publishRFPResponse(quoteSubmissionMessage)
        await assertRFPReplyCreatedInDB(rdId, ReplyType.Submitted)

        // Trader accepts quote and fails if he tries to accept again
        const quoteId = await trader.createNewQuote()

        // Fails on first attempt and succeeds on retry
        mockUtils.mockErrorApiRFPAndRetryRFPReply(true)
        try {
          await trader.createNewQuoteAccept(rdId, quoteId, bank.companyStaticId)
          fail('Expected failure')
        } catch (error) {
          const { status } = error.response
          expect(status).toEqual(500)
        }

        await trader.createNewQuoteAccept(rdId, quoteId, bank.companyStaticId)
        await assertRFPReplyCreatedInDB(rdId, ReplyType.Accepted, quoteId)
      })
    })
  })

  const createRFP = async () => {
    const participantStaticIds = [bank.companyStaticId]
    mockUtils.mockSuccessfullRFPRequest(participantStaticIds, false)

    const rdId = await trader.createNewRD()
    await trader.createNewRFPRequest(rdId, participantStaticIds)

    return rdId
  }
})
