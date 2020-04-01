import { ErrorCode } from '@komgo/error-utilities'
import { buildFakeReceivablesDiscountingInfo } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import { compressToEncodedURIComponent } from 'lz-string'
import 'reflect-metadata'

import { EntityNotFoundError, ValidationFieldError } from '../../business-layer/errors'
import { GetRDInfoUseCase, GetFilteredRDInfosUseCase } from '../../business-layer/rd/use-cases'
import { DataLayerError } from '../../data-layer/errors'

import { AggregatedInformationController } from './AggregatedInformationController'

describe('ReceivableFinanceAggregationController', () => {
  let controller: AggregatedInformationController
  let mockGetRDInfoUseCase: jest.Mocked<GetRDInfoUseCase>
  let mockGetFilteredRDUseCase: jest.Mocked<GetFilteredRDInfosUseCase>

  beforeEach(() => {
    mockGetRDInfoUseCase = createMockInstance(GetRDInfoUseCase)
    mockGetFilteredRDUseCase = createMockInstance(GetFilteredRDInfosUseCase)
    controller = new AggregatedInformationController(mockGetRDInfoUseCase, mockGetFilteredRDUseCase)
  })

  describe('get aggregated receivable discounting info', () => {
    it('should get specific RD with specified ID', async () => {
      const rdInfo = buildFakeReceivablesDiscountingInfo()
      mockGetRDInfoUseCase.execute.mockResolvedValueOnce(rdInfo)

      const rdId = rdInfo.rd.staticId
      const result = await controller.getRdInfo(rdId)

      expect(result).toEqual(rdInfo)
    })

    it('should fail with DatabaseMissingData and 404 status if GetRDInfoUseCase throws an EntityNotFoundError', async () => {
      const rdId = '123'
      mockGetRDInfoUseCase.execute.mockRejectedValueOnce(new EntityNotFoundError())

      try {
        await controller.getRdInfo(rdId)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(404)
        expect(error.errorObject.errorCode).toBe(ErrorCode.DatabaseMissingData)
      }
    })
  })

  describe('find', () => {
    const filter = compressToEncodedURIComponent(JSON.stringify({ tradeSourceIds: ['trade1', 'trade2'] }))

    it('should get RD infos filtered by tradeSourceId', async () => {
      const rdInfo1 = buildFakeReceivablesDiscountingInfo(true)
      const rdInfo2 = buildFakeReceivablesDiscountingInfo(true)
      const rdInfos = [rdInfo1, rdInfo2]

      mockGetFilteredRDUseCase.execute.mockResolvedValueOnce(rdInfos)

      const result = await controller.findRdInfo(filter)

      expect(result).toMatchObject({
        limit: 0,
        skip: 0,
        items: rdInfos,
        total: rdInfos.length
      })
    })

    it('should get RD infos filtered by tradeSourceId if not filter provided', async () => {
      const rdInfo1 = buildFakeReceivablesDiscountingInfo(true)
      const rdInfo2 = buildFakeReceivablesDiscountingInfo(true)
      const rdInfos = [rdInfo1, rdInfo2]

      mockGetFilteredRDUseCase.execute.mockResolvedValueOnce(rdInfos)

      const result = await controller.findRdInfo()

      expect(result).toMatchObject({
        limit: 0,
        skip: 0,
        items: rdInfos,
        total: rdInfos.length
      })
    })

    it('should fail with ValidationInvalidOperation and 422 status if GetFilteredRDInfosUseCase throws ValidationFieldError', async () => {
      mockGetFilteredRDUseCase.execute.mockRejectedValueOnce(new ValidationFieldError('msg', {}))

      try {
        await controller.findRdInfo(filter)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(422)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ValidationInvalidOperation)
      }
    })

    it('should fail with ValidationInvalidOperation and 500 status if GetFilteredRDInfosUseCase throws DataLayerError', async () => {
      mockGetFilteredRDUseCase.execute.mockRejectedValueOnce(new DataLayerError('msg', ErrorCode.ConnectionDatabase))

      try {
        await controller.findRdInfo(filter)
        fail('Expected failure')
      } catch (error) {
        expect(error.status).toBe(500)
        expect(error.errorObject.errorCode).toBe(ErrorCode.ConnectionDatabase)
      }
    })
  })
})
