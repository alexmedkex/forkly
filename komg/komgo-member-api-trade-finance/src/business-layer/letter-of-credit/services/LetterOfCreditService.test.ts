import 'reflect-metadata'
import { LetterOfCreditService } from './LetterOfCreditService'
import createMockInstance from 'jest-create-mock-instance'
import { LetterOfCreditDataAgent } from '../../../data-layer/data-agents'
import { CounterService } from '../../counter'
import { LetterOfCreditTransactionManager } from '../tx-managers'
import { DocumentService } from '../../documents/DocumentService'
import { DocumentRequestBuilder } from '../../documents/DocumentRequestBuilder'
import { DocumentServiceClient } from '../../documents/DocumentServiceClient'
import CompanyRegistryService from '../../../service-layer/CompanyRegistryService'
import { TradeCargoClient } from '../../trade-cargo/TradeCargoClient'
import {
  buildFakeLetterOfCreditBase,
  ILetterOfCredit,
  IDataLetterOfCredit,
  IDataLetterOfCreditBase,
  ILetterOfCreditBase,
  buildFakeLetterOfCredit,
  LetterOfCreditStatus,
  IUser
} from '@komgo/types'
import { IFile } from '../../types/IFile'
import { DOCUMENT_CATEGORY, DOCUMENT_TYPE } from '../../documents/documentTypes'
import { DocumentServiceClientMock } from '../../../../integration-tests/mocks/DocumentServiceClientMock'
import { LetterOfCreditTimerService } from '../../timers/LetterOfCreditTimerService'

jest.mock('uuid', () => {
  return {
    v4: () => {
      return 1
    }
  }
})

const dataAgentMock = createMockInstance(LetterOfCreditDataAgent)
const counterServiceMock = createMockInstance(CounterService)
const txManagerMock = createMockInstance(LetterOfCreditTransactionManager)
const documentServiceMock = createMockInstance(DocumentService)
const documentRequestBuilderMock = createMockInstance(DocumentRequestBuilder)
const documentServiceClientMock = createMockInstance(DocumentServiceClient)
const companyRegistryServiceMock = createMockInstance(CompanyRegistryService)
const tradeCargoClientMock = createMockInstance(TradeCargoClient)
const timerServiceMock = createMockInstance(LetterOfCreditTimerService)

const service = new LetterOfCreditService(
  dataAgentMock,
  counterServiceMock,
  txManagerMock,
  documentServiceMock,
  documentRequestBuilderMock,
  documentServiceClientMock,
  companyRegistryServiceMock,
  tradeCargoClientMock,
  timerServiceMock
)

