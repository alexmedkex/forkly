import 'reflect-metadata'

import { ILCTransactionManager } from '../business-layer/blockchain/ILCTransactionManager'
import { IDocumentRequestBuilder } from '../business-layer/documents/DocumentRequestBuilder'
import { IDocumentServiceClient } from '../business-layer/documents/DocumentServiceClient'
import { IRegisterDocument } from '../business-layer/documents/IRegisterDocument'
import { trade } from '../business-layer/messaging/mock-data/mock-lc'
import { ILCCacheDataAgent } from '../data-layer/data-agents'
import { ICreateLCRequest } from '../service-layer/requests/ILetterOfCredit'
import { ILCUseCase } from './ILCUseCase'
import IUser from './IUser'
import { LCUseCase } from './LCUseCase'
import { documentResponse, MERKLE_HASH } from './test-entities'
import { ITradeCargoClient } from './trade-cargo/ITradeCargoClient'
import { ICounterService } from './counter'
import {
  LC_DOC_TYPE,
  LC_APPLICATION_DOC_TYPE,
  DOCUMENT_PRODUCT,
  DOCUMENT_TYPE,
  DOCUMENT_SUB_PRODUCT
} from '../business-layer/documents/documentTypes'
import { IFile } from './types/IFile'
import { LC_STATE } from './events/LC/LCStates'
import { ReferenceType } from '@komgo/types'

const generatedPDFMock = 'pdfthatwasgenerated'
const createLCRequest: ICreateLCRequest = {
  applicantId: 'string',
  beneficiaryId: 'string',
  issuingBankId: 'string',
  direct: true,
  feesPayableBy: 'APPLICANT',
  type: 'IRREVOCABLE',
  applicableRules: 'string',
  tradeId: '5ba919c1c91cec52e7a1eaa6',
  currency: 'EUR',
  amount: 1,
  expiryDate: '2020-12-31',
  expiryPlace: 'ISSUING_BANK',
  availableWith: 'ISSUING_BANK',
  availableBy: 'DEFERRED_PAYMENT',
  documentPresentationDeadlineDays: 21,
  cargoIds: ['string'],
  reference: 'lcreference',
  generatedPDF: generatedPDFMock,
  freeTextLc: undefined,
  billOfLadingEndorsement: 'bill of lading endorsment'
}

const user: IUser = {
  id: '1',
  firstName: 'Super',
  lastName: 'User',
  email: 'super@komgo.io'
}

const lcFile: IFile = {
  originalname: 'test file name',
  buffer: Buffer.from(generatedPDFMock, 'base64'),
  mimetype: 'application/pdf',
  ext: 'pdf'
}

const registerDocumentRequest: IRegisterDocument = {
  productId: 'productId',
  categoryId: 'categoryId',
  typeId: 'typeId',

  owner: { firstName: '', lastName: '', companyId: '' },
  metadata: [],
  name: 'name',
  context: {},
  documentData: lcFile
}

export interface IKeyValueRequest {
  name: string
  value: string
}

const reference = 'LC-MER-19-1'

const referenceObject = {
  year: '19',
  trigram: 'MER',
  value: '1'
}

const txHash = 'test txHash'
const deployLCMock = jest.fn(() => txHash)
const mockTxManager: ILCTransactionManager = {
  deployLC: deployLCMock,
  issueLC: jest.fn(),
  requestRejectLC: jest.fn(),
  issuedLCRejectByBeneficiary: jest.fn(),
  issuedLCRejectByAdvisingBank: jest.fn(),
  adviseLC: jest.fn(),
  acknowledgeLC: jest.fn()
}

const exampleCargo = { _id: 'example cargo ID' }
const tradeAndCargoSnapshot = {
  source: trade.source,
  sourceId: trade.sourceId,
  trade,
  cargo: exampleCargo
}

const getTradeMock = jest.fn(async () => trade)
const getCargoByTradeMock = jest.fn(() => exampleCargo)
const mockTradeCargoClient: ITradeCargoClient = {
  getTrade: getTradeMock,
  getCargoByTrade: getCargoByTradeMock,
  getTradeByVakt: jest.fn(),
  getTradeAndCargoBySourceAndSourceId: jest.fn()
}

const tradeContext = {
  productId: DOCUMENT_PRODUCT.TradeFinance,
  subProductId: DOCUMENT_SUB_PRODUCT.TRADE,
  lcId: trade.sourceId
}

