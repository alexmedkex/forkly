import { ITradeMessage } from '@komgo/messaging-types'
import { buildFakeTradeSnapshot, CreditRequirements, ITradeSnapshot } from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { ShareTradeSnapshotUseCase } from '../../trade-snapshot/use-cases'
import { TradeSnapshotValidator } from '../../validation'

import { ReceiveTradeUseCase } from './'

const mockOpenCreditTradeMessage: ITradeMessage = {
  trade: {
    sourceId: 'sourceId',
    creditRequirement: CreditRequirements.OpenCredit
  }
}

describe('ReceiveTradeUseCase', () => {
  let useCase: ReceiveTradeUseCase
  let mockTradeSnapshotDataAgent: jest.Mocked<TradeSnapshotDataAgent>
  let mockTradeSnapshotValidator: jest.Mocked<TradeSnapshotValidator>
  let mockShareTradeSnapshotUseCase: jest.Mocked<ShareTradeSnapshotUseCase>

  beforeEach(() => {
    mockTradeSnapshotDataAgent = createMockInstance(TradeSnapshotDataAgent)
    mockTradeSnapshotValidator = createMockInstance(TradeSnapshotValidator)
    mockShareTradeSnapshotUseCase = createMockInstance(ShareTradeSnapshotUseCase)

    useCase = new ReceiveTradeUseCase(
      mockTradeSnapshotDataAgent,
      mockTradeSnapshotValidator,
      mockShareTradeSnapshotUseCase
    )
  })

  it('should execute use case successfully', async () => {
    const snapshot = buildFakeTradeSnapshot()
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(snapshot)

    await useCase.execute(mockOpenCreditTradeMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledWith({
      ...createMockCleanSnapshot(snapshot),
      trade: mockOpenCreditTradeMessage.trade
    })
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(1)
  })

  it('should ignore message if is not Open Credit', async () => {
    const tradeMessage: ITradeMessage = {
      trade: {
        sourceId: 'sourceId',
        creditRequirement: CreditRequirements.DocumentaryLetterOfCredit
      }
    }
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(buildFakeTradeSnapshot())

    await useCase.execute(tradeMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(0)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(0)
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(0)
  })

  it('should ignore message if the received trade is older than the saved one', async () => {
    const receivedCreatedAtDate = new Date()
    receivedCreatedAtDate.setDate(receivedCreatedAtDate.getDate() - 5)
    const tradeMessage: ITradeMessage = {
      trade: {
        sourceId: 'sourceId',
        updatedAt: receivedCreatedAtDate,
        creditRequirement: CreditRequirements.OpenCredit
      }
    }
    const snapshot: ITradeSnapshot = buildFakeTradeSnapshot()
    snapshot.trade.updatedAt = new Date()
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(snapshot)

    await useCase.execute(tradeMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(0)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(0)
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(0)
  })

  it('should ignore message if there is no trade snapshot', async () => {
    await useCase.execute(mockOpenCreditTradeMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(0)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(0)
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(0)
  })

  it('should not save and only share message if the date of the received Trade is the same as the saved one', async () => {
    const receivedCreatedAtDate = new Date()
    receivedCreatedAtDate.setDate(receivedCreatedAtDate.getDate() - 5)
    const tradeMessage: ITradeMessage = {
      trade: {
        sourceId: 'sourceId',
        updatedAt: receivedCreatedAtDate,
        creditRequirement: CreditRequirements.OpenCredit
      }
    }
    const snapshot: ITradeSnapshot = buildFakeTradeSnapshot()
    snapshot.trade.updatedAt = receivedCreatedAtDate
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(snapshot)

    await useCase.execute(tradeMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(0)
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(1)
  })

  function createMockCleanSnapshot(snapshot: ITradeSnapshot) {
    const newUpdatedSnapshot = { ...snapshot }
    delete newUpdatedSnapshot.createdAt
    delete newUpdatedSnapshot.updatedAt
    return newUpdatedSnapshot
  }
})
