import 'reflect-metadata'
import { TradeEventProcessor, ITradeMessage, ICargoMessage } from './TradeEventProcessor'
import { TradeMessageType } from '../messaging/messageTypes'
import { IMessageReceived } from '@komgo/messaging-library'
import { TaskManager } from '@komgo/notification-publisher'
import createMockInstance from 'jest-create-mock-instance'
import { TRADE_FINANCE_PRODUCT_ID, TRADE_FINANCE_ACTION } from '../tasks/permissions'
import { LCCacheDataAgent } from '../../data-layer/data-agents'
import { LC_STATE } from '../events/LC/LCStates'
import { fakeLetterOfCredit } from '../messaging/mock-data/fakeLetterOfCredit'
import { fakeTradeAndCargoSnapshot, fakeTrade } from '../messaging/mock-data/fakeTradeCargo'
import { LCAmendmentTaskType, TradeSource } from '@komgo/types'

let tradeEventProcessor
let logger

let taskClientMock: jest.Mocked<TaskManager>
let lcDataAgentMock: jest.Mocked<LCCacheDataAgent>

const myFakeCompanyId = 'myFakeCompanyId'
const someCompanyId = 'someCompanyId'
const aSourceId = 'aSourceId'
const fakeMongoId = 'fakeMongoId'
const buyerEtrmId = 'buyerEtrmId'
const lcReference = 'myLcReference'
const tradeMessageUUID = 'tradeMessageUUID'
const cargoMessageUUID = 'cargoMessageUUID'

const dummyTradeMessage: IMessageReceived = {
  routingKey: TradeMessageType.TradeUpdated,
  content: {
    trade: { sourceId: aSourceId, source: TradeSource.Vakt.toString() }
  },
  options: {
    messageId: tradeMessageUUID
  },
  ack: jest.fn(),
  reject: jest.fn(),
  requeue: jest.fn()
}

const dummyCargoMessage: IMessageReceived = {
  routingKey: TradeMessageType.CargoUpdated,
  content: {
    cargo: { sourceId: aSourceId, source: TradeSource.Vakt.toString() }
  },
  options: {
    messageId: cargoMessageUUID
  },
  ack: jest.fn(),
  reject: jest.fn(),
  requeue: jest.fn()
}

const fakeLC = {
  ...fakeLetterOfCredit({
    applicantId: myFakeCompanyId,
    beneficiaryId: someCompanyId,
    reference: lcReference,
    tradeAndCargoSnapshot: fakeTradeAndCargoSnapshot({
      sourceId: aSourceId,
      trade: fakeTrade({ buyerEtrmId, vaktId: aSourceId })
    })
  }),
  _id: fakeMongoId
}

