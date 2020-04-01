import { buildFakeDisclosedDepositLoan, DepositLoanType, DepositLoanPeriod, Currency } from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import { stringify } from 'qs'
import 'reflect-metadata'

import DisclosedDepositLoanDataAgent from '../../data-layer/data-agents/DisclosedDepositLoanDataAgent'
import { IDisclosedDepositLoanDataAgent } from '../../data-layer/data-agents/IDisclosedDepositLoanDataAgent'

import { DisclosedDepositLoanController } from './DisclosedDepositLoanController'
import { DepositLoanTypeFeature } from './utils'

describe('DisclosedDepositLoanController', () => {
  let mockDisclosedDataAgent: jest.Mocked<IDisclosedDepositLoanDataAgent>
  let controller: DisclosedDepositLoanController
  const mockDisclosedDL = buildFakeDisclosedDepositLoan()

  const fakeSummary = {
    type: DepositLoanTypeFeature.Loan,
    currency: Currency.EUR,
    period: DepositLoanPeriod.Months,
    periodDuration: 1,
    lowestPricing: 1,
    appetiteCount: 3,
    lastUpdated: new Date('2019-01-01').toISOString()
  }

  beforeEach(() => {
    mockDisclosedDataAgent = createMockInstance(DisclosedDepositLoanDataAgent)
    controller = new DisclosedDepositLoanController(mockDisclosedDataAgent)
  })

  describe('.find', () => {
    it('should return disclosed deposit / loan', async () => {
      const filter = {}
      const query = stringify(filter)
      mockDisclosedDataAgent.find.mockResolvedValue([mockDisclosedDL])
      expect(await controller.find(DepositLoanTypeFeature.Deposit, query)).toEqual([mockDisclosedDL])
      expect(mockDisclosedDataAgent.find).toHaveBeenCalledWith(DepositLoanType.Deposit, expect.anything())
    })

    it('should fail on invalid filter', async () => {
      const filter = {
        something: 'something'
      }
      const query = JSON.stringify(filter)
      await expect(controller.find(DepositLoanTypeFeature.Deposit, query)).rejects.toBeDefined()
    })
  })

  describe('.getById', () => {
    it('should return deposit / loan', async () => {
      mockDisclosedDataAgent.findOne.mockResolvedValue(mockDisclosedDL)
      expect(await controller.getById(DepositLoanTypeFeature.Loan, 'static-id')).toEqual(mockDisclosedDL)
      expect(mockDisclosedDataAgent.findOne).toHaveBeenCalledWith(DepositLoanType.Loan, { staticId: 'static-id' })
    })

    it('should rethrow error', async () => {
      const error = new Error('error')
      mockDisclosedDataAgent.findOne.mockRejectedValue(error)

      await expect(controller.getById(DepositLoanTypeFeature.Deposit, 'static-id')).rejects.toBe(error)
    })
  })

  describe('.getSummary', () => {
    it('should return deposit / loan summary', async () => {
      mockDisclosedDataAgent.disclosedSummary.mockResolvedValue([fakeSummary])
      expect(await controller.getSummary(DepositLoanTypeFeature.Loan)).toEqual([fakeSummary])
      expect(mockDisclosedDataAgent.disclosedSummary).toHaveBeenCalledWith(DepositLoanType.Loan, expect.anything())
    })

    it('should rethrow error', async () => {
      const error = new Error('error')
      mockDisclosedDataAgent.disclosedSummary.mockRejectedValue(error)

      await expect(controller.getSummary(DepositLoanTypeFeature.Deposit)).rejects.toBe(error)
    })
  })
})
