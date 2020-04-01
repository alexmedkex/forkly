import 'reflect-metadata'

import { DOCUMENT_PRODUCT } from './documentTypes'
import { CATEGORY_ID, TYPE_ID, documentResponse, DOCUMENT_NAME, user } from '../test-entities'
import { DocumentService } from './DocumentService'
import { IFile } from '../types/IFile'
import { LC_STATE } from '../events/LC/LCStates'
import { InvalidDocumentException } from '../../exceptions'
import { LCPresentationStatus } from '@komgo/types'
import { DocumentRequestBuilder, IDocumentRequestBuilder } from './DocumentRequestBuilder'

describe('DocumentService', () => {
  let documentService: DocumentService

  const documentRequest = {
    productId: DOCUMENT_PRODUCT.TradeFinance,
    categoryId: CATEGORY_ID,
    typeId: TYPE_ID,
    context: {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: 'lc',
      lcId: 'lc-id'
    },
    documentData: {},
    metadata: [
      {
        name: 'lcId',
        value: 'lc-id'
      }
    ],
    name: DOCUMENT_NAME,
    owner: {
      companyId: '----',
      firstName: 'Super',
      lastName: 'User'
    }
  }

  const lcFile = {}

  const lcDocument = {
    categoryId: CATEGORY_ID,
    typeId: TYPE_ID,
    name: DOCUMENT_NAME
  }

  const documentType = {
    productId: DOCUMENT_PRODUCT.TradeFinance,
    categoryId: CATEGORY_ID,
    typeId: TYPE_ID
  }

  const mockDocumentServiceClient = {
    deleteDocument: jest.fn(),
    registerDocument: jest.fn(() => {
      'mt7000hash'
    }),
    shareDocument: jest.fn(),
    getDocumentById: jest.fn(),
    getDocument: jest.fn(),
    getDocumentContent: jest.fn(),
    getDocumentTypes: jest.fn(),
    getDocuments: jest.fn(),
    sendDocumentFeedback: jest.fn(),
    getReceivedDocuments: jest.fn(),
    getSendDocumentFeedback: jest.fn()
  }

  const mockDocumentRequestBuilder = {
    getLCDocumentRequest: jest.fn(() => ({ name: 'test' })),
    getLCDocumentToShareRequest: jest.fn(),
    getTradeDocumentRequest: jest.fn(),
    getLCDocumentContext: jest.fn(),
    getLCDocumentSearchContext: jest.fn(),
    getTradeDocumentContext: jest.fn(),
    getTradeDocumentSearchContext: jest.fn(),
    getPresentationDocumentSearchContext: jest.fn(),
    getLCPresentationDocumentRequest: jest.fn(),
    getLCAmendmentDocumentRequest: jest.fn(),
    getSBLCDocumentContext: jest.fn(),
    getSBLCDocumentRequest: jest.fn(),
    getSBLCDocumentToShareRequest: jest.fn(),
    getLetterOfCreditDocumentContext: jest.fn(),
    getLetterOfCreditDocumentRequest: jest.fn(),
    buildShareableDocumentRequest: jest.fn()
  }

  let lc
  let presentation
  beforeEach(() => {
    lc = {
      _id: 1,
      contractAddress: '0x0',
      issuingBankId: 'company1',
      status: LC_STATE.REQUESTED,
      tradeAndCargoSnapshot: {
        cargo: {
          parcels: [
            {
              id: 'parcelId'
            }
          ]
        }
      }
    }
    presentation = {
      _id: 1,
      status: LCPresentationStatus.Draft,
      beneficiaryId: 'beneficiary1',
      applicantId: 'app1',
      issuingBankId: 'company1',
      LCReference: 'lcref1',
      reference: 'ref1'
    }
    documentService = new DocumentService(mockDocumentServiceClient, mockDocumentRequestBuilder)

    mockDocumentServiceClient.registerDocument.mockResolvedValue(documentResponse())
  })

  it('should register LC document', async () => {
    mockDocumentRequestBuilder.getLCDocumentRequest.mockReturnValue(documentRequest)

    const registeredDocument = await documentService.registerLcDocument(
      lc,
      {
        ...lcDocument,
        parcelId: 'parcelId'
      },
      lcFile as IFile,
      user()
    )

    expect(registeredDocument).toEqual(documentResponse())
    expect(mockDocumentServiceClient.registerDocument).toBeCalledWith(documentRequest)
    expect(mockDocumentRequestBuilder.getLCDocumentRequest).toBeCalledWith(
      lc,
      {
        ...lcDocument,
        parcelId: 'parcelId'
      },
      lcFile,
      user()
    )
  })

  it('should register LC presentation document', async () => {
    mockDocumentRequestBuilder.getLCPresentationDocumentRequest.mockReturnValue(documentRequest)

    const registeredDocument = await documentService.registerLcPresentationDocument(
      lc,
      presentation,
      {
        ...lcDocument,
        parcelId: 'parcelId'
      },
      lcFile as IFile,
      user(),
      null
    )

    expect(registeredDocument).toEqual(documentResponse())
    expect(mockDocumentServiceClient.registerDocument).toBeCalledWith(documentRequest)
    expect(mockDocumentRequestBuilder.getLCPresentationDocumentRequest).toBeCalledWith(
      presentation,
      {
        ...lcDocument,
        parcelId: 'parcelId'
      },
      lcFile,
      user(),
      null
    )
  })

  it('should validate parcel id if present', async () => {
    mockDocumentRequestBuilder.getLCDocumentRequest.mockReturnValue(documentRequest)

    const call = documentService.registerLcDocument(
      lc,
      {
        ...lcDocument,
        parcelId: 'invalid-parcel-id'
      },
      lcFile as IFile,
      user()
    )

    await expect(call).rejects.toBeInstanceOf(InvalidDocumentException)
  })

  it('should validate parcel id if present for LCPresentationDocument', async () => {
    mockDocumentRequestBuilder.getLCPresentationDocumentRequest.mockReturnValue(documentRequest)

    const call = documentService.registerLcPresentationDocument(
      lc,
      presentation,
      {
        ...lcDocument,
        parcelId: 'invalid-parcel-id'
      },
      lcFile as IFile,
      user()
    )

    await expect(call).rejects.toBeInstanceOf(InvalidDocumentException)
  })

  it('should not validate parcel id if it is not present', async () => {
    mockDocumentRequestBuilder.getLCDocumentRequest.mockReturnValue(documentRequest)

    await documentService.registerLcDocument(lc, lcDocument, lcFile as IFile, user())

    expect(mockDocumentRequestBuilder.getLCDocumentRequest).toBeCalledWith(lc, lcDocument, lcFile, user())
  })
  it('should not validate parcel id if it is not present - lc presentation', async () => {
    mockDocumentRequestBuilder.getLCPresentationDocumentRequest.mockReturnValue(documentRequest)

    await documentService.registerLcPresentationDocument(lc, presentation, lcDocument, lcFile as IFile, user(), null)

    expect(mockDocumentRequestBuilder.getLCPresentationDocumentRequest).toBeCalledWith(
      presentation,
      lcDocument,
      lcFile,
      user(),
      null
    )
  })
  it('should not validate parcel id if it is not present', async () => {
    mockDocumentRequestBuilder.getLCDocumentRequest.mockReturnValue(documentRequest)

    const call = documentService.registerLcDocument(
      {
        ...lc,
        tradeAndCargoSnapshot: undefined
      },
      {
        ...lcDocument,
        parcelId: 'parcelId'
      },
      lcFile as IFile,
      user()
    )

    await expect(call).rejects.toBeInstanceOf(InvalidDocumentException)
  })
  it('should validate parcel id if it is not present - parcel optional', async () => {
    mockDocumentRequestBuilder.getLCPresentationDocumentRequest.mockReturnValue(documentRequest)

    const call = documentService.registerLcPresentationDocument(
      {
        ...lc,
        tradeAndCargoSnapshot: undefined
      },
      presentation,
      {
        ...lcDocument
      },
      lcFile as IFile,
      user()
    )

    await expect(call).resolves.toBeDefined()
  })
})
