import 'reflect-metadata'

import {
  buildFakeStandByLetterOfCreditBase,
  buildFakeStandByLetterOfCredit,
  StandbyLetterOfCreditStatus
} from '@komgo/types'

import IUser from '../IUser'

import { ISBLCDataAgent } from '../../data-layer/data-agents'
import { ISBLCTransactionManager } from '../blockchain/SBLC/ISBLCTransactionManager'
import { SBLCService } from './SBLCService'
import { ISBLCService } from './ISBLCService'
import { DocumentService } from '../documents/DocumentService'
import { createMockInstance } from 'jest-create-mock-instance'
import { IFile } from '../types/IFile'
import { IDocumentRegisterResponse } from '../documents/IDocumentRegisterResponse'
import { ICounterService } from '../counter'
import { DocumentServiceClient } from '../documents/DocumentServiceClient'
import { DocumentRequestBuilder } from '../documents/DocumentRequestBuilder'
import { DOCUMENT_PRODUCT } from '../documents/documentTypes'
import { ITradeCargoClient } from '../trade-cargo/ITradeCargoClient'

const SBLC_STATIC_ID = 'aade86bf-0e49-43af-89dd-d14fb89500b3'
const SBLC_TX_HASH = '0x0001'

jest.mock('uuid', () => ({
  v4: () => SBLC_STATIC_ID
}))

const user: IUser = {
  id: '1',
  firstName: 'Super',
  lastName: 'User',
  email: 'super@komgo.io'
}

const sblcDataAgentMock: ISBLCDataAgent = {
  save: jest.fn(),
  update: jest.fn(),
  get: jest.fn().mockImplementation(() => {
    return buildFakeStandByLetterOfCredit()
  }),
  getByContractAddress: jest.fn().mockImplementation(() => {
    return buildFakeStandByLetterOfCredit()
  }),
  getNonce: jest.fn(),
  find: jest.fn(),
  count: jest.fn()
}

const documentServiceMock = createMockInstance(DocumentService)
const documentServiceClientMock = createMockInstance(DocumentServiceClient)
const documentRequestBuilderMock = createMockInstance(DocumentRequestBuilder)

const transactionManagerMock: ISBLCTransactionManager = {
  deploy: jest.fn().mockImplementation(() => Promise.resolve(SBLC_TX_HASH)),
  issue: jest.fn().mockImplementation(() => Promise.resolve(SBLC_TX_HASH)),
  requestReject: jest.fn().mockImplementation(() => Promise.resolve(SBLC_TX_HASH))
}

const mockUser: IUser = {
  email: 'email@mail.com',
  firstName: 'FirstName',
  id: '123123',
  lastName: 'LastName'
}

const fileMock: IFile = {
  buffer: undefined,
  ext: 'pdf',
  mimetype: 'pdf',
  originalname: 'DocumentName'
}

const documentContext = {
  productId: DOCUMENT_PRODUCT.TradeFinance,
  subProductId: 'SBLC',
  sblcStaticId: 'sblc_id'
}

const calculateNewReferenceObjectMock = jest.fn()

const counterServiceMock: ICounterService = {
  calculateNewReferenceId: jest.fn(),
  calculateNewReferenceObject: calculateNewReferenceObjectMock
}

const documentMock: IDocumentRegisterResponse = {
  hash: '0x0',
  name: 'DocumentName',
  category: undefined,
  content: undefined,
  context: undefined,
  id: '12345',
  metadata: undefined,
  owner: undefined,
  product: undefined,
  registrationDate: undefined,
  sharedBy: undefined,
  sharedWith: undefined,
  type: undefined
}

const tradeCargoClientMock: ITradeCargoClient = {
  getCargoByTrade: jest.fn(),
  getTrade: jest.fn(),
  getTradeAndCargoBySourceAndSourceId: jest.fn(),
  getTradeByVakt: jest.fn()
}

const tradeCargoMock = {
  trade: {},
  cargo: {}
}

