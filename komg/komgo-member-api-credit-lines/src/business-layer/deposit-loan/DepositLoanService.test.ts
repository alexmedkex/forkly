import {
  DepositLoanType,
  buildFakeShareDepositLoan,
  buildFakeSaveDepositLoan,
  buildFakeDepositLoan
} from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import DepositLoanDataAgent from '../../data-layer/data-agents/DepositLoanDataAgent'
import { IDepositLoanDataAgent } from '../../data-layer/data-agents/IDepositLoanDataAgent'
import { ISharedDepositLoanDataAgent } from '../../data-layer/data-agents/ISharedDepositLoanDataAgent'
import SharedDepositLoanDataAgent from '../../data-layer/data-agents/SharedDepositLoanDataAgent'

import DepositLoanService from './DepositLoanService'
import { IDepositLoanRequestService, DepositLoanRequestService } from './DepositLoanRequestService'
import { ShareDepositLoanService } from './ShareDepositLoanService'

describe('DepositLoanService', () => {
  let service: DepositLoanService
  let mockRequestService: jest.Mocked<IDepositLoanRequestService>
  let mockDepositLoanDataAgent: jest.Mocked<IDepositLoanDataAgent>
  let mockSharedDepositLoanDataAgent: jest.Mocked<ISharedDepositLoanDataAgent>
  let mockShareDepositLoanService: jest.Mocked<ShareDepositLoanService>
  const mockDepositLoanData = buildFakeDepositLoan()
  const mockSharedDepositLoanData = buildFakeShareDepositLoan()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDepositLoanDataAgent = createMockInstance(DepositLoanDataAgent)
    mockSharedDepositLoanDataAgent = createMockInstance(SharedDepositLoanDataAgent)
    mockShareDepositLoanService = createMockInstance(ShareDepositLoanService)
    mockRequestService = createMockInstance(DepositLoanRequestService)

    mockDepositLoanDataAgent.get.mockResolvedValue(mockDepositLoanData)
    mockDepositLoanDataAgent.find.mockResolvedValue([mockDepositLoanData])
    mockSharedDepositLoanDataAgent.find.mockResolvedValue([mockSharedDepositLoanData])
    mockDepositLoanDataAgent.findOne.mockResolvedValue(null)

    service = new DepositLoanService(
      mockRequestService,
      mockDepositLoanDataAgent,
      mockSharedDepositLoanDataAgent,
      mockShareDepositLoanService
    )
  })

  describe('.get', () => {
    it('should retieve deposit/loan with shared data', async () => {
      const staticId = 'static-id'

      expect(await service.get(DepositLoanType.Deposit, staticId)).toMatchObject({
        ...mockDepositLoanData,
        sharedWith: [mockSharedDepositLoanData]
      })
    })
  })

  describe('.find', () => {
    it('should retieve deposit/loan with shared data', async () => {
      const filter = {}

      expect(await service.find(DepositLoanType.Deposit, filter)).toMatchObject([
        {
          ...mockDepositLoanData,
          sharedWith: [mockSharedDepositLoanData]
        }
      ])

      expect(mockDepositLoanDataAgent.find).toHaveBeenCalledWith(
        { type: DepositLoanType.Deposit },
        undefined,
        undefined
      )
    })
  })

  describe('.delete', () => {
    it('should delete deposit/loan with shared data', async () => {
      await service.delete(DepositLoanType.Deposit, mockDepositLoanData.staticId)

      expect(mockDepositLoanDataAgent.delete).toHaveBeenCalledWith(mockDepositLoanData.staticId)
      expect(mockSharedDepositLoanDataAgent.delete).toHaveBeenCalledWith(mockSharedDepositLoanData.staticId)
    })
  })

  describe('.create', () => {
    const request = buildFakeSaveDepositLoan()

    it('should sucessfully create deposit/loan', async () => {
      mockDepositLoanDataAgent.findOne.mockResolvedValueOnce(null)
      mockDepositLoanDataAgent.create.mockResolvedValueOnce('static-id')

      await service.create(DepositLoanType.Loan, request)

      expect(mockDepositLoanDataAgent.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: DepositLoanType.Loan })
      )
      expect(mockSharedDepositLoanDataAgent.create).toHaveBeenCalledWith(
        expect.objectContaining({ depositLoanStaticId: 'static-id' })
      )
      expect(mockSharedDepositLoanDataAgent.create).toHaveBeenCalledTimes(1)
      expect(mockDepositLoanDataAgent.findOne).toHaveBeenCalledWith({
        type: DepositLoanType.Loan,
        currency: request.currency,
        period: request.period,
        periodDuration: request.periodDuration
      })
    })

    it('should fail if data for same key parameters exists', async () => {
      mockDepositLoanDataAgent.findOne.mockResolvedValueOnce(mockDepositLoanData)

      const resp = service.create(DepositLoanType.Loan, request)

      await expect(resp).rejects.toMatchObject({
        message: `${DepositLoanType.Loan} with specified parameters already exists`
      })

      expect(mockDepositLoanDataAgent.create).not.toHaveBeenCalled()
      expect(mockSharedDepositLoanDataAgent.create).not.toHaveBeenCalled()
    })
  })

  describe('.update', () => {
    let request
    beforeEach(() => {
      request = buildFakeSaveDepositLoan({ sharedWith: [] })
    })

    it('should sucessfully update deposit / loan', async () => {
      const mockShared1 = buildFakeShareDepositLoan({ staticId: '1', sharedWithStaticId: '1' })
      const mockShared2 = buildFakeShareDepositLoan({ staticId: '2', sharedWithStaticId: '2' })

      mockSharedDepositLoanDataAgent.find.mockResolvedValue([mockShared1, mockShared2])

      request = buildFakeSaveDepositLoan({
        sharedWith: [
          buildFakeShareDepositLoan({ sharedWithStaticId: '1' }),
          buildFakeShareDepositLoan({ sharedWithStaticId: '3' })
        ]
      })

      const { sharedWith, ...data } = request

      const staticId = 'static-id'
      mockDepositLoanDataAgent.update.mockResolvedValue({
        staticId,
        ...data
      })

      await service.update(DepositLoanType.Loan, staticId, request)

      expect(mockDepositLoanDataAgent.update).toHaveBeenCalledTimes(1)
      // static id changed, so create new one and remove old
      expect(mockSharedDepositLoanDataAgent.create).toHaveBeenCalledTimes(1)
      expect(mockSharedDepositLoanDataAgent.delete).toHaveBeenCalledWith(mockShared2.staticId)
    })

    describe('error', () => {
      let request
      let mockShared1
      let mockShared2

      beforeEach(() => {
        mockShared1 = buildFakeShareDepositLoan({ staticId: '1', sharedWithStaticId: '1' })
        mockShared2 = buildFakeShareDepositLoan({ staticId: '2', sharedWithStaticId: '2' })
        request = buildFakeSaveDepositLoan({ sharedWith: [mockShared1, mockShared2] })
      })

      it('should retrow error from deposit / loan save', async () => {
        const err = new Error('some error')
        mockDepositLoanDataAgent.update.mockRejectedValue(err)
        const staticId = 'static-id'
        const resp = service.update(DepositLoanType.Loan, staticId, request)

        await expect(resp).rejects.toBe(err)

        expect(mockSharedDepositLoanDataAgent.create).not.toHaveBeenCalled()
        expect(mockSharedDepositLoanDataAgent.delete).not.toHaveBeenCalledWith()
      })

      it('should retrow error from shared data save', async () => {
        const err = new Error('some error')
        mockSharedDepositLoanDataAgent.find.mockResolvedValue([])
        mockSharedDepositLoanDataAgent.create.mockRejectedValue(err)
        const staticId = 'static-id'
        const { sharedWith, ...data } = request
        mockDepositLoanDataAgent.update.mockResolvedValue({
          staticId,
          ...data
        })

        const resp = service.update(DepositLoanType.Loan, staticId, request)

        await expect(resp).rejects.toBe(err)
      })

      it('should retrow error from shared data update', async () => {
        mockSharedDepositLoanDataAgent.find.mockResolvedValue([mockShared1, mockShared2])

        const err = new Error('some error')
        mockSharedDepositLoanDataAgent.update.mockRejectedValue(err)

        const staticId = 'static-id'
        const { sharedWith, ...data } = request
        mockDepositLoanDataAgent.update.mockResolvedValue({
          staticId,
          ...data
        })
        const resp = service.update(DepositLoanType.Loan, staticId, request)

        await expect(resp).rejects.toBe(err)
      })

      it('should retrow error from shared data delete', async () => {
        const err = new Error('some error')
        mockSharedDepositLoanDataAgent.delete.mockRejectedValue(err)
        const staticId = 'static-id'
        const { sharedWith, ...data } = request
        mockDepositLoanDataAgent.update.mockResolvedValue({
          staticId,
          ...data
        })
        const resp = service.update(DepositLoanType.Loan, staticId, request)

        await expect(resp).rejects.toBe(err)
      })
    })
  })
})