describe('LetterOfCreditService', () => {
  let letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
  let lcWithTrade: ILetterOfCredit<IDataLetterOfCredit> = buildFakeLetterOfCredit({
    status: LetterOfCreditStatus.RequestRejected
  })

  dataAgentMock.find.mockImplementation(() => {
    return [lcWithTrade]
  })
  dataAgentMock.update.mockImplementation(() => {
    return {}
  })
  dataAgentMock.count.mockImplementation(() => 1)

  timerServiceMock.populateTimerData.mockImplementation(
    letterOfCredit => letterOfCredit.templateInstance.data.issueDueDate
  )

  companyRegistryServiceMock.getMembers.mockImplementation(() => {
    return [
      {
        staticId: lcWithTrade.templateInstance.data.beneficiary.staticId
      },
      {
        staticId: lcWithTrade.templateInstance.data.applicant.staticId
      },
      {
        staticId: lcWithTrade.templateInstance.data.issuingBank.staticId
      }
    ]
  })

  tradeCargoClientMock.getTradeAndCargoBySourceAndSourceId.mockImplementation(() => {
    return {
      trade: {},
      cargo: {}
    }
  })
  documentServiceMock.registerLetterOfCreditIssuingDocument.mockImplementation(() => {
    return {
      hash: '0x123',
      id: '123'
    }
  })
  dataAgentMock.get.mockImplementation(() => {
    return lcWithTrade
  })

  describe('create', () => {
    describe('lc with trade already exists', () => {
      const lcWithoutRejected = {
        ...letterOfCreditBase,
        status: LetterOfCreditStatus.Issued
      }
      dataAgentMock.find.mockImplementationOnce(() => {
        return [lcWithoutRejected]
      })

      it('should throw', async () => {
        await expect(service.create(lcWithoutRejected)).rejects.toThrow()
      })
    })

    it('should call save method on database with a letter of credit', async () => {
      const result = await service.create(letterOfCreditBase)
      const expected = {
        ...letterOfCreditBase,
        staticId: 1,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        templateInstance: result.templateInstance,
        reference: undefined,
        stateHistory: [],
        status: 'REQUESTED_VERIFICATION_PENDING'
      }
      expect(dataAgentMock.save).toHaveBeenCalledWith(expected)
    })
  })

  describe('issue', () => {
    const file = {
      originalname: 'name'
    }
    const user = {}

    describe('lc is not found', () => {
      beforeEach(() => {
        dataAgentMock.get.mockImplementationOnce(() => {
          return undefined
        })
      })

      it('should throw', async () => {
        await expect(service.issue('123', letterOfCreditBase, file as IFile, user as IUser)).rejects.toThrow()
      })
    })

    describe('transaction manager throws', () => {
      const context = {
        productId: '1'
      }
      const document = {
        id: '123'
      }

      beforeEach(() => {
        txManagerMock.issue.mockImplementationOnce(() => {
          throw new Error()
        })
        documentRequestBuilderMock.getLetterOfCreditDocumentContext.mockImplementationOnce(() => {
          return context
        })
        documentServiceClientMock.getDocumentById.mockImplementationOnce(() => {
          return document
        })
      })

      it('should call document client', async () => {
        try {
          await service.issue('123', letterOfCreditBase, file as IFile, user as IUser)
        } catch {}
        expect(documentServiceClientMock.deleteDocument).toHaveBeenCalledWith(context.productId, document.id)
      })

      it('should throw', async () => {
        await expect(service.issue('123', letterOfCreditBase, file as IFile, user as IUser)).rejects.toThrow()
      })
    })

    describe("can't find all members", () => {
      it('should throw', async () => {
        companyRegistryServiceMock.getMembers.mockImplementationOnce(() => {
          return []
        })
        await expect(service.issue('123', letterOfCreditBase, file as IFile, user as IUser)).rejects.toThrow()
      })
    })

    it('should call document service', async () => {
      await service.issue('123', letterOfCreditBase, file as IFile, user as IUser)
      expect(documentServiceMock.registerLetterOfCreditIssuingDocument).toHaveBeenCalledWith(
        lcWithTrade,
        {
          categoryId: DOCUMENT_CATEGORY.TradeFinanceDocuments,
          typeId: DOCUMENT_TYPE.LC,
          name: file.originalname
        },
        file,
        user
      )
    })

    it('should call transaction manager', async () => {
      await service.issue('123', letterOfCreditBase, file as IFile, user as IUser)
      expect(txManagerMock.issue).toHaveBeenCalledWith(lcWithTrade.contractAddress, lcWithTrade)
    })
  })

  describe('rejectRequest', () => {
    const staticId = '123'

    describe('no lc was found', () => {
      beforeEach(() => {
        dataAgentMock.get.mockImplementationOnce(() => {
          return undefined
        })
      })

      it('should throw', async () => {
        await expect(service.rejectRequest('123', letterOfCreditBase)).rejects.toThrow()
      })
    })

    describe('transaction manager throws', () => {
      beforeEach(() => {
        txManagerMock.requestReject.mockImplementationOnce(() => {
          throw new Error()
        })
      })

      it('should throw', async () => {
        await expect(service.rejectRequest(staticId, letterOfCreditBase)).rejects.toThrow()
      })
    })

    it('should call transaction manager', async () => {
      await service.rejectRequest('123', letterOfCreditBase)
      expect(txManagerMock.requestReject).toHaveBeenCalledWith(lcWithTrade.contractAddress)
    })

    it('should call data agent', async () => {
      const lc = await service.rejectRequest('123', letterOfCreditBase)
      expect(dataAgentMock.update).toHaveBeenCalledWith({ staticId }, lc)
    })
  })

  describe('get', () => {
    it('should return an lc', async () => {
      const lc = await service.get('123')

      expect(timerServiceMock.populateTimerData).toHaveBeenCalledWith(lcWithTrade)
      expect(lc).toEqual(lcWithTrade)
    })
  })

  describe('getAll', () => {
    it('should return an array of letter of credits', async () => {
      const lcs = await service.getAll('123')
      expect(timerServiceMock.populateTimerData).toHaveBeenCalledWith(lcWithTrade)
      expect(lcs).toEqual([lcWithTrade])
    })
  })

  describe('find', () => {
    it('should return an lc', async () => {
      const lc = await service.find({})
      expect(timerServiceMock.populateTimerData).toHaveBeenCalledWith(lcWithTrade)
      expect(lc).toEqual([lcWithTrade])
    })
  })

  describe('count', () => {
    it('should return a count', async () => {
      const count = await service.count({})
      expect(count).toEqual(1)
    })
  })
})
