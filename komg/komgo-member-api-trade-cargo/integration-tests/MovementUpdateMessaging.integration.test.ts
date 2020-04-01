import 'reflect-metadata'
import { axiosMock, getAPI, postAPI, putAPI } from './utils/axios-utils'
const waitForExpect = require('wait-for-expect')
import { IntegrationEnvironment, sleep } from './utils/IntegrationEnvironment'
import { ICargo, ITrade } from '@komgo/types'
import { generateMovementData, integrationTestBuyerStaticId, TradeType } from './utils/utils'
import { ConsumerMicroservice, AMQPConfig } from '@komgo/integration-test-utilities'
import { VALUES } from '../src/inversify/values'
import { IMessageReceived } from '@komgo/messaging-library'
import { TradeCargoRoutingKey } from '@komgo/messaging-types'
import { v4 as uuid4 } from 'uuid'

jest.setTimeout(90000)
let environment: IntegrationEnvironment

describe('MovementUpdateMessaging', () => {
  let consumer: ConsumerMicroservice
  const consumerName = 'consumer-mock-id'

  beforeAll(async () => {
    environment = new IntegrationEnvironment()
    await environment.start(integrationTestBuyerStaticId)
  })

  beforeEach(async () => {
    await environment.beforeEach(axiosMock)
    consumer = new ConsumerMicroservice(
      environment.container.get<string>(VALUES.TradeCargoPublisherId),
      new AMQPConfig(),
      consumerName
    )
    await consumer.beforeEach()
    await consumer.registerQueue()
  })

  afterEach(async () => {
    await environment.afterEach(axiosMock)
    await consumer.afterEach()
  })

  afterAll(async () => {
    await environment.stop(axiosMock)
  })

  it.only('should publish AMQP message when updating a trade', async done => {
    const createdTrade = await createTrade()
    delete createdTrade.updatedAt
    createdTrade.price = 150
    // tslint:disable-next-line: no-string-literal
    delete createdTrade['__v'] // should not be returned by GET endopint (use versionKeys:false in mongoose)

    await consumer.expectMessage(
      TradeCargoRoutingKey.TradeUpdated,
      {
        hasError: false,
        hasMessageId: true,
        routingKey: TradeCargoRoutingKey.TradeUpdated,
        content: {
          trade: expect.objectContaining(createdTrade)
        }
      },
      done
    )

    await putAPI(`trades/${createdTrade._id}`, createUpdateTradeModel(createdTrade))
  })

  it('should NOT publish AMQP message when the trade updated doesnt change content', async () => {
    const createdTrade = await createTrade()
    delete createdTrade.updatedAt
    // tslint:disable-next-line: no-string-literal
    delete createdTrade['__v'] // should not be returned by GET endopint (use versionKeys:false in mongoose)

    await putAPI(`trades/${createdTrade._id}`, createUpdateTradeModel(createdTrade))

    await sleep(1000) // give some time to publish the message
    await waitForExpect(async () => {
      const message: IMessageReceived = await consumer.messagingConsumer.get(
        environment.container.get<string>(VALUES.TradeCargoPublisherId),
        [TradeCargoRoutingKey.TradeUpdated]
      )
      expect(message).toBeUndefined()
    })
  })

  it('should publish AMQP message when creating & updating a Cargo', async done => {
    const cargo: ICargo = await createCargo('buyer3')

    await validateCreateCargoUpdateMessage(cargo)

    cargo.parcels = []
    cargo.grade = 'OSEBERG'
    await consumer.expectMessage(
      TradeCargoRoutingKey.CargoUpdated,
      {
        hasError: false,
        hasMessageId: true,
        routingKey: TradeCargoRoutingKey.CargoUpdated,
        content: {
          cargo: expect.objectContaining({ ...cargo, updatedAt: expect.anything() }) // ignore updatedAt as will be different
        }
      },
      done
    )

    await putAPI(`movements/${cargo.cargoId}`, cargo)
  })

  it('should NOT publish AMQP message when the cargo updated doesnt change content', async () => {
    const cargo: ICargo = await createCargo('buyer4')

    await validateCreateCargoUpdateMessage(cargo)
    await putAPI(`movements/${cargo.cargoId}`, cargo)

    await sleep(1000) // give some time to publish the message
    await waitForExpect(async () => {
      const message: IMessageReceived = await consumer.messagingConsumer.get(
        environment.container.get<string>(VALUES.TradeCargoPublisherId),
        [TradeCargoRoutingKey.CargoUpdated]
      )
      expect(message).toBeUndefined()
    })
  })

  function createUpdateTradeModel(createdTrade: ITrade): ITrade {
    // LS (aka boss) workaround it seems the UI is fixing this somehow.
    // casing ISO Date string to simple date
    const [dealDate] = (createdTrade.dealDate as string).split('T')
    const [startDate] = (createdTrade.deliveryPeriod.startDate as string).split('T')
    const [endDate] = (createdTrade.deliveryPeriod.endDate as string).split('T')
    return {
      ...createdTrade,
      dealDate,
      deliveryPeriod: { startDate, endDate }
    }
  }

  async function createTrade(): Promise<ITrade> {
    const { tradeBase } = generateMovementData(TradeType.Buyer)
    const createdTrade = await postAPI(`trades`, tradeBase)
    const getTrade = await getAPI<ITrade>(`trades/${createdTrade.data._id}`)
    return getTrade.data
  }

  async function createCargo(buyerId: string): Promise<ICargo> {
    const { cargoBase, tradeBase } = generateMovementData(TradeType.Buyer)
    cargoBase.cargoId = uuid4()
    cargoBase.originOfGoods = `origin is from ${buyerId}`
    const createdTrade = await postAPI(`trades`, tradeBase)
    await postAPI(`movements`, {
      ...cargoBase,
      sourceId: createdTrade.data.sourceId
    })
    const apiTradeMovements = await getAPI<ICargo[]>(`trades/${createdTrade.data._id}/movements`)
    const cargo = apiTradeMovements.data[0]
    // tslint:disable-next-line: no-string-literal
    delete cargo['__v']
    return cargo
  }

  async function validateCreateCargoUpdateMessage(cargo: ICargo) {
    await waitForExpect(async () => {
      // capture message when the first movement is created
      const message: IMessageReceived = await consumer.messagingConsumer.get(
        environment.container.get<string>(VALUES.TradeCargoPublisherId),
        [TradeCargoRoutingKey.CargoUpdated]
      )

      expect(message).toBeDefined()
      try {
        expect(message.content).toEqual({
          cargo: expect.objectContaining({ ...cargo })
        })
        message.ack()
      } catch (e) {
        message.requeue()
        throw e
      }
    })
  }
})
