import { IRFPMessage, IRFPRequestPayload } from '@komgo/messaging-types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { IProductRequest } from '../src/business-layer/types'
import { ReceivablesDiscountingModel } from '../src/data-layer/models/receivables-discounting/ReceivablesDiscountingModel'
import { RFPRequestModel } from '../src/data-layer/models/rfp/RFPRequestModel'
import { TradeSnapshotModel } from '../src/data-layer/models/trade-snapshot/TradeSnapshotModel'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { createRequestMessage, assertRFPCreatedInDBFromMessage } from './utils/test-utils'

describe('RFP.Receive.Request integration tests', () => {
  let iEnv: IntegrationEnvironment
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility
  let mockUtils: RFPMockUtils

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

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
    mockUtils.reset()

    await trader.afterEach()
    await bank.afterEach()

    await messagingTestUtility.afterEach()
  })

  describe('ack', () => {
    it('should create RD, TradeSnapshot and RFP Request data from RFP Request message', async () => {
      const message = createRequestMessage(false)
      await receiveRequestAndVerify(message)
    })

    it('should process message if duplicate and previous RFP info was not saved', async () => {
      const message = createRequestMessage(false)

      // Simulate RFP data was not well saved
      await receiveRequestAndVerify(message)
      await removeRFPFromDB(message.data.productRequest.rd.staticId, message.data.productRequest.trade.sourceId)

      // Second attempt succeeds
      await receiveRequestAndVerify(message)
    })

    it('should process message if duplicate and previous action was already processed', async () => {
      const message = createRequestMessage(false)

      // First message processed correctly
      await receiveRequestAndVerify(message)

      // Second attempt succeeds as well
      await receiveRequestAndVerify(message)
    })
  })

  describe('reject', () => {
    it('should reject message if previous action was already processed and new RFP request is received for same RD', async () => {
      const message = createRequestMessage(false)
      const options = { messageId: 'fixedMessageId' }

      // First message processed correctly
      await receiveRequestAndVerify(message, options)

      // Second rejected as already processed
      message.data.productRequest.rd.createdAt = Date.now() as any
      await trader.publishRFPRequest(message, options)
      await messagingTestUtility.assertRejectedMessageFromRFP(options.messageId)
    })
  })

  const receiveRequestAndVerify = async (message: IRFPMessage<IRFPRequestPayload<IProductRequest>>, options?: any) => {
    mockUtils.mockSuccessfulGetCompanyEntry()
    mockUtils.mockSuccessfulTaskOrNotification()

    await trader.publishRFPRequest(message, options)
    await assertRFPCreatedInDBFromMessage(message, bank)
    await messagingTestUtility.assertNoRejectedMessageFromRFP()
  }

  const removeRFPFromDB = async (rdId: string, sourceId: string) => {
    await ReceivablesDiscountingModel.deleteOne({ staticId: rdId })
    await RFPRequestModel.deleteOne({ rdId })
    await TradeSnapshotModel.deleteOne({ sourceId })
  }
})
