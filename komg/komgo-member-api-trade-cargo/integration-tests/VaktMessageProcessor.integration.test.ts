import 'reflect-metadata'

// jest.disableAutomock()
jest.unmock('axios')
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
const axiosMock = new MockAdapter(axios)

// import waitForExpect from 'wait-for-expect'
const waitForExpect = require('wait-for-expect')

import { sleep, IntegrationEnvironment } from './utils/IntegrationEnvironment'
import { PublisherMicroservice, ConsumerMicroservice } from '@komgo/integration-test-utilities' // tslint:disable-line
import { ITradeDataAgent } from '../src/data-layer/data-agents/ITradeDataAgent'
import { ICargoDataAgent } from '../src/data-layer/data-agents/ICargoDataAgent'
import { members } from './sampledata/members'
import { MESSAGE_TYPE } from '../src/business-layer/data/request-messages/MessageType'
import { TYPES } from '../src/inversify/types'
import { getMembers, generateRandomString, generateVaktMovementAMQPMessages } from './utils/utils'
import { apiroutes } from './utils/apiroutes'
import { CreditRequirements, TradeSource } from '@komgo/types'
import { VALUES } from '../src/inversify/values'

let cargoDataAgent: ICargoDataAgent
let tradeDataAgent: ITradeDataAgent
let inboundPublisher: PublisherMicroservice
let consumer: ConsumerMicroservice
jest.setTimeout(90000)

let environment: IntegrationEnvironment

