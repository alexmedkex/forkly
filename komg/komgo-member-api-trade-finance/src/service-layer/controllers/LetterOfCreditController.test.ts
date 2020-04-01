import { LetterOfCreditController } from './LetterOfCreditController'
import { buildFakeLetterOfCreditBase, ILetterOfCreditBase, IDataLetterOfCreditBase } from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import Uploader from '../utils/Uploader'
import { LetterOfCreditService } from '../../business-layer/letter-of-credit/services/LetterOfCreditService'
import * as MockExpressRequest from 'mock-express-request'
import { stringify } from 'qs'
import { HttpException } from '@komgo/microservice-config'
import { getValidTemplate } from '../../../integration-tests/utils/getValidTemplate'

const MOCK_ENCODED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const serviceMock = createMockInstance(LetterOfCreditService)

const uploaderMock = createMockInstance(Uploader)
const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
letterOfCreditBase.templateInstance.template = getValidTemplate()

const mockFormData = {
  data: {
    ...letterOfCreditBase,
    templateInstance: {
      ...letterOfCreditBase.templateInstance,
      data: { ...letterOfCreditBase.templateInstance.data, issuingBankReference: 'myRef' }
    }
  }
}

describe('LetterOfCreditController', () => {
  let controller: LetterOfCreditController

  beforeEach(() => {
    controller = new LetterOfCreditController(serviceMock, uploaderMock)
  })

  it('Save LetterOfCredit', async () => {
    await controller.create(letterOfCreditBase)
    expect(serviceMock.create).toHaveBeenCalledTimes(1)
  })

  it('Get all LettersOfCredit - standby', async () => {
    await controller.getAll('standby')
    expect(serviceMock.getAll).toHaveBeenCalledWith('STANDBY')
  })

  it('Get all LettersOfCredit - documentary', async () => {
    await controller.getAll('docUmenTary')
    expect(serviceMock.getAll).toHaveBeenCalledWith('DOCUMENTARY')
  })

  it('Get all LettersOfCredit - bad type - should throw error', async () => {
    await expect(controller.getAll('whatever')).rejects.toBeDefined()
  })

  describe('issue LetterOfCredit', () => {
    it('calls issue', async () => {
      uploaderMock.resolveMultipartData.mockResolvedValue(mockFormData)
      await controller.issue('staticId', MOCK_ENCODED_JWT, undefined)
      expect(serviceMock.issue).toBeCalledTimes(1)
    })

    it('rejects with invalid issuing bank reference', async () => {
      const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()

      uploaderMock.resolveMultipartData.mockResolvedValue({
        data: {
          ...letterOfCreditBase,
          templateInstance: {
            ...letterOfCreditBase.templateInstance,
            data: { ...letterOfCreditBase.templateInstance.data, issuingBankReference: '' }
          }
        }
      })

      expect(controller.issue('staticId', MOCK_ENCODED_JWT, undefined)).rejects.toThrowError()
    })
    it('rejects with invalid amount', async () => {
      const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()

      uploaderMock.resolveMultipartData.mockResolvedValue({
        data: {
          ...letterOfCreditBase,
          templateInstance: {
            ...letterOfCreditBase.templateInstance,
            data: { ...letterOfCreditBase.templateInstance.data, amount: -3 }
          }
        }
      })

      expect(controller.issue('staticId', MOCK_ENCODED_JWT, undefined)).rejects.toThrowError()
    })

    it('avoids validating templateInstance if there is no templateInstance', () => {
      const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
      delete letterOfCreditBase.templateInstance
      uploaderMock.resolveMultipartData.mockResolvedValue({
        data: letterOfCreditBase
      })

      expect(controller.issue('staticId', MOCK_ENCODED_JWT, undefined)).rejects.toThrowError()
    })

    it('should fail to validate faulty template', async () => {
      const lcCopy = {
        ...letterOfCreditBase
      }
      lcCopy.templateInstance.template = {
        badData: 'badData'
      }
      uploaderMock.resolveMultipartData.mockResolvedValueOnce({
        data: lcCopy
      })
      await expect(controller.issue('staticId', MOCK_ENCODED_JWT, undefined)).rejects.toBeInstanceOf(HttpException)
    })
  })

  it('Reject request LetterOfCredit', async () => {
    await controller.rejectRequest('staticId', letterOfCreditBase)
    expect(serviceMock.rejectRequest).toBeCalledTimes(1)
  })

  describe('find', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('returns all', async () => {
      const letterOfCreditMock = buildFakeLetterOfCreditBase()
      serviceMock.find.mockImplementation(() => {
        return [letterOfCreditMock]
      })

      const req = new MockExpressRequest({
        method: 'GET',
        orginalUrl: '/letterofcredit'
      })

      const result = await controller.find(undefined, req)

      expect(result).toMatchObject({ items: [letterOfCreditMock] })
    })

    it('returns the matching results', async () => {
      const letterOfCreditMock = buildFakeLetterOfCreditBase()
      const letters = [letterOfCreditMock]
      serviceMock.count.mockImplementation(() => {
        return letters.length
      })
      serviceMock.find.mockImplementation(() => {
        return letters
      })

      controller = new LetterOfCreditController(serviceMock, uploaderMock)

      const filter = {
        query: { 'templateInstance.data.trade.sourceId': 'issuingBankId' },
        projection: {},
        options: { sort: { createdAt: -1 } }
      }
      const query = stringify({ filter })

      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/letterofcredit?${query}`
      })

      const result = await controller.find(query, req)

      expect(result).toMatchObject({ items: [letterOfCreditMock] })

      expect(serviceMock.find).toHaveBeenCalledWith(filter.query, undefined, { ...filter.options, skip: 0, limit: 200 })
    })

    it('should allow in param inside query string for tradeId.sourceId', async () => {
      const letterOfCreditMock = buildFakeLetterOfCreditBase()
      serviceMock.find.mockImplementation(() => {
        return [letterOfCreditMock]
      })
      const filter = {
        query: { 'templateInstance.data.trade.sourceId': { $in: ['1a', '2b', '3c'] } },
        projection: {},
        options: { sort: { createdAt: -1 } }
      }
      const query = stringify({ filter })

      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/letterofcredit?${query}`
      })

      const result = await controller.find(query, req)

      expect(result).toMatchObject({ items: [letterOfCreditMock] })
      expect(serviceMock.find).toBeCalledWith(filter.query, undefined, {
        ...filter.options,
        skip: 0,
        limit: 200
      })
    })

    it.skip('should throw invalid query string exception', async () => {
      const letterOfCreditMock = buildFakeLetterOfCreditBase()
      serviceMock.find.mockImplementation(() => {
        return [letterOfCreditMock]
      })
      const filter = {
        query: { 'templateInstance.data.trade.sourceId': { $where: { a: '1' } } },
        projection: {},
        options: { sort: { createdAt: -1 } }
      }
      const query = stringify({ filter })

      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/letterofcredit?${query}`
      })

      await expect(controller.find(query, req)).rejects.toMatchObject({
        message: 'Field [templateInstance.data.trade] has unallowed operator [$where]'
      })
    })
  })
})
