import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import {
  ITradeSnapshot,
  ITrade,
  CreditRequirements,
  ICargo,
  Grade,
  buildFakeReceivablesDiscountingBase
} from '@komgo/types'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'
import waitForExpect from 'wait-for-expect'

import { UPDATE_TYPE_ROUTING_KEY_PREFIX } from '../src/business-layer/messaging/constants'
import { UpdateType } from '../src/business-layer/types'
import { VALUES } from '../src/inversify/values'
import { datePlusHours } from '../src/test-utils'

import { Corporate } from './utils/Corporate'
import { FinancialInstitution } from './utils/FinancialInstitution'
import IntegrationEnvironment from './utils/IntegrationEnvironment'
import MessagingTestUtility from './utils/MessagingTestUtility'
import RFPMockUtils from './utils/RFP.mockutils'
import { createRFP, createAcceptedRD } from './utils/test-utils'

const mockTrade = {
  sourceId: 'sourceId',
  creditRequirement: CreditRequirements.OpenCredit
}

const mockCargo = {
  sourceId: 'sourceId'
}

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('TradeCargo.Receive.Update', () => {
  let iEnv: IntegrationEnvironment
  let mockUtils: RFPMockUtils
  let trader: Corporate
  let bank: FinancialInstitution
  let messagingTestUtility: MessagingTestUtility
  let outboundConsumer: ConsumerMicroservice

  beforeAll(async () => {
    trader = new Corporate()
    bank = new FinancialInstitution()

    mockUtils = new RFPMockUtils(new MockAdapter(Axios))

    iEnv = new IntegrationEnvironment(trader.companyStaticId)
    await iEnv.setup()

    messagingTestUtility = new MessagingTestUtility(iEnv)

    await iEnv.start()

    outboundConsumer = new ConsumerMicroservice(iEnv.iocContainer.get<string>(VALUES.OutboundPublisherId))
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  beforeEach(async () => {
    await trader.beforeEach(iEnv.iocContainer)
    await bank.beforeEach(iEnv.iocContainer)
    await outboundConsumer.beforeEach()
    await outboundConsumer.registerQueue()
    mockUtils.mockSuccessfulTaskOrNotification()
  })

  afterEach(async () => {
    mockUtils.reset()

    await outboundConsumer.afterEach()
    await trader.afterEach()
    await bank.afterEach()

    await messagingTestUtility.afterEach()
  })

  describe('ack', () => {
    describe('happy flow with 2 updates ordered', () => {
      afterEach(async () => {
        await outboundConsumer.purgeQueue() // clear middle message
      })

      it('should receive 2 Trade updates and save the most recent one', async () => {
        const { rdId } = await createAcceptedRD(trader, bank, buildFakeReceivablesDiscountingBase(), mockUtils)
        const { tradeSnapshot: previousTradeSnapshot } = await trader.getRDInfo(rdId)

        const middleUpdatedTrade: ITrade = decorateSellerTrade(previousTradeSnapshot.trade, { price: 75000 })
        await sleep(100)
        const finalUpdatedTrade: ITrade = decorateSellerTrade(previousTradeSnapshot.trade, { price: 1200000 })

        // swap order
        await trader.publishTradeUpdateMessage({ trade: middleUpdatedTrade })
        await sleep(100)
        await trader.publishTradeUpdateMessage({ trade: finalUpdatedTrade })
        await sleep(200)

        await waitForExpect(async () => {
          const { tradeSnapshot } = await trader.getRDInfo(rdId)
          validateSavedSnapshotDates(tradeSnapshot, previousTradeSnapshot)
          expect(tradeSnapshot.trade.price).toEqual(finalUpdatedTrade.price)
          await messagingTestUtility.assertNoRejectedMessageFromTradeCargos()
        })
      })

      it('should receive 2 Cargo updates and save the most recent one', async () => {
        const { rdId } = await createAcceptedRD(trader, bank, buildFakeReceivablesDiscountingBase(), mockUtils)
        const { tradeSnapshot: previousTradeSnapshot } = await trader.getRDInfo(rdId)

        const middleUpdatedCargo: ICargo = decorateCargo(previousTradeSnapshot.movements[0], {
          sourceId: previousTradeSnapshot.sourceId,
          grade: Grade.Oseberg
        })
        await sleep(100)
        const finalUpdatedCargo: ICargo = decorateCargo(previousTradeSnapshot.movements[0], {
          sourceId: previousTradeSnapshot.sourceId,
          grade: Grade.Forties
        })

        // swap order
        await trader.publishCargoUpdateMessage({ cargo: middleUpdatedCargo })
        await sleep(100)
        await trader.publishCargoUpdateMessage({ cargo: finalUpdatedCargo })
        await sleep(200)

        await waitForExpect(async () => {
          const { tradeSnapshot } = await trader.getRDInfo(rdId)
          validateSavedSnapshotDates(tradeSnapshot, previousTradeSnapshot)
          expect(tradeSnapshot.movements.filter((c: ICargo) => c._id === finalUpdatedCargo._id)[0].grade).toEqual(
            finalUpdatedCargo.grade
          )
          await messagingTestUtility.assertNoRejectedMessageFromTradeCargos()
        })
      })
    })

    describe('happy flow with 2 updates unordered', () => {
      afterEach(async () => {
        await outboundConsumer.purgeQueue() // clear middle message if necessary
      })

      it('should receive 2 Trade updates and save the most recent one', async done => {
        const { rdId } = await createAcceptedRD(trader, bank, buildFakeReceivablesDiscountingBase(), mockUtils)
        const { tradeSnapshot: previousTradeSnapshot } = await trader.getRDInfo(rdId)

        const middleUpdatedTrade: ITrade = decorateSellerTrade(previousTradeSnapshot.trade, { price: 75000 })
        await sleep(500)
        const finalUpdatedTrade: ITrade = decorateSellerTrade(previousTradeSnapshot.trade, { price: 1200000 })

        // swap order
        await trader.publishTradeUpdateMessage({ trade: finalUpdatedTrade })
        await sleep(500)
        await trader.publishTradeUpdateMessage({ trade: middleUpdatedTrade })
        await sleep(500)

        let savedSnapshot: ITradeSnapshot
        await waitForExpect(async () => {
          const { tradeSnapshot } = await trader.getRDInfo(rdId)
          validateSavedSnapshotDates(tradeSnapshot, previousTradeSnapshot)
          expect(tradeSnapshot.trade.price).toEqual(finalUpdatedTrade.price)
          savedSnapshot = tradeSnapshot
          await messagingTestUtility.assertNoRejectedMessageFromTradeCargos()
        })

        // validate outbound message
        await validateOutboundMessageSnapshotUpdate(savedSnapshot, outboundConsumer, done)
      })

      it('should receive 2 Cargo updates and save the most recent one', async done => {
        const { rdId } = await createAcceptedRD(trader, bank, buildFakeReceivablesDiscountingBase(), mockUtils)
        const { tradeSnapshot: previousTradeSnapshot } = await trader.getRDInfo(rdId)

        const middleUpdatedCargo: ICargo = decorateCargo(previousTradeSnapshot.movements[0], {
          sourceId: previousTradeSnapshot.sourceId,
          grade: Grade.Oseberg
        })
        await sleep(100)
        const finalUpdatedCargo: ICargo = decorateCargo(previousTradeSnapshot.movements[0], {
          sourceId: previousTradeSnapshot.sourceId,
          grade: Grade.Forties
        })

        // swap order
        await trader.publishCargoUpdateMessage({ cargo: finalUpdatedCargo })
        await sleep(100)
        await trader.publishCargoUpdateMessage({ cargo: middleUpdatedCargo })
        await sleep(200)

        let savedSnapshot: ITradeSnapshot
        await waitForExpect(async () => {
          const { tradeSnapshot } = await trader.getRDInfo(rdId)
          savedSnapshot = tradeSnapshot
          validateSavedSnapshotDates(tradeSnapshot, previousTradeSnapshot)
          expect(tradeSnapshot.movements.filter((c: ICargo) => c._id === finalUpdatedCargo._id)[0].grade).toEqual(
            finalUpdatedCargo.grade
          )
          await messagingTestUtility.assertNoRejectedMessageFromTradeCargos()
        })

        await validateOutboundMessageSnapshotUpdate(savedSnapshot, outboundConsumer, done)
      })
    })

    it('should ignore Trade update message if is not Open Credit', async () => {
      const messageId: string = uuid4()

      await trader.publishTradeUpdateMessage(
        {
          trade: {
            ...mockTrade,
            creditRequirement: CreditRequirements.DocumentaryLetterOfCredit
          }
        },
        {
          messageId
        }
      )

      await messagingTestUtility.assertNoRejectedMessageFromTradeCargos()
    })

    it('should ignore message if is there is no RD for this Cargo', async () => {
      const messageId: string = uuid4()

      await trader.publishCargoUpdateMessage({ cargo: mockCargo }, { messageId })

      await messagingTestUtility.assertNoRejectedMessageFromTradeCargos()
    })

    it('should ignore message if is there is no RD for this Trade', async () => {
      const messageId: string = uuid4()

      await trader.publishTradeUpdateMessage({ trade: mockTrade }, { messageId })

      await messagingTestUtility.assertNoRejectedMessageFromTradeCargos()
    })

    it('should ignore Trader Update message if the received trade is older than the saved one', async () => {
      const messageId: string = uuid4()
      const { rdId } = await createAcceptedRD(trader, bank, buildFakeReceivablesDiscountingBase(), mockUtils)
      const { tradeSnapshot: previousTradeSnapshot } = await trader.getRDInfo(rdId)
      const receivedCreatedAtDate = datePlusHours(previousTradeSnapshot.trade.updatedAt, -5)

      await trader.publishTradeUpdateMessage(
        {
          trade: {
            sourceId: previousTradeSnapshot.sourceId,
            updatedAt: receivedCreatedAtDate,
            creditRequirement: CreditRequirements.OpenCredit
          }
        },
        {
          messageId
        }
      )

      await messagingTestUtility.assertNoRejectedMessageFromTradeCargos()
    })

    it('should ignore Cargo Update message if the received trade is older than the saved one', async () => {
      const messageId: string = uuid4()
      const { rdId } = await createAcceptedRD(trader, bank, buildFakeReceivablesDiscountingBase(), mockUtils)
      const { tradeSnapshot: previousTradeSnapshot } = await trader.getRDInfo(rdId)
      const receivedCreatedAtDate = datePlusHours(previousTradeSnapshot.movements[0].updatedAt, -5)

      await trader.publishCargoUpdateMessage(
        {
          cargo: {
            ...previousTradeSnapshot.movements[0],
            sourceId: previousTradeSnapshot.sourceId,
            updatedAt: receivedCreatedAtDate
          }
        },
        {
          messageId
        }
      )

      await messagingTestUtility.assertNoRejectedMessageFromTradeCargos()
    })
  })

  describe('reject', () => {
    it('should reject Trade Update message if RD is not accepted', async () => {
      const messageId: string = uuid4()
      const rdId = await createRFP(trader, bank, buildFakeReceivablesDiscountingBase(), mockUtils)
      const { tradeSnapshot } = await trader.getRDInfo(rdId)

      await trader.publishTradeUpdateMessage(
        {
          trade: {
            ...mockTrade,
            sourceId: tradeSnapshot.sourceId
          }
        },
        {
          messageId
        }
      )

      await messagingTestUtility.assertRejectedMessageFromTradeCargos(messageId)
    })

    it('should reject Cargo Update message if RD is not accepted', async () => {
      const messageId: string = uuid4()
      const rdId = await createRFP(trader, bank, buildFakeReceivablesDiscountingBase(), mockUtils)
      const { tradeSnapshot } = await trader.getRDInfo(rdId)

      await trader.publishCargoUpdateMessage(
        {
          cargo: {
            sourceId: tradeSnapshot.sourceId
          }
        },
        {
          messageId
        }
      )

      await messagingTestUtility.assertRejectedMessageFromTradeCargos(messageId)
    })
  })
})

const decorateSellerTrade = (trade: ITrade, overrides: Partial<ITrade> = {}): ITrade => {
  return {
    ...trade,
    creditRequirement: CreditRequirements.OpenCredit,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

const decorateCargo = (cargo: ICargo, overrides: Partial<ICargo> = {}): ICargo => {
  return {
    ...cargo,
    grade: Grade.Troll,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function validateSavedSnapshotDates(savedSnapshot: ITradeSnapshot, previousTradeSnapshot: ITradeSnapshot) {
  expect(savedSnapshot).toBeDefined()
  expect(new Date(savedSnapshot.createdAt).getTime() > new Date(previousTradeSnapshot.createdAt).getTime()).toBeTruthy()
  expect(new Date(savedSnapshot.updatedAt).getTime() > new Date(previousTradeSnapshot.updatedAt).getTime()).toBeTruthy()
}

async function validateOutboundMessageSnapshotUpdate(
  savedSnapshot: ITradeSnapshot,
  outboundConsumer: ConsumerMicroservice,
  done: jest.DoneCallback
) {
  savedSnapshot.createdAt = new Date(savedSnapshot.createdAt).toISOString()
  savedSnapshot.updatedAt = new Date(savedSnapshot.updatedAt).toISOString()
  await outboundConsumer.expectMessage(
    `${UPDATE_TYPE_ROUTING_KEY_PREFIX}${UpdateType.TradeSnapshot}`,
    {
      content: expect.objectContaining({
        data: expect.objectContaining({
          entry: savedSnapshot,
          updateType: UpdateType.TradeSnapshot
        })
      })
    },
    done
  )
}
