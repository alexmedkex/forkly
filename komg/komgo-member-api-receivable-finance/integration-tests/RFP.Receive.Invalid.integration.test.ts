import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import { createRequestMessage } from './utils/test-utils'

describe('RFP.Receive.Invalid integration tests', () => {
  let iEnv: IntegrationEnvironment
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    iEnv = new IntegrationEnvironment(bank.companyStaticId) // Only banks receive RFP requests
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
    await trader.afterEach()
    await bank.afterEach()

    await messagingTestUtility.afterEach()
  })

  describe('reject', () => {
    it('should reject message if routing key is not supported', async () => {
      const message = createRequestMessage()
      const options = {
        messageId: 'fixedMessageId'
      }

      await trader.publishInvalidMessage(message, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })
  })
})
