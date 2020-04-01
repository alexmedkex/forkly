import { ITradeSnapshot } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { v4 as uuid4 } from 'uuid'

import { buildFakeReceivableFinanceMessage } from '../src/business-layer/messaging/faker'
import { UpdateType } from '../src/business-layer/types'
import { datePlusHours } from '../src/test-utils'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { assertReceivedTradeSnapshotCreatedInDB, receiveAcceptedRD, receiveRFP } from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('TradeSnapshot.Receive.Update integration test', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility
  let axiosMock: MockAdapter

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    axiosMock = new MockAdapter(Axios)
    mockUtils = new RFPMockUtils(axiosMock)

    iEnv = new IntegrationEnvironment(trader.companyStaticId)
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

  describe('success', () => {
    it('should successfully save an update to the trade', async () => {
      const rdId = await receiveAcceptedRD(trader, bank, mockUtils)
      const rdInfo = await trader.getRDInfo(rdId)
      const updatedTradeSnapshot = {
        ...rdInfo.tradeSnapshot,
        createdAt: datePlusHours(rdInfo.tradeSnapshot.createdAt, 2)
      }

      await mockReceiveUpdate(updatedTradeSnapshot, trader.companyStaticId)
      await assertReceivedTradeSnapshotCreatedInDB(updatedTradeSnapshot)
    })

    it('should not update a trade snapshotif the update is outdated', async () => {
      const rdId = await receiveAcceptedRD(trader, bank, mockUtils)
      const rdInfo = await trader.getRDInfo(rdId)
      const updatedTradeSnapshot = {
        ...rdInfo.tradeSnapshot,
        createdAt: datePlusHours(rdInfo.tradeSnapshot.createdAt, 2)
      }
      await mockReceiveUpdate(updatedTradeSnapshot, trader.companyStaticId)
      await assertReceivedTradeSnapshotCreatedInDB(updatedTradeSnapshot)

      const secondUpdate = { ...updatedTradeSnapshot, createdAt: datePlusHours(updatedTradeSnapshot.createdAt, -9) } // 9 hours before first
      const options = { messageId: uuid4() }
      await mockReceiveUpdate(secondUpdate, trader.companyStaticId, options)

      const rdInfoAfter = await trader.getRDInfo(rdId)
      expect(rdInfoAfter.tradeSnapshot.createdAt).toEqual(updatedTradeSnapshot.createdAt)
    })
  })

  describe('failures', () => {
    it('should reject a message if a quote has not been accepted', async () => {
      const rdId = await receiveRFP(trader, mockUtils)
      const rdInfo = await trader.getRDInfo(rdId)
      const updatedTradeSnapshot = {
        ...rdInfo.tradeSnapshot,
        createdAt: datePlusHours(rdInfo.tradeSnapshot.createdAt, 2)
      }

      const options = { messageId: uuid4() }

      await mockReceiveUpdate(updatedTradeSnapshot, trader.companyStaticId, options)
      await messagingTestUtility.assertRejectedMessageFromEventManagement(options.messageId)
    })
  })

  const mockReceiveUpdate = async (updated: ITradeSnapshot, senderStaticId: string, messageOptions?: any) => {
    const message = buildFakeReceivableFinanceMessage(updated, UpdateType.TradeSnapshot)
    message.data.senderStaticId = senderStaticId

    await trader.publishTradeSnapshotUpdate(message, messageOptions)
  }
})