describe('TradeEventProcessor', () => {
  beforeEach(() => {
    taskClientMock = createMockInstance(TaskManager)
    lcDataAgentMock = createMockInstance(LCCacheDataAgent)
    lcDataAgentMock.getLCs.mockImplementation(() => [])

    tradeEventProcessor = new TradeEventProcessor(taskClientMock, myFakeCompanyId, lcDataAgentMock)
    logger = (tradeEventProcessor as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })
  it('returns correct keys from getKeysToProcess', async () => {
    const keys = await tradeEventProcessor.getKeysToProcess()

    expect(keys.length).toEqual(2)
    expect(keys).toContain(TradeMessageType.CargoUpdated)
    expect(keys).toContain(TradeMessageType.TradeUpdated)
  })
  describe(`${TradeMessageType.TradeUpdated}`, () => {
    it('calls the lcDataAgentMock with the correct query', async () => {
      await tradeEventProcessor.processEvent(dummyTradeMessage)

      expect(lcDataAgentMock.getLCs).toHaveBeenCalledWith({
        'tradeAndCargoSnapshot.sourceId': { $eq: aSourceId },
        status: { $nin: [LC_STATE.REQUEST_REJECTED, LC_STATE.ISSUED_LC_REJECTED] }
      })
    })
    it('does not call taskClient if there were no matching LCs', async () => {
      await tradeEventProcessor.processEvent(dummyTradeMessage)

      expect(taskClientMock.createTask).not.toHaveBeenCalled()
    })

    describe('with matching LCs', () => {
      beforeEach(() => {
        taskClientMock = createMockInstance(TaskManager)
        lcDataAgentMock = createMockInstance(LCCacheDataAgent)
        lcDataAgentMock.getLCs.mockImplementation(() => [fakeLC, fakeLC])

        tradeEventProcessor = new TradeEventProcessor(taskClientMock, myFakeCompanyId, lcDataAgentMock)
        logger = (tradeEventProcessor as any).logger
        logger.info = jest.fn()
        logger.warn = jest.fn()
        logger.error = jest.fn()
      })
      it('calls the task service once per LC', async () => {
        await tradeEventProcessor.processEvent(dummyTradeMessage)
        expect(taskClientMock.createTask).toBeCalledTimes(2)
      })
      it('calls the task service with the right object', async () => {
        await tradeEventProcessor.processEvent(dummyTradeMessage)

        const tradeMessage = `Trade ${buyerEtrmId} has been changed, request an amendment to ${lcReference}`

        expect(taskClientMock.createTask).toHaveBeenCalledWith(
          {
            summary: tradeMessage,
            taskType: LCAmendmentTaskType.ReviewTrade,
            context: { lcId: fakeMongoId, messageId: tradeMessageUUID },
            requiredPermission: {
              productId: TRADE_FINANCE_PRODUCT_ID,
              actionId: TRADE_FINANCE_ACTION.ManageLCRequest
            }
          },
          tradeMessage
        )
      })
      it('does not call the task service if the applicantId on the LC is not our id', async () => {
        lcDataAgentMock.getLCs.mockImplementationOnce(() => [{ ...fakeLC, applicantId: someCompanyId }])
        await tradeEventProcessor.processEvent(dummyTradeMessage)
        expect(taskClientMock.createTask).not.toHaveBeenCalled()
      })
    })
  })
  describe(`${TradeMessageType.CargoUpdated}`, () => {
    it('calls the lcDataAgentMock with the correct query', async () => {
      await tradeEventProcessor.processEvent(dummyCargoMessage)

      expect(lcDataAgentMock.getLCs).toHaveBeenCalledWith({
        'tradeAndCargoSnapshot.sourceId': { $eq: aSourceId },
        status: { $nin: [LC_STATE.REQUEST_REJECTED, LC_STATE.ISSUED_LC_REJECTED] }
      })
    })
    it('does not call taskClient if there were no matching LCs', async () => {
      await tradeEventProcessor.processEvent(dummyCargoMessage)

      expect(taskClientMock.createTask).not.toHaveBeenCalled()
    })

    describe('with matching LCs', () => {
      beforeEach(() => {
        taskClientMock = createMockInstance(TaskManager)
        lcDataAgentMock = createMockInstance(LCCacheDataAgent)
        lcDataAgentMock.getLCs.mockImplementation(() => [fakeLC, fakeLC])

        tradeEventProcessor = new TradeEventProcessor(taskClientMock, myFakeCompanyId, lcDataAgentMock)
        logger = (tradeEventProcessor as any).logger
        logger.info = jest.fn()
        logger.warn = jest.fn()
        logger.error = jest.fn()
      })
      it('calls the task service once per LC', async () => {
        await tradeEventProcessor.processEvent(dummyCargoMessage)
        expect(taskClientMock.createTask).toBeCalledTimes(2)
      })
      it('calls the task service with the right object', async () => {
        await tradeEventProcessor.processEvent(dummyCargoMessage)

        const tradeMessage = `Trade ${buyerEtrmId} has been changed, request an amendment to ${lcReference}`

        expect(taskClientMock.createTask).toHaveBeenCalledWith(
          {
            summary: tradeMessage,
            taskType: LCAmendmentTaskType.ReviewTrade,
            context: { lcId: fakeMongoId, messageId: cargoMessageUUID },
            requiredPermission: {
              productId: TRADE_FINANCE_PRODUCT_ID,
              actionId: TRADE_FINANCE_ACTION.ManageLCRequest
            }
          },
          tradeMessage
        )
      })
      it('does not call the task service if the applicantId on the LC is not our id', async () => {
        lcDataAgentMock.getLCs.mockImplementationOnce(() => [{ ...fakeLC, applicantId: someCompanyId }])
        await tradeEventProcessor.processEvent(dummyCargoMessage)
        expect(taskClientMock.createTask).not.toHaveBeenCalled()
      })
    })
  })
})
