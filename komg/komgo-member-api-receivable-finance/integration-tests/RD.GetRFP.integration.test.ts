import { ParticipantRFPStatus, ReplyType } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { assertRFPReplyCreatedInDB, createResponseMessage } from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('RD.GetRFP integration test', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

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

  describe('getRFP', () => {
    describe('validation', () => {
      it('should fail if RD application is not found', async () => {
        try {
          await trader.getRFPSummaries('nonExistingRdId')
          fail('Expected failure')
        } catch (error) {
          const { status } = error.response
          expect(status).toEqual(404)
        }
      })
    })

    describe('success', () => {
      it('should get RFP summaries successfully', async () => {
        const rdId = await createInitialResources()

        const result = await trader.getRFPSummaries(rdId)
        const expectedResult = {
          summaries: [
            {
              participantStaticId: bank.companyStaticId,
              status: ParticipantRFPStatus.QuoteSubmitted,
              replies: [{ senderStaticId: bank.companyStaticId }]
            }
          ]
        }

        expect(result).toMatchObject(expectedResult)
      })
    })
  })

  describe('getParticipantRFP', () => {
    describe('validation', () => {
      it('should fail if RD application is not found', async () => {
        try {
          await trader.getParticipantRFPSummary('nonExistingRdId', bank.companyStaticId)
          fail('Expected failure')
        } catch (error) {
          const { status } = error.response
          expect(status).toEqual(404)
        }
      })

      it('should fail if participant staticID is not found for a given RD', async () => {
        const rdId = await createInitialResources()

        try {
          await trader.getParticipantRFPSummary(rdId, 'nonExistingParticipantId')
          fail('Expected failure')
        } catch (error) {
          const { status } = error.response
          expect(status).toEqual(404)
        }
      })
    })

    describe('success', () => {
      it('should get RFP summaries successfully', async () => {
        const rdId = await createInitialResources()

        const result = await trader.getParticipantRFPSummary(rdId, bank.companyStaticId)
        const expectedResult = {
          participantStaticId: bank.companyStaticId,
          status: ParticipantRFPStatus.QuoteSubmitted,
          replies: [{ senderStaticId: bank.companyStaticId }]
        }

        expect(result).toMatchObject(expectedResult)
      })
    })
  })

  async function createInitialResources() {
    const participantStaticIds = [bank.companyStaticId]
    mockUtils.mockSuccessfullRFPRequest(participantStaticIds, false)
    mockUtils.mockSuccessfulRFPReply()

    // Trader creates RD and RFP to the bank
    const rdId = await trader.createNewRD()
    await trader.createNewRFPRequest(rdId, participantStaticIds)

    // Trader receives quote from bank
    const quoteId = await bank.createNewQuote()
    await bank.publishRFPResponse(
      createResponseMessage(rdId, bank.companyStaticId, bank.companyStaticId, ReplyType.Submitted)
    )
    await assertRFPReplyCreatedInDB(rdId, ReplyType.Submitted, quoteId)

    return rdId
  }
})
