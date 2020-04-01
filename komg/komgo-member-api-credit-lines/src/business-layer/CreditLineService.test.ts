import { buildFakeSharedCreditLine, buildFakeCreditLine, ICreditLineSaveRequest } from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import CreditLineDataAgent from '../data-layer/data-agents/CreditLineDataAgent'
import SharedCreditLineDataAgent from '../data-layer/data-agents/SharedCreditLineDataAgent'

import { CreditLineRequestService } from './CreditLineRequestService'
import CreditLineService from './CreditLineService'
import { PRODUCT_ID, SUB_PRODUCT_ID } from './notifications'
import { ShareCreditLineService } from './ShareCreditLineService'

let creditLineService: CreditLineService
let creditLinedataAgent: jest.Mocked<CreditLineDataAgent>
let sharedCreditLineDataAgent: jest.Mocked<SharedCreditLineDataAgent>
let shareCreditLineService: jest.Mocked<ShareCreditLineService>
let creditLineRequestService: jest.Mocked<CreditLineRequestService>

describe('CreditLineService', () => {
  beforeEach(() => {
    creditLinedataAgent = createMockInstance(CreditLineDataAgent)
    sharedCreditLineDataAgent = createMockInstance(SharedCreditLineDataAgent)
    shareCreditLineService = createMockInstance(ShareCreditLineService)
    creditLineRequestService = createMockInstance(CreditLineRequestService)
    creditLineService = new CreditLineService(
      shareCreditLineService,
      creditLineRequestService,
      creditLinedataAgent,
      sharedCreditLineDataAgent
    )
  })

  describe('.get', () => {
    it('should get credit lines with shared credit lines', async () => {
      const creditLine = buildFakeCreditLine()
      const sharedCL = buildFakeSharedCreditLine()

      creditLinedataAgent.get.mockResolvedValue(creditLine)
      sharedCreditLineDataAgent.find.mockResolvedValue([sharedCL])

      const result = await creditLineService.get(creditLine.staticId)

      expect(result.staticId).toBe(creditLine.staticId)
      expect(result.sharedCreditLines[0].staticId).toBe(sharedCL.staticId)
    })
  })

  describe('.find', () => {
    it('should find credit lines with shared credit lines', async () => {
      const creditLine = buildFakeCreditLine()
      const sharedCL = buildFakeSharedCreditLine()

      creditLinedataAgent.find.mockResolvedValue([creditLine])
      sharedCreditLineDataAgent.find.mockResolvedValue([sharedCL])

      const result = await creditLineService.find({})

      expect(result[0].staticId).toBe(creditLine.staticId)
      expect(result[0].sharedCreditLines[0].staticId).toBe(sharedCL.staticId)
    })
  })

  describe('.create', () => {
    it('create credit lines', async () => {
      const { staticId, ...data } = buildFakeCreditLine()
      creditLinedataAgent.findOne = jest.fn().mockReturnValue(null)
      const sharedCreditLine = buildFakeSharedCreditLine()
      const creditLine = { ...data, sharedCreditLines: [sharedCreditLine] }
      await creditLineService.create(creditLine as ICreditLineSaveRequest)

      expect(creditLinedataAgent.create).toBeCalled()
      expect(sharedCreditLineDataAgent.create).toBeCalled()
    })

    it('throw error if credit line exists', async () => {
      const { staticId, ...data } = buildFakeCreditLine()
      creditLinedataAgent.findOne.mockReturnValue({ staticId, ...data } as any)
      const sharedCreditLine = buildFakeSharedCreditLine()
      const creditLine = { ...data, sharedCreditLines: [sharedCreditLine] }
      await expect(creditLineService.create(creditLine as ICreditLineSaveRequest)).rejects.toMatchObject({
        status: 409
      })
      expect(creditLinedataAgent.findOne).toBeCalledWith({
        context: data.context,
        counterpartyStaticId: data.counterpartyStaticId
      })
      expect(creditLinedataAgent.create).not.toBeCalled()
      expect(sharedCreditLineDataAgent.create).not.toBeCalled()
    })
  })

  describe('.update', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('update credit lines', async () => {
      const { staticId, ...data } = {
        ...buildFakeCreditLine(),
        context: {
          productId: PRODUCT_ID.TradeFinance,
          subProductId: SUB_PRODUCT_ID.RiskCover
        }
      }
      const mockCLShared1 = {
        ...buildFakeSharedCreditLine(),
        staticId: '',
        sharedWithStaticId: 'shared-with-1',
        creditLineStaticId: 'credit-line-static-id-1'
      }
      const mockCLShared2 = {
        ...buildFakeSharedCreditLine(),
        staticId: 'static-id-2',
        sharedWithStaticId: 'shared-with-2',
        creditLineStaticId: 'credit-line-static-id-1'
      }
      const mockCLShared3 = {
        ...buildFakeSharedCreditLine(),
        staticId: 'static-id-3',
        sharedWithStaticId: 'shared-with-3',
        creditLineStaticId: 'credit-line-static-id-1'
      }

      creditLinedataAgent.get = jest.fn().mockReturnValue(data)

      const request = { ...data, sharedCreditLines: [mockCLShared1, mockCLShared2] }
      sharedCreditLineDataAgent.find = jest.fn().mockReturnValue([mockCLShared3, mockCLShared2])
      await creditLineService.update('credit-line-static-id-1', request as ICreditLineSaveRequest)

      expect(creditLinedataAgent.update).toBeCalledWith(
        expect.objectContaining({ staticId: 'credit-line-static-id-1', ...data })
      )

      expect(sharedCreditLineDataAgent.find).toBeCalledWith({ creditLineStaticId: 'credit-line-static-id-1' })
      expect(sharedCreditLineDataAgent.create).toBeCalledWith({ ...mockCLShared1, staticId: undefined })
      expect(sharedCreditLineDataAgent.update).toBeCalledWith(mockCLShared2)
      expect(sharedCreditLineDataAgent.delete).toBeCalledWith(mockCLShared3.staticId)
    })
  })

  describe('.delete', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('delete and shared credit lines', async () => {
      const mockCLShared1 = {
        ...buildFakeSharedCreditLine(),
        staticId: '',
        creditLineStaticId: 'credit-line-static-id-1'
      }
      const mockCLShared2 = {
        ...buildFakeSharedCreditLine(),
        staticId: 'static-id-2',
        creditLineStaticId: 'credit-line-static-id-1'
      }

      sharedCreditLineDataAgent.find = jest.fn().mockReturnValue([mockCLShared1, mockCLShared2])

      await creditLineService.delete('credit-line-static-id-1')

      expect(creditLinedataAgent.delete).toBeCalledWith('credit-line-static-id-1')

      expect(sharedCreditLineDataAgent.find).toBeCalledWith({ creditLineStaticId: 'credit-line-static-id-1' })
      expect(sharedCreditLineDataAgent.delete).toBeCalledWith(mockCLShared1.staticId)
      expect(sharedCreditLineDataAgent.delete).toBeCalledWith(mockCLShared2.staticId)
    })
  })

  describe('.getByProduct', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('get credit line', async () => {
      const { staticId, ...data } = buildFakeCreditLine()
      creditLinedataAgent.findOne = jest.fn().mockReturnValue({ staticId, ...data })
      const sharedCreditLine = buildFakeSharedCreditLine()
      const creditLine = { ...data, sharedCreditLines: [sharedCreditLine] }
      sharedCreditLineDataAgent.find = jest.fn().mockReturnValue([sharedCreditLine])
      expect(await creditLineService.getByProduct('productId', 'subProductId', 'counterpartyId')).toMatchObject(
        creditLine
      )
      expect(creditLinedataAgent.findOne).toBeCalledWith({
        context: {
          productId: 'productId',
          subProductId: 'subProductId'
        },
        counterpartyStaticId: 'counterpartyId'
      })
      expect(sharedCreditLineDataAgent.find).toBeCalledWith({ creditLineStaticId: staticId })
    })
  })
  describe('.get', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('get credit line by static', async () => {
      const creditLine = {
        ...buildFakeCreditLine(),
        staticId: '123'
      }
      creditLinedataAgent.get = jest.fn().mockReturnValue(creditLine)

      const sharedCreditLine = buildFakeSharedCreditLine()
      sharedCreditLineDataAgent.find = jest.fn().mockReturnValue([sharedCreditLine])

      const result = await creditLineService.get('123')

      expect(sharedCreditLineDataAgent.find).toBeCalledWith({ creditLineStaticId: '123' })
      expect(creditLinedataAgent.get).toBeCalledWith('123')
      expect(result).toMatchObject({ ...creditLine, sharedCreditLines: [sharedCreditLine] })
    })
  })
  describe('.find', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('find credit line', async () => {
      const creditLine = {
        ...buildFakeCreditLine(),
        staticId: '123'
      }
      creditLinedataAgent.find = jest.fn().mockReturnValue([creditLine])

      const result = await creditLineService.find({ staticId: '123' })
      expect(result).toMatchObject([creditLine])
    })
  })
})
