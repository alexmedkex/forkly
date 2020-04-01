import { ReplyType } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { assertRFPReplyCreatedInDBFromMessage, createResponseMessage } from './utils/test-utils'

describe('RFP.Receive.Reject integration tests', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(trader.companyStaticId) // Only banks receive RFP requests
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
    it('should create RFP-Reply and no quote', async () => {
      const participantStaticIds = [bank.companyStaticId]
      mockUtils.mockSuccessfullRFPRequest(participantStaticIds, false)

      const rdId = await trader.createNewRD()
      await trader.createNewRFPRequest(rdId, participantStaticIds)

      const message = createResponseMessage(rdId, bank.companyStaticId, bank.companyStaticId, ReplyType.Reject, null)

      await bank.publishRFPReject(message)
      await assertRFPReplyCreatedInDBFromMessage(message)
      await messagingTestUtility.assertNoRejectedMessageFromRFP()
    })
  })
})
