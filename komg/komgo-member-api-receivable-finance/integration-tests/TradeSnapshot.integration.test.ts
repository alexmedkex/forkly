import { ITradeSnapshot, Commodity, buildFakeCargo, TradeSource } from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { buildFakeReceivableFinanceMessage } from '../src/business-layer/messaging/faker'
import { UpdateType } from '../src/business-layer/types'
import { datePlusHours } from '../src/test-utils'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { receiveAcceptedRD, assertReceivedTradeSnapshotCreatedInDB } from './utils/test-utils'

/**
 * This integration test uses a MongoDB real container.
 */
describe('TradeSnapshot integration test', () => {
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

  describe('getHistory', () => {
    describe('validation', () => {
      it('should fail with error 404 if trade snapshot does not exist', async () => {
        try {
          await trader.getTradeSnapshotHistory('inexistentSourceId')
          fail('Expected failure')
        } catch (error) {
          const { status } = error.response
          expect(status).toEqual(404)
        }
      })
    })

    describe('success', () => {
      it('should get the trade snapshot history successfully', async () => {
        const rdId = await receiveAcceptedRD(trader, bank, mockUtils)
        const rdInfo = await bank.getRDInfo(rdId)
        rdInfo.tradeSnapshot.updatedAt = rdInfo.tradeSnapshot.createdAt
        const sourceId = rdInfo.tradeSnapshot.sourceId

        const updatedTradeSnapshot = {
          ...rdInfo.tradeSnapshot,
          createdAt: datePlusHours(rdInfo.tradeSnapshot.createdAt, 2),
          updatedAt: datePlusHours(rdInfo.tradeSnapshot.createdAt, 2)
        }
        updatedTradeSnapshot.trade = {
          ...rdInfo.tradeSnapshot.trade,
          source: TradeSource.Vakt
        }
        updatedTradeSnapshot.movements = [buildFakeCargo({ sourceId }), buildFakeCargo({ sourceId })]

        await mockReceiveUpdate(updatedTradeSnapshot, trader.companyStaticId)

        const history = await bank.getTradeSnapshotHistory(sourceId)

        expect(history).toEqual({
          historyEntry: {
            trade: {
              id: rdInfo.tradeSnapshot.trade._id,
              historyEntry: {
                source: [
                  { updatedAt: updatedTradeSnapshot.updatedAt, value: updatedTradeSnapshot.trade.source },
                  { updatedAt: rdInfo.tradeSnapshot.updatedAt, value: rdInfo.tradeSnapshot.trade.source }
                ]
              }
            },
            movements: undefined // Movements were added so no history
          }
        })
      })
    })
  })

  const mockReceiveUpdate = async (updated: ITradeSnapshot, senderStaticId: string, messageOptions?: any) => {
    const message = buildFakeReceivableFinanceMessage(updated, UpdateType.TradeSnapshot)
    message.data.senderStaticId = senderStaticId

    await trader.publishTradeSnapshotUpdate(message, messageOptions)
    await assertReceivedTradeSnapshotCreatedInDB(updated)
  }
})
