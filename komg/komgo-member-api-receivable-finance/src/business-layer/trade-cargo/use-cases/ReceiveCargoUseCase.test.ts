import { ICargoMessage } from '@komgo/messaging-types'
import { buildFakeTradeSnapshot, Grade, ITradeSnapshot } from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { InvalidPayloadProcessingError } from '../../errors'
import { ShareTradeSnapshotUseCase } from '../../trade-snapshot/use-cases'
import { TradeSnapshotValidator } from '../../validation'

import { ReceiveCargoUseCase } from './'

const mockCargoBrent = {
  sourceId: 'sourceId',
  _id: '_id',
  grade: Grade.Brent
}

const mockCargoTroll = {
  sourceId: 'sourceId',
  _id: '_id2',
  grade: Grade.Troll
}

const mockCargoMessage: ICargoMessage = {
  cargo: mockCargoBrent
}

describe('ReceiveCargoUseCase', () => {
  let useCase: ReceiveCargoUseCase
  let mockTradeSnapshotDataAgent: jest.Mocked<TradeSnapshotDataAgent>
  let mockTradeSnapshotValidator: jest.Mocked<TradeSnapshotValidator>
  let mockShareTradeSnapshotUseCase: jest.Mocked<ShareTradeSnapshotUseCase>

  beforeEach(() => {
    mockTradeSnapshotDataAgent = createMockInstance(TradeSnapshotDataAgent)
    mockTradeSnapshotValidator = createMockInstance(TradeSnapshotValidator)
    mockShareTradeSnapshotUseCase = createMockInstance(ShareTradeSnapshotUseCase)

    useCase = new ReceiveCargoUseCase(
      mockTradeSnapshotDataAgent,
      mockTradeSnapshotValidator,
      mockShareTradeSnapshotUseCase
    )
  })

  it('should execute use case successfully, updating cargo with different grade', async () => {
    const snapshot = buildFakeTradeSnapshot()
    snapshot.movements = [{ ...mockCargoBrent, grade: Grade.Ekofisk }, mockCargoTroll]
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(snapshot)

    await useCase.execute(mockCargoMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledWith(
      expect.objectContaining({
        ...createMockCleanSnapshot(snapshot),
        movements: expect.arrayContaining([mockCargoTroll, mockCargoBrent])
      })
    )
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(1)
  })

  it('should execute use case successfully, adding cargo if no cargo exist with same id', async () => {
    const snapshot = buildFakeTradeSnapshot()
    snapshot.movements = [mockCargoTroll]
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(snapshot)

    await useCase.execute(mockCargoMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledWith(
      expect.objectContaining({
        ...createMockCleanSnapshot(snapshot),
        movements: expect.arrayContaining([mockCargoTroll, mockCargoBrent])
      })
    )
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(1)
  })

  it('should execute use case successfully, adding cargo if movements is empty for the snapshot', async () => {
    const snapshot = buildFakeTradeSnapshot()
    snapshot.movements = []
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(snapshot)

    await useCase.execute(mockCargoMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledWith({
      ...createMockCleanSnapshot(snapshot),
      movements: [{ ...mockCargoBrent }]
    })
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(1)
  })

  it('should throw InvalidPayloadProcessingError if it finds multiple movements with same _id', async () => {
    const snapshot = buildFakeTradeSnapshot()
    snapshot.movements = [{ ...mockCargoBrent, grade: Grade.Ekofisk }, mockCargoBrent]
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(snapshot)

    await expect(useCase.execute(mockCargoMessage)).rejects.toThrowError(InvalidPayloadProcessingError)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(0)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(0)
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(0)
  })

  it('should ignore message if the received trade is older than the saved one', async () => {
    const receivedCreatedAtDate = new Date()
    receivedCreatedAtDate.setDate(receivedCreatedAtDate.getDate() - 5)
    const cargoMessage: ICargoMessage = {
      cargo: {
        ...mockCargoBrent,
        updatedAt: receivedCreatedAtDate
      }
    }
    const snapshot: ITradeSnapshot = buildFakeTradeSnapshot()
    snapshot.movements = [mockCargoBrent]
    snapshot.movements[0].updatedAt = new Date()
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(snapshot)

    await useCase.execute(cargoMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(0)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(0)
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(0)
  })

  it('should ignore message if there is no trade snapshot', async () => {
    await useCase.execute(mockCargoMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(0)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(0)
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(0)
  })

  it('should not save and only share message if the date of the received Cargo is the same as the saved one', async () => {
    const receivedCreatedAtDate = new Date()
    const cargoMessage: ICargoMessage = {
      cargo: {
        ...mockCargoBrent,
        updatedAt: receivedCreatedAtDate
      }
    }
    const snapshot: ITradeSnapshot = buildFakeTradeSnapshot()
    snapshot.movements = [mockCargoBrent]
    snapshot.movements[0].updatedAt = receivedCreatedAtDate
    mockTradeSnapshotDataAgent.findByTradeSourceId.mockResolvedValueOnce(snapshot)

    await useCase.execute(cargoMessage)

    expect(mockTradeSnapshotValidator.validateAcceptedRD).toBeCalledTimes(1)
    expect(mockShareTradeSnapshotUseCase.execute).toBeCalledTimes(1)
    expect(mockTradeSnapshotDataAgent.update).toBeCalledTimes(0)
  })

  function createMockCleanSnapshot(snapshot: ITradeSnapshot) {
    const newUpdatedSnapshot = { ...snapshot }
    delete newUpdatedSnapshot.createdAt
    delete newUpdatedSnapshot.updatedAt
    return newUpdatedSnapshot
  }
})
