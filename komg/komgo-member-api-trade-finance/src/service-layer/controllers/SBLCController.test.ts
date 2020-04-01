import 'reflect-metadata'

import * as Exceptions from '@komgo/error-utilities'

import { buildFakeStandByLetterOfCredit, buildFakeStandByLetterOfCreditBase, ISBLCRejectRequest } from '@komgo/types'
import { SBLCController } from './SBLCController'
import getUser from '../../business-layer/util/getUser'
import decode from '../../middleware/utils/decode'
import { ISBLCService } from '../../business-layer/sblc/ISBLCService'
import createMockInstance from 'jest-create-mock-instance'
import Uploader from '../utils/Uploader'

const uploaderMock = createMockInstance(Uploader)
import * as MockExpressRequest from 'mock-express-request'
import { stringify } from 'qs'
import { ITradeInstrumentValidationService } from '../../business-layer/trade-cargo/ITradeInstrumentValidationService'
import { IDocumentRegisterResponse } from '../../business-layer/documents/IDocumentRegisterResponse'
import { documentResponse } from '../../business-layer/test-entities'

const sblcService: jest.Mocked<ISBLCService> = {
  create: jest.fn(),
  get: jest.fn(),
  issue: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  rejectRequest: jest.fn(),
  getDocuments: jest.fn(),
  getDocumentById: jest.fn(),
  getDocumentContent: jest.fn()
}

const tradeInstrumentValidateService: jest.Mocked<ITradeInstrumentValidationService> = {
  validateById: jest.fn(),
  validateBySourceId: jest.fn()
}

let controller: SBLCController
const JWT_MOCK: string =
  'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJCZTB6VktGN1BGTGtKTGVHaGNOVzU0ckhUckRBZThkVERqYUJTMjFkMFZjIn0.eyJqdGkiOiJhNTUyM2RhZS0yMDEwLTQyZWEtOTM0Yy1iOGY1Yzg4NjhjZGYiLCJleHAiOjE1NDMzMjcxMjUsIm5iZiI6MCwiaWF0IjoxNTQzMzI2ODI1LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwNzAvYXV0aC9yZWFsbXMvS09NR08iLCJhdWQiOiJ3ZWItYXBwIiwic3ViIjoiN2EyZmQwMzYtNTBlOC00NzA2LTllOWQtMzgyNWVlNjY1YmQ5IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsIm5vbmNlIjoiZTNiNDY5MWQtYTUxMi00YjZhLTg3MDktYzcwZjI4MmUwOGQ5IiwiYXV0aF90aW1lIjoxNTQzMzI2ODI1LCJzZXNzaW9uX3N0YXRlIjoiNzE5NjQxNjUtMjNjZi00MWI4LWE5ZTAtOTdiODY5NjIwZjMxIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMTAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidHJhZGVGaW5hbmNlT2ZmaWNlciIsIm1pZGRsZUFuZEJhY2tPZmZpY2VyIiwidXNlckFkbWluIiwidW1hX2F1dGhvcml6YXRpb24iLCJyZWxhdGlvbnNoaXBNYW5hZ2VyIiwia3ljQW5hbHlzdCIsImNvbXBsaWFuY2VPZmZpY2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJtYW5hZ2UtdXNlcnMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlN1cGVyIFVzZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzdXBlcnVzZXIiLCJnaXZlbl9uYW1lIjoiU3VwZXIiLCJmYW1pbHlfbmFtZSI6IlVzZXIiLCJlbWFpbCI6InN1cGVyQGtvbWdvLmlvIn0.HysQLhMcdockuZ0MuAmqW0L6VpuLy0bdvlHlVEHfsIADDaXKbRVkxe1kx0ezCMwLc6Uvp-ohy-2EyXXNUKhk_uoqqkKnhYLMIRD2cK9yIYvWi_Q1f5uazfBMnp53M8VQWxvzGPtJpAtYHmwKpLb5uK4XoiHpdEH1WnMYrWdM4dpzYcX-jygpnQX4oVgVUswybBwEUTn-OqY8wNNVX2GLbtKxTwi2OjCvPRVs-qZ5KJYpsYOq0Mpm1RrS-4A-CL942Eee5RYPFNvQNuZqcDGb2kNvnCNpC7Z954OgCrJ7m3MCjh2Ndw0K2Hp_D1IFk0O1LPdW-BS4kvgChQwjQEkG7A'
