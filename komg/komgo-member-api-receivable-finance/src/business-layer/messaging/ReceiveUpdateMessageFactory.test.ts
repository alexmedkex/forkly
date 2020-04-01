import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceiveFinalAgreedTermsUpdateUseCase } from '../quotes/use-cases'
import { ReceiveRDUpdateUseCase } from '../rd/use-cases'
import { ReceiveTradeSnapshotUpdateUseCase } from '../trade-snapshot/use-cases'
import { UpdateType } from '../types'

import { ReceiveUpdateMessageFactory } from './ReceiveUpdateMessageFactory'

describe('ReceiveUpdateMessageFactory', () => {
  let factory: ReceiveUpdateMessageFactory
  let mockReceiveRDUpdateUseCase: jest.Mocked<ReceiveRDUpdateUseCase>
  let mockReceiveQuoteUpdateUseCase: jest.Mocked<ReceiveFinalAgreedTermsUpdateUseCase>
  let mockReceiveTradeSnapshotUpdateUseCase: jest.Mocked<ReceiveTradeSnapshotUpdateUseCase>

  beforeEach(() => {
    mockReceiveRDUpdateUseCase = createMockInstance(ReceiveRDUpdateUseCase)
    mockReceiveQuoteUpdateUseCase = createMockInstance(ReceiveFinalAgreedTermsUpdateUseCase)
    mockReceiveTradeSnapshotUpdateUseCase = createMockInstance(ReceiveTradeSnapshotUpdateUseCase)

    factory = new ReceiveUpdateMessageFactory(
      mockReceiveRDUpdateUseCase,
      mockReceiveQuoteUpdateUseCase,
      mockReceiveTradeSnapshotUpdateUseCase
    )
  })

  it('should return ReceiveRDUpdateUseCase for UpdateType.ReceivablesDiscounting', () => {
    const useCase = factory.getUseCase(UpdateType.ReceivablesDiscounting)
    expect(useCase).toBe(mockReceiveRDUpdateUseCase)
  })

  it('should return ReceiveFinalAgreedTermsUpdateUseCase for UpdateType.FinalAgreedTermsData', () => {
    const useCase = factory.getUseCase(UpdateType.FinalAgreedTermsData)
    expect(useCase).toBe(mockReceiveQuoteUpdateUseCase)
  })

  it('should return ReceiveTradeSnapshotUpdateUseCase for UpdateType.TradeSnapshot', () => {
    const useCase = factory.getUseCase(UpdateType.TradeSnapshot)
    expect(useCase).toBe(mockReceiveTradeSnapshotUpdateUseCase)
  })

  it('should return undefined if no use case found matching UpdateType', () => {
    const useCase = factory.getUseCase('InvalidUpdateType' as any)
    expect(useCase).toBe(undefined)
  })
})
