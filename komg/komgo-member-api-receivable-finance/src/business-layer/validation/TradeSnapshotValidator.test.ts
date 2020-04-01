import { buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent, ReplyDataAgent } from '../../data-layer/data-agents'
import { buildFakeReply } from '../../data-layer/data-agents/utils/faker'

import { TradeSnapshotValidator } from '.'

describe('TradeSnapshotValidator', () => {
  let validator: TradeSnapshotValidator
  let mockRdDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockReplyDataAgent: jest.Mocked<ReplyDataAgent>

  beforeEach(() => {
    mockRdDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockReplyDataAgent = createMockInstance(ReplyDataAgent)

    validator = new TradeSnapshotValidator(mockReplyDataAgent, mockRdDataAgent)
  })

  describe('validateRDExists', () => {
    it('should not throw if RD exists', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      mockRdDataAgent.findByTradeSourceId.mockResolvedValueOnce(rd)

      await validator.validateRDExists('tradeId')
    })

    it('should throw if RD doesnt exist', async () => {
      mockRdDataAgent.findByTradeSourceId.mockRejectedValueOnce(new Error())

      await expect(validator.validateRDExists('tradeId')).rejects.toThrow()
    })
  })

  describe('validateAcceptedRD', () => {
    it('should not throw if RD exists', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      const rfpReply = buildFakeReply()
      mockRdDataAgent.findByTradeSourceId.mockResolvedValueOnce(rd)
      mockReplyDataAgent.findByRdIdAndType.mockResolvedValueOnce(rfpReply)

      await validator.validateAcceptedRD('tradeId')
    })

    it('should throw if RD doesnt exist', async () => {
      mockRdDataAgent.findByTradeSourceId.mockRejectedValueOnce(new Error())

      await expect(validator.validateAcceptedRD('tradeId')).rejects.toThrow()
    })

    it('should throw if RD doesnt exist', async () => {
      const rd = buildFakeReceivablesDiscountingExtended()
      mockRdDataAgent.findByTradeSourceId.mockResolvedValueOnce(rd)
      mockReplyDataAgent.findByRdIdAndType.mockRejectedValueOnce(new Error())

      await expect(validator.validateAcceptedRD('tradeId')).rejects.toThrow()
    })
  })
})