const TX_HASH_MOCK = '0x123'
const STATIC_ID_MOCK = 'bd42a696-7dbb-4b53-b66a-237b2f03018f'
const formDataMock = {
  file: undefined,
  data: {
    issuingBankReference: 'reference',
    issuingBankPostalAddress: 'address'
  }
}

describe('SBLCController', () => {
  beforeEach(() => {
    controller = new SBLCController(sblcService, uploaderMock, tradeInstrumentValidateService)
  })

  describe('create', () => {
    let sblc
    beforeEach(() => {
      jest.resetAllMocks()
      sblc = buildFakeStandByLetterOfCreditBase()
      tradeInstrumentValidateService.validateBySourceId.mockImplementation(() => {
        return Promise.resolve(true)
      })
    })

    it('should create an SBLC correctly', async () => {
      sblcService.create.mockImplementation(() => [TX_HASH_MOCK, STATIC_ID_MOCK])

      const { transactionHash, id } = await controller.create(sblc, JWT_MOCK)

      expect(sblcService.create).toHaveBeenCalledWith(sblc, getUser(decode(JWT_MOCK)))
      expect(transactionHash).toEqual(TX_HASH_MOCK)
      expect(id).toEqual(STATIC_ID_MOCK)
    })

    it('should fail due to invalid data', async () => {
      const badSblc = {
        ...buildFakeStandByLetterOfCreditBase(),
        tradeId: 'fake value'
      } as any

      try {
        await controller.create(badSblc, JWT_MOCK)
      } catch (error) {
        expect(sblcService.create).not.toHaveBeenCalled()
      }
    })

    it('should failed due to a failed transaction', async () => {
      const error = new Error('Failed')
      sblcService.create.mockImplementation(() => Promise.reject(error))

      await expect(controller.create(sblc, JWT_MOCK)).rejects.toBeDefined()
      expect(sblcService.create).toHaveBeenCalledWith(sblc, getUser(decode(JWT_MOCK)))
    })

    it('should failed due to a existing financial instrument', async () => {
      tradeInstrumentValidateService.validateBySourceId.mockImplementation(() => {
        return Promise.resolve(false)
      })
      await expect(controller.create(sblc, JWT_MOCK)).rejects.toHaveProperty('status', 409)
      expect(sblcService.create).not.toHaveBeenCalled()
    })
  })

  describe('issue', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      uploaderMock.resolveMultipartData.mockImplementationOnce(() => formDataMock)
    })

    it('should issue sblc', async () => {
      await controller.issueSBLC(STATIC_ID_MOCK, JWT_MOCK, undefined)
      expect(sblcService.issue).toHaveBeenCalledWith(
        STATIC_ID_MOCK,
        formDataMock.data.issuingBankReference,
        formDataMock.data.issuingBankPostalAddress,
        getUser(decode(JWT_MOCK)),
        formDataMock.file
      )
    })

    it('should fail if issue is failed', async () => {
      const errorMessage = 'Boom!!'
      sblcService.issue.mockImplementation(() => Promise.reject(new Error(errorMessage)))
      await expect(controller.issueSBLC(STATIC_ID_MOCK, JWT_MOCK, undefined)).rejects.toBeDefined()
    })
  })

  describe('reject request', () => {
    const requestMock: ISBLCRejectRequest = { issuingBankReference: 'reference' }
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('should reject request sblc', async () => {
      await controller.rejectIssueSBLC(STATIC_ID_MOCK, requestMock)
      expect(sblcService.rejectRequest).toHaveBeenCalledWith(STATIC_ID_MOCK, requestMock.issuingBankReference)
    })

    it('should fail if reject request is failed', async () => {
      const errorMessage = 'Boom!!'
      sblcService.rejectRequest.mockImplementation(() => Promise.reject(new Error(errorMessage)))
      await expect(controller.rejectIssueSBLC(STATIC_ID_MOCK, requestMock)).rejects.toBeDefined()
    })
  })

  describe('get', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('success', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      const sblcMock = buildFakeStandByLetterOfCredit()
      sblcService.get.mockImplementation(() => Promise.resolve(sblcMock))

      const sblc = await controller.get(staticId)

      expect(sblcService.get).toHaveBeenCalledWith(staticId)
      expect(sblc).toEqual(sblcMock)
    })

    it('returns 404', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      sblcService.get.mockImplementation(() => Promise.resolve(null))

      await expect(
        controller.get(staticId)
        // WARNING toThrow doesn't work du to Exceptions implementation
      ).rejects.toBeDefined()
      expect(sblcService.get).toHaveBeenCalledWith(staticId)
    })

    it('returns 500', async () => {
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      sblcService.get.mockImplementation(() => Promise.reject(new Error('Not found')))

      await expect(
        controller.get(staticId)
        // WARNING toThrow doesn't work du to Exceptions implementation
      ).rejects.toBeDefined()
      expect(sblcService.get).toHaveBeenCalledWith(staticId)
    })
  })

  describe('find', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('returns all', async () => {
      const sblcMock = buildFakeStandByLetterOfCredit()
      sblcService.find.mockImplementation(() => {
        return [sblcMock]
      })
      // const url = request.protocol + '://' + request.get('host') + request.originalUrl;
      const req = new MockExpressRequest({
        method: 'GET',
        orginalUrl: '/lc'
      })

      const result = await controller.find(undefined, req)

      expect(result).toMatchObject({ items: [sblcMock] })
    })

    it('returns the matching results', async () => {
      const sblcMock = buildFakeStandByLetterOfCredit()
      sblcService.find.mockImplementation(() => {
        return [sblcMock]
      })
      const filter = {
        query: { issuingBankId: 'issuingBankId' },
        projection: { status: 1, _id: 1, issuingBankId: 1 },
        options: { sort: { createdAt: -1 } }
      }
      const query = stringify({ filter })

      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/lc?${query}`
      })

      const result = await controller.find(query, req)

      expect(result).toMatchObject({ items: [sblcMock] })
      expect(sblcService.find).toBeCalledWith(filter.query, filter.projection, {
        ...filter.options,
        skip: 0,
        limit: 200
      })
    })
    it('should allow in param inside query string for tradeId.sourceId', async () => {
      const sblcMock = buildFakeStandByLetterOfCredit()
      sblcService.find.mockImplementation(() => {
        return [sblcMock]
      })
      const filter = {
        query: { 'tradeId.sourceId': { $in: ['1a', '2b', '3c'] } },
        projection: { status: 1, _id: 1, issuingBankId: 1 },
        options: { sort: { createdAt: -1 } }
      }
      const query = stringify({ filter })

      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/sblc?${query}`
      })

      const result = await controller.find(query, req)

      expect(result).toMatchObject({ items: [sblcMock] })
      expect(sblcService.find).toBeCalledWith(filter.query, filter.projection, {
        ...filter.options,
        skip: 0,
        limit: 200
      })
    })
    it('should throw invalid query string exception', async () => {
      const sblcMock = buildFakeStandByLetterOfCredit()
      sblcService.find.mockImplementation(() => {
        return [sblcMock]
      })
      const filter = {
        query: { 'tradeId.sourceId': { $where: { a: '1' } } },
        projection: { status: 1, _id: 1, issuingBankId: 1 },
        options: { sort: { createdAt: -1 } }
      }
      const query = stringify({ filter })

      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/sblc?${query}`
      })

      await expect(controller.find(query, req)).rejects.toMatchObject({
        message: 'Field [tradeId.sourceId] has unallowed operator [$where]'
      })
    })
  })
  describe('documents', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('returns documents', async () => {
      const sblcMock = buildFakeStandByLetterOfCredit()
      sblcService.get.mockImplementation(() => sblcMock)
      const document: IDocumentRegisterResponse = {
        ...documentResponse(),
        id: 'document-1',
        name: 'test-document'
      }
      sblcService.getDocuments.mockImplementation(() => [document])
      const result = await controller.getDocuments(sblcMock.staticId)
      expect(sblcService.get).toBeCalledWith(sblcMock.staticId)
      expect(sblcService.getDocuments).toBeCalledWith(sblcMock)
      expect(result).toEqual([document])
    })

    it('should fail not existing sblc', async () => {
      sblcService.get.mockImplementation(() => null)
      await expect(controller.getDocuments('fail-static-id')).rejects.toHaveProperty('status', 404)
    })

    it('should fail on service error', async () => {
      const sblcMock = buildFakeStandByLetterOfCredit()
      sblcService.get.mockImplementation(() => sblcMock)

      sblcService.getDocuments.mockImplementation(() => {
        return Promise.reject(new Error('document fetch error'))
      })
      await expect(controller.getDocuments('fail-static-id')).rejects.toHaveProperty('status', 500)
    })
  })
})