const calculateNewReferenceObjectMock = jest.fn()

const mockCounterService: ICounterService = {
  calculateNewReferenceId: jest.fn(),
  calculateNewReferenceObject: calculateNewReferenceObjectMock
}

const lcCacheDataAgentMock: ILCCacheDataAgent = {
  saveLC: jest.fn(),
  updateField: jest.fn(),
  updateStatus: jest.fn(),
  getLC: jest.fn(),
  getLCs: jest.fn(),
  updateLcByReference: jest.fn(),
  getNonce: jest.fn(),
  count: jest.fn()
}

const getLCDocumentRequestMock = jest.fn(() => ({ productId: DOCUMENT_PRODUCT.TradeFinance, typeId: DOCUMENT_TYPE.LC }))
const getTradeDocumentContextMock = jest.fn()
const mockDocumentRequestBuilder: IDocumentRequestBuilder = {
  getLCDocumentRequest: getLCDocumentRequestMock,
  getLCDocumentToShareRequest: jest.fn(),
  getLCDocumentContext: jest.fn(),
  getTradeDocumentContext: getTradeDocumentContextMock,
  getTradeDocumentRequest: jest.fn(),
  getLCDocumentSearchContext: jest.fn(),
  getTradeDocumentSearchContext: jest.fn(),
  getPresentationDocumentSearchContext: jest.fn(),
  getLCPresentationDocumentRequest: jest.fn(),
  getLCAmendmentDocumentRequest: jest.fn(),
  getSBLCDocumentRequest: jest.fn(),
  getSBLCDocumentContext: jest.fn(),
  getSBLCDocumentToShareRequest: jest.fn(),
  getLetterOfCreditDocumentContext: jest.fn(),
  getLetterOfCreditDocumentRequest: jest.fn(),
  buildShareableDocumentRequest: jest.fn()
}

const registerDocumentMock = jest.fn()
const getDocumentMock = jest.fn(() => ({ hash: 'testhash' }))
const mockDocumentServiceClient: IDocumentServiceClient = {
  registerDocument: registerDocumentMock,
  shareDocument: jest.fn(),
  deleteDocument: jest.fn(),
  getDocumentTypes: jest.fn(),
  getDocument: getDocumentMock,
  getDocuments: jest.fn(),
  getDocumentById: jest.fn(),
  getDocumentContent: jest.fn(),
  sendDocumentFeedback: jest.fn(),
  getReceivedDocuments: jest.fn(),
  getSendDocumentFeedback: jest.fn()
}

const mockLCDocManager = {
  shareDocument: jest.fn(),
  deleteDocument: jest.fn()
}