describe('SBLCService test', () => {
  let sblcService: ISBLCService
  let sampleSBLC
  let sampleSBLCBase

  beforeEach(() => {
    jest.resetAllMocks()
    transactionManagerMock.deploy = jest.fn().mockImplementation(() => Promise.resolve(SBLC_TX_HASH))
    transactionManagerMock.issue = jest.fn().mockImplementation(() => Promise.resolve(SBLC_TX_HASH))
    transactionManagerMock.requestReject = jest.fn().mockImplementation(() => Promise.resolve(SBLC_TX_HASH))
    tradeCargoClientMock.getTradeAndCargoBySourceAndSourceId = jest.fn().mockImplementationOnce(() => tradeCargoMock)
    sampleSBLCBase = buildFakeStandByLetterOfCreditBase()
    sampleSBLC = buildFakeStandByLetterOfCredit()
    sblcDataAgentMock.get = jest.fn().mockImplementation(() => {
      return sampleSBLC
    })
    sblcDataAgentMock.getByContractAddress = jest.fn().mockImplementation(() => {
      return sampleSBLC
    })
    sblcService = new SBLCService(
      sblcDataAgentMock,
      transactionManagerMock,
      documentServiceMock,
      counterServiceMock,
      documentServiceClientMock,
      documentRequestBuilderMock,
      tradeCargoClientMock
    )
  })

  describe('create', () => {
    it('deploys the smart contract', async () => {
      sblcDataAgentMock.save = jest.fn().mockImplementationOnce(() => {
        return Promise.resolve(SBLC_STATIC_ID)
      })
      const [txHash, staticId] = await sblcService.create(sampleSBLCBase, user)
      expect(txHash).toEqual(SBLC_TX_HASH)
      expect(staticId).toEqual(SBLC_STATIC_ID)
    })

    it('fails to save the sblc', async () => {
      const error = new Error('failed')

      sblcDataAgentMock.save = jest.fn().mockImplementationOnce(() => {
        return Promise.reject(error)
      })
      await expect(sblcService.create(sampleSBLC, user)).rejects.toThrow(error)
    })

    it('fails to deploy the sblc contract, state of sblc is FAILED', async () => {
      const error = new Error('failed')
      sblcDataAgentMock.get = jest.fn().mockImplementationOnce(() => {
        return Promise.resolve(sampleSBLC)
      })
      transactionManagerMock.deploy = jest.fn().mockImplementationOnce(() => {
        throw error
      })
      const call = sblcService.create(sampleSBLC, user)
      await expect(call).rejects.toThrowError()
      const expectedArgument = { ...sampleSBLCBase, status: StandbyLetterOfCreditStatus.Failed }
      expect(sblcDataAgentMock.update).toHaveBeenCalledTimes(1)
    })
  })

  describe('get', () => {
    it('get sblc', async () => {
      sblcDataAgentMock.get = jest.fn().mockImplementationOnce(() => {
        return Promise.resolve(sampleSBLC)
      })
      const sblc = await sblcService.get(SBLC_STATIC_ID)
      expect(sblc).toEqual(sampleSBLC)
      expect(sblcDataAgentMock.get).toBeCalledWith(SBLC_STATIC_ID)
    })

    it('fails to get the sblc', async () => {
      const error = new Error('failed')
      sblcDataAgentMock.get = jest.fn().mockImplementationOnce(() => {
        return Promise.reject(error)
      })
      const call = sblcService.get(SBLC_STATIC_ID)
      await expect(call).rejects.toThrowError()
    })
  })

  describe('Issuing bank', () => {
    it('issue sblc', async () => {
      documentServiceMock.registerSBLCIssuingDocument.mockImplementationOnce(() => documentMock)
      await sblcService.issue(sampleSBLC.staticId, 'issue reference', 'address', mockUser, fileMock)
      expect(sblcDataAgentMock.get).toHaveBeenCalledTimes(1)
      expect(transactionManagerMock.issue).toHaveBeenCalledTimes(1)
    })

    it('reject request sblc', async () => {
      documentServiceMock.registerSBLCIssuingDocument.mockImplementationOnce(() => documentMock)
      await sblcService.rejectRequest(sampleSBLC.staticId, 'issue reference')
      expect(sblcDataAgentMock.get).toHaveBeenCalledTimes(1)
      expect(transactionManagerMock.requestReject).toHaveBeenCalledTimes(1)
    })

    it('issue sblc fails if sblc not found', async () => {
      // documentServiceMock.registerSBLCIssuingDocument.mockImplementationOnce(() => documentMock)
      sblcDataAgentMock.get = jest.fn().mockImplementationOnce(() => undefined)
      await expect(
        sblcService.issue(sampleSBLC.staticId, 'issue reference', 'address', mockUser, fileMock)
      ).rejects.toThrowError()
      expect(sblcDataAgentMock.get).toHaveBeenCalledTimes(1)
      expect(transactionManagerMock.issue).toHaveBeenCalledTimes(0)
    })

    it('issue sblc delete document if tx manager fails', async () => {
      documentServiceMock.registerSBLCIssuingDocument.mockImplementationOnce(() => documentMock)
      documentRequestBuilderMock.getSBLCDocumentContext.mockImplementationOnce(() => documentContext)
      documentServiceClientMock.getDocumentById.mockImplementationOnce(() => documentMock)
      transactionManagerMock.issue = jest.fn().mockImplementationOnce(() => {
        return Promise.reject(new Error('issue failed'))
      })

      await sblcService.issue(sampleSBLC.staticId, 'issue reference', 'address', mockUser, fileMock)
      expect(sblcDataAgentMock.get).toHaveBeenCalledTimes(1)
      expect(documentServiceClientMock.deleteDocument).toHaveBeenCalledTimes(1)
      expect(transactionManagerMock.issue).toHaveBeenCalledTimes(1)
    })

    it('reject request sblc fails if sblc not found', async () => {
      // documentServiceMock.registerSBLCIssuingDocument.mockImplementationOnce(() => documentMock)
      sblcDataAgentMock.get = jest.fn().mockImplementationOnce(() => undefined)
      await expect(sblcService.rejectRequest(sampleSBLC.staticId, 'issue reference')).rejects.toThrowError()
      expect(sblcDataAgentMock.get).toHaveBeenCalledTimes(1)
      expect(transactionManagerMock.requestReject).toHaveBeenCalledTimes(0)
    })
  })

  describe('find', () => {
    it('find  sblc', async () => {
      sampleSBLC = buildFakeStandByLetterOfCredit()
      sblcDataAgentMock.find = jest.fn().mockImplementationOnce(() => {
        return Promise.resolve([sampleSBLC])
      })
      expect(await sblcService.find({ issuingBank: 'test-issuing-bankk' }, null, null)).toEqual([sampleSBLC])
      expect(sblcDataAgentMock.find).toBeCalled()
    })

    it('failed to find sblc', async () => {
      sblcDataAgentMock.find = jest.fn().mockImplementationOnce(() => {
        return Promise.reject(new Error('find failed'))
      })
      await expect(sblcService.find({ issuingBank: 'test-issuing-bankk' }, null, null)).rejects.toThrowError()
    })
  })

  describe('count', () => {
    it('count  sblc', async () => {
      sblcDataAgentMock.count = jest.fn().mockImplementationOnce(() => {
        return Promise.resolve(10)
      })
      expect(await sblcService.count({ issuingBank: 'test-issuing-bankk' })).toEqual(10)
      expect(sblcDataAgentMock.count).toBeCalled()
    })

    it('failed count', async () => {
      sblcDataAgentMock.count = jest.fn().mockImplementationOnce(() => {
        return Promise.reject(new Error('count failed'))
      })
      await expect(sblcService.count({ issuingBank: 'test-issuing-bankk' })).rejects.toThrowError()
    })
  })

  describe('get documents', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })
    it('get  sblc documents', async () => {
      documentRequestBuilderMock.getSBLCDocumentContext.mockImplementationOnce(() => documentContext)
      await sblcService.getDocuments(sampleSBLC)
      expect(documentServiceClientMock.getDocuments).toBeCalledWith(DOCUMENT_PRODUCT.TradeFinance, documentContext)
    })
  })
})