describe('VaktMessageEventProcessor', () => {
  const BUYER = 'BUYER'
  const SELLER = 'SELLER'

  beforeAll(async () => {
    environment = new IntegrationEnvironment()
    await environment.start(members[0].staticId)
    generateRandomString(5, 'from-event-mgnt-')

    tradeDataAgent = environment.container.get<ITradeDataAgent>(TYPES.TradeDataAgent)
    cargoDataAgent = environment.container.get<ICargoDataAgent>(TYPES.CargoDataAgent)
    inboundPublisher = new PublisherMicroservice(environment.container.get<string>(VALUES.InboundPublisherId))
    await inboundPublisher.beforeEach()

    await sleep(300)
  })

  afterAll(async () => {
    await inboundPublisher.afterEach()
    await environment.stop(axiosMock)
  })

  beforeEach(async () => {
    await environment.beforeEach(axiosMock)
    consumer = new ConsumerMicroservice(environment.container.get<string>(VALUES.TradeCargoPublisherId))
    await consumer.beforeEach()
  })
  afterEach(async () => {
    await environment.afterEach(axiosMock)
    await consumer.afterEach()
  })

  describe('Saves buyer trade', () => {
    it('saves new trade', async () => {
      const data = generateVaktMovementAMQPMessages(BUYER)
      await runSaveTradeTest(data.trade)
    })

    it('should add a default creditRequirement if not present', async () => {
      const data = generateVaktMovementAMQPMessages(BUYER)
      delete data.trade.creditRequirement
      await runSaveTradeTest(data.trade)
    })

    it('should add a default creditRequirement if it is an empty string', async () => {
      const data: any = generateVaktMovementAMQPMessages(BUYER)
      data.trade.creditRequirement = ''
      await runSaveTradeTest(data.trade)
    })

    it('update trade', async done => {
      const data = generateVaktMovementAMQPMessages(BUYER)
      await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_TradeData, data.trade)
      await waitForExpect(async () => {
        const dbTrade = await tradeDataAgent.findOne({ sourceId: data.trade.vaktId }, TradeSource.Vakt)
        expect(dbTrade.sourceId).toEqual(data.trade.vaktId)
      })

      // change trade data.
      data.trade.quantity = 400
      data.trade.price = 100

      const expectedTrade = { ...data.trade }
      delete expectedTrade.version
      delete expectedTrade.messageType
      await consumer.expectMessage(
        'INTERNAL.TRADE.Updated',
        {
          content: {
            trade: {
              ...expectedTrade,
              commodity: 'BFOET',
              buyer: members[0].staticId,
              seller: members[1].staticId,
              source: 'VAKT',
              status: 'TO_BE_FINANCED',
              sourceId: expectedTrade.vaktId
            }
          }
        },
        done
      )
      await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_TradeData, data.trade)
      await waitForExpect(async () => {
        const dbTrade = await tradeDataAgent.findOne({ sourceId: data.trade.vaktId }, TradeSource.Vakt)
        expect(dbTrade.sourceId).toEqual(data.trade.vaktId)
        expect(dbTrade.quantity).toEqual(data.trade.quantity)
        expect(dbTrade.price).toEqual(data.trade.price)
      })
    })
  })

  describe('saves open credit seller trade', () => {
    it('saves new trade', async () => {
      const data = generateVaktMovementAMQPMessages(SELLER)
      await runSaveTradeTest(data.trade, CreditRequirements.OpenCredit)
    })
  })

  it('save trade - fail company fetch', async () => {
    axiosMock.reset()
    axiosMock
      .onGet(apiroutes.registry.getMembers)
      .reply(500)
      .onPost(apiroutes.notification.create)
      .reply(200)
    const data = generateVaktMovementAMQPMessages()
    await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_TradeData, data.trade)

    await sleep(5000)

    await waitForExpect(async () => {
      const dbTrade = await tradeDataAgent.findOne({ sourceId: data.trade.vaktId }, TradeSource.Vakt)
      expect(dbTrade).toBeNull()
    })
  })

  it('save trade - fail notification', async () => {
    axiosMock.reset()
    axiosMock
      .onGet(apiroutes.registry.getMembers)
      .reply(getMembers)
      .onPost(apiroutes.notification.create)
      .reply(500)

    const data = generateVaktMovementAMQPMessages()
    await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_TradeData, data.trade)

    await sleep(5000)

    await waitForExpect(async () => {
      const dbTrade = await tradeDataAgent.findOne({ sourceId: data.trade.vaktId }, TradeSource.Vakt)
      expect(dbTrade.sourceId).toEqual(data.trade.vaktId)
    })
  })

  it('saves new trade and cargo', async () => {
    const data = generateVaktMovementAMQPMessages()
    await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_TradeData, data.trade)
    await waitForExpect(async () => {
      const dbTrade = await tradeDataAgent.findOne({ sourceId: data.trade.vaktId }, TradeSource.Vakt)
      expect(dbTrade.sourceId).toEqual(data.trade.vaktId)
    })
    await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_CargoData, data.cargo)

    await waitForExpect(async () => {
      const dbCargo = await cargoDataAgent.findOne({ sourceId: data.cargo.vaktId }, TradeSource.Vakt)
      expect(dbCargo.sourceId).toEqual(data.cargo.vaktId)
    })
  })

  it('saves new trade and update cargo', async done => {
    const data = generateVaktMovementAMQPMessages()
    await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_TradeData, data.trade)
    await waitForExpect(async () => {
      const dbTrade = await tradeDataAgent.findOne({ sourceId: data.trade.vaktId }, TradeSource.Vakt)
      expect(dbTrade.sourceId).toEqual(data.trade.vaktId)
    })

    await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_CargoData, data.cargo)
    await waitForExpect(async () => {
      const dbCargo = await cargoDataAgent.findOne({ sourceId: data.cargo.vaktId }, TradeSource.Vakt)
      expect(dbCargo.sourceId).toEqual(data.cargo.vaktId)
    })

    const parcel = data.cargo.parcels[0]
    parcel.dischargeArea = 'TEST_PORT'
    data.cargo.parcels = [parcel]

    const expectedCargo = { ...data.cargo }
    delete expectedCargo.version
    delete expectedCargo.messageType
    await consumer.expectMessage(
      'INTERNAL.CARGO.Updated',
      {
        content: {
          cargo: {
            ...expectedCargo,
            parcels: expect.any(Array),
            source: 'VAKT',
            status: 'TO_BE_FINANCED',
            sourceId: expectedCargo.vaktId
          }
        }
      },
      done
    )
    await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_CargoData, data.cargo)
    await waitForExpect(async () => {
      const dbCargo = await cargoDataAgent.findOne({ sourceId: data.cargo.vaktId }, TradeSource.Vakt)
      const dbParcel = dbCargo.parcels[0]
      expect(dbCargo.vaktId).toEqual(data.cargo.vaktId)
      expect(dbParcel.dischargeArea).toEqual(parcel.dischargeArea)
    })
  })

  it('save cargo without trade', async () => {
    const data = generateVaktMovementAMQPMessages()
    await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_CargoData, data.cargo)
    await waitForExpect(async () => {
      const dbCargo = await cargoDataAgent.findOne({ sourceId: data.cargo.vaktId }, TradeSource.Vakt)
      expect(dbCargo.sourceId).toEqual(data.cargo.vaktId)
    })
  })

  async function runSaveTradeTest(
    trade,
    expectedCreditRequirement = CreditRequirements.DocumentaryLetterOfCredit,
    done?: (trade) => void
  ) {
    await inboundPublisher.publishCritical(MESSAGE_TYPE.KOMGO_Trade_TradeData, trade)
    await waitForExpect(async () => {
      const dbTrade = await tradeDataAgent.findOne({ sourceId: trade.vaktId }, TradeSource.Vakt)
      expect(dbTrade.sourceId).toEqual(trade.vaktId)
      expect(dbTrade.creditRequirement).toEqual(expectedCreditRequirement)
      if (done) {
        done(dbTrade)
      }
    })
  }
})