describe('LCUseCase', () => {
  let lcUseCase: ILCUseCase

  beforeEach(() => {
    lcUseCase = new LCUseCase(
      mockTxManager,
      mockTradeCargoClient,
      mockCounterService,
      mockDocumentRequestBuilder,
      mockDocumentServiceClient,
      mockLCDocManager,
      lcCacheDataAgentMock
    )
    calculateNewReferenceObjectMock.mockReturnValueOnce(referenceObject)
    registerDocumentMock.mockResolvedValue(documentResponse())
  })

  it('should calculate a new reference ID using the cache', async () => {
    await lcUseCase.createLC(createLCRequest, user)

    expect(calculateNewReferenceObjectMock).toHaveBeenCalledWith(ReferenceType.LC, createLCRequest.applicantId)
  })

  it('should reject if LCCacheDataAgent.calculateNewReferenceId rejects', async () => {
    const rejection = 'Failed'
    calculateNewReferenceObjectMock.mockReset()
    calculateNewReferenceObjectMock.mockRejectedValueOnce(rejection)

    const call = lcUseCase.createLC(createLCRequest, user)

    await expect(call).rejects.toMatch(rejection)
  })

  it('should get the trade using the trade ID', async () => {
    await lcUseCase.createLC(createLCRequest, user)

    expect(getTradeMock).toHaveBeenCalledWith(createLCRequest.tradeId)
  })

  it('should reject if TradeCargoClient.getTrade rejects', async () => {
    const rejection = 'Failed'
    getTradeMock.mockRejectedValueOnce(rejection)

    const call = lcUseCase.createLC(createLCRequest, user)

    await expect(call).rejects.toMatch(rejection)
  })

  it('should get the cargo using trade ID', async () => {
    await lcUseCase.createLC(createLCRequest, user)

    expect(getCargoByTradeMock).toHaveBeenCalledWith(createLCRequest.tradeId)
  })

  it('should reject if TradeCargoClient.getTrade rejects', async () => {
    const rejection = 'Failed'
    getCargoByTradeMock.mockRejectedValueOnce(rejection)

    const call = lcUseCase.createLC(createLCRequest, user)

    await expect(call).rejects.toMatch(rejection)
  })

  it('should pass original request, trade and reference to DocumentRequestBuilder.getLCDocumentRequest to build the document registration request if there is a generatedPDF', async () => {
    const lcFileMock = { ...lcFile, originalname: reference + '.pdf' }
    const lcRequest = { ...createLCRequest, reference }
    calculateNewReferenceObjectMock.mockReturnValueOnce(referenceObject)

    await lcUseCase.createLC(createLCRequest, user)

    expect(getLCDocumentRequestMock).toHaveBeenCalledWith(
      lcRequest,
      {
        categoryId: LC_APPLICATION_DOC_TYPE.categoryId,
        typeId: LC_APPLICATION_DOC_TYPE.typeId,
        name: lcFileMock.originalname
      },
      lcFileMock,
      user
    )
  })

  it('should not call DocumentRequestBuilder.getLCDocumentRequest if there is no generatedPDF', async () => {
    const { generatedPDF, ...createLCRequestWithoutFile } = createLCRequest
    calculateNewReferenceObjectMock.mockReturnValueOnce(referenceObject)

    await lcUseCase.createLC(createLCRequestWithoutFile, user)

    expect(getLCDocumentRequestMock).not.toHaveBeenCalled()
  })

  it('should not call DocumentRequestBuilder.getLCDocumentRequest if no generatedPDF is present', async () => {
    const lcFileMock = { ...lcFile, originalname: reference }
    const lcRequest = { ...createLCRequest, reference }
    const { generatedPDF, ...createLCRequestWithoutPDF } = createLCRequest
    calculateNewReferenceObjectMock.mockReturnValueOnce(referenceObject)

    await lcUseCase.createLC(createLCRequestWithoutPDF, user)

    expect(getLCDocumentRequestMock).not.toHaveBeenCalledWith(
      lcRequest,
      lcFileMock.originalname,
      LC_DOC_TYPE,
      lcFileMock,
      user
    )
  })

  it('should throw if DocumentRequestBuilder.getLCDocumentRequest throws', async () => {
    const message = 'Failed'
    getLCDocumentRequestMock.mockImplementationOnce(() => {
      throw new Error(message)
    })

    const call = lcUseCase.createLC(createLCRequest, user)

    await expect(call).rejects.toThrow(new Error(message))
  })

  it('should register the document if a file is sent', async () => {
    getLCDocumentRequestMock.mockReturnValueOnce(registerDocumentRequest)

    await lcUseCase.createLC(createLCRequest, user)

    expect(registerDocumentMock).toHaveBeenCalledWith(registerDocumentRequest)
  })

  it('should not register the document if no file is sent', async () => {
    const { generatedPDF, ...createLCRequestWithoutFile } = createLCRequest
    getLCDocumentRequestMock.mockReturnValueOnce(registerDocumentRequest)

    await lcUseCase.createLC(createLCRequestWithoutFile, user)

    expect(registerDocumentMock).not.toHaveBeenCalledWith(registerDocumentRequest)
  })

  it('should reject if DocumentServiceClient.registerDocument rejects', async () => {
    const rejection = 'Failed'
    registerDocumentMock.mockRejectedValueOnce(rejection)

    const call = lcUseCase.createLC(createLCRequest, user)

    await expect(call).rejects.toMatch(rejection)
  })

  it('should pass original request, trade and reference to DocumentRequestBuilder.getTradeDocumentContext to build the commercial contract document request', async () => {
    const lcRequest = { ...createLCRequest, reference }
    calculateNewReferenceObjectMock.mockReturnValueOnce(referenceObject)

    await lcUseCase.createLC(lcRequest, user)

    expect(getTradeDocumentContextMock).toHaveBeenCalledWith(trade.sourceId)
  })

  it('should throw if DocumentRequestBuilder.getTradeDocumentContext throws', async () => {
    const message = 'Failed'
    getTradeDocumentContextMock.mockImplementationOnce(() => {
      throw new Error(message)
    })

    const call = lcUseCase.createLC(createLCRequest, user)

    await expect(call).rejects.toThrow(new Error(message))
  })

  it('should get the commercial contract document', async () => {
    getTradeDocumentContextMock.mockReturnValueOnce(tradeContext)

    await lcUseCase.createLC(createLCRequest, user)

    expect(getDocumentMock).toHaveBeenCalledWith(
      DOCUMENT_PRODUCT.TradeFinance,
      DOCUMENT_TYPE.COMMERCIAL_CONTRACT,
      tradeContext
    )
  })

  it('should use an empty string as the commercialContractDocumentHash if the call to getDocument returns null', async () => {
    getDocumentMock.mockReturnValueOnce(null)

    await lcUseCase.createLC(createLCRequest, user)

    expect(deployLCMock).toHaveBeenCalledWith(expect.objectContaining({ commercialContractDocumentHash: '' }))
  })

  it('should throw if DocumentServiceClient.getDocument throws', async () => {
    const message = 'Failed'
    getDocumentMock.mockImplementationOnce(() => {
      throw new Error(message)
    })

    const call = lcUseCase.createLC(createLCRequest, user)

    await expect(call).rejects.toThrow(new Error(message))
  })

  describe('deployment', () => {
    let commercialContractDocument
    let draftLCDocumentHash
    beforeEach(() => {
      commercialContractDocument = { hash: 'test commercial contract document hash' }
      calculateNewReferenceObjectMock.mockReturnValueOnce(referenceObject)
      getDocumentMock.mockResolvedValueOnce(commercialContractDocument)
      getCargoByTradeMock.mockResolvedValueOnce(exampleCargo)
    })

    it('should deploy LC with no draft document hash if no file is received', async () => {
      const { generatedPDF, ...deployedRequest } = createLCRequest
      draftLCDocumentHash = ''
      const letterOfCredit = {
        ...deployedRequest,
        draftLCDocumentHash,
        commercialContractDocumentHash: commercialContractDocument.hash,
        tradeAndCargoSnapshot,
        reference,
        referenceObject,
        status: LC_STATE.PENDING,
        nonce: 0
      }

      await lcUseCase.createLC(deployedRequest, user)

      expect(deployLCMock).toHaveBeenCalledWith(letterOfCredit)
    })

    it('should deploy LC with draft document hash if a file was received', async () => {
      const { generatedPDF, ...deployedRequest } = createLCRequest
      const letterOfCredit = {
        ...deployedRequest,
        draftLCDocumentHash: MERKLE_HASH,
        commercialContractDocumentHash: commercialContractDocument.hash,
        tradeAndCargoSnapshot,
        reference,
        referenceObject,
        status: LC_STATE.PENDING,
        nonce: 0
      }

      await lcUseCase.createLC(createLCRequest, user)

      expect(deployLCMock).toHaveBeenCalledWith(letterOfCredit)
      expect(deployLCMock.mock.calls[0][0]).not.toHaveProperty('generatedPDF')
    })
  })

  it('should reject if LCTransactionManager.deployLC rejects', async () => {
    const rejection = 'Failed'
    deployLCMock.mockRejectedValueOnce(rejection)
    calculateNewReferenceObjectMock.mockReturnValueOnce(referenceObject)

    const call = lcUseCase.createLC(createLCRequest, user)

    await expect(call).rejects.toMatch(rejection)
  })

  it('should resolve to the deploy return data and reference', async () => {
    calculateNewReferenceObjectMock.mockReturnValueOnce(referenceObject)

    const res = await lcUseCase.createLC(createLCRequest, user)

    expect(res).toEqual([txHash, 'LC-MER-19-1'])
  })

  it('should delete doc, update LC to draft and retrow error if deploy fails', async () => {
    const rejection = 'Failed'
    deployLCMock.mockRejectedValueOnce(rejection)

    const call = lcUseCase.createLC(createLCRequest, user)

    await expect(call).rejects.toMatch(rejection)
    expect(mockLCDocManager.deleteDocument).toHaveBeenCalled()
    expect(lcCacheDataAgentMock.updateField).toHaveBeenCalledWith(undefined, 'status', LC_STATE.FAILED)
    expect(mockLCDocManager.deleteDocument.mock.calls[0][1]).toBe(DOCUMENT_TYPE.LC_Application)
  })
})
