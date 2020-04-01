import { ReplyType } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { v4 as uuid4 } from 'uuid'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { assertRFPReplyCreatedInDB, assertRFPCreatedInDB } from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('RFP.Send.Reject integration test', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(bank.companyStaticId) // Reject flow is done by financial institutions
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)

    await iEnv.start()
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
    it('should fail validation if rdId is not defined', async () => {
      try {
        await bank.createNewRFPRejection()
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(400)
        expect(data.fields.rfpRejection.rdId).toBeDefined()
      }
    })

    it('should fail validation if rdId is not uuid', async () => {
      try {
        await bank.createNewRFPRejection('invalidRdId')
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.rdId).toBeDefined()
      }
    })

    it('should fail validation if rdId does not exist in DB', async () => {
      try {
        await bank.createNewRFPRejection(uuid4())
        fail('Expected failure')
      } catch (error) {
        const { status, data } = error.response
        expect(status).toEqual(422)
        expect(data.fields.rdId).toBeDefined()
      }
    })

    it('should fail validation if a RFPReply already exists for given rdId', async () => {
      const rdId = await trader.publishRFPRequest()
      await assertRFPCreatedInDB(rdId)

      await mockUtils.mockSuccessfulRFPReply()

      await bank.createNewRFPRejection(rdId)
      try {
        await bank.createNewRFPRejection(rdId)
        fail('Expected failure')
      } catch (error) {
        const { status } = error.response
        expect(status).toEqual(409)
      }
    })
  })

  describe('success', () => {
    it('should submit a rejection successfully', async () => {
      const rdId = await trader.publishRFPRequest()
      await assertRFPCreatedInDB(rdId)

      await mockUtils.mockSuccessfulRFPReply()

      await bank.createNewRFPRejection(rdId)

      await assertRFPReplyCreatedInDB(rdId, ReplyType.Reject)
    })
  })

  describe('failures and retries', () => {
    it('should create a RFPReply successfully if first attempt fails', async () => {
      const rdId = await trader.publishRFPRequest()
      await assertRFPCreatedInDB(rdId)

      mockUtils.mockErrorApiRFPAndRetryRFPReply()

      // Fails on api-rfp on first attempt
      try {
        await bank.createNewRFPRejection(rdId)
        fail('Expected failure')
      } catch (error) {
        const { status } = error.response
        expect(status).toEqual(500)
      }

      // Succeeds second attempt
      await bank.createNewRFPRejection(rdId)
      await assertRFPReplyCreatedInDB(rdId, ReplyType.Reject)
    })
  })
})
