import 'reflect-metadata'

import createMockInstance from 'jest-create-mock-instance'

import { IDocumentServiceClient } from '../documents/DocumentServiceClient'
import { IDocumentRequestBuilder } from '../documents/DocumentRequestBuilder'
import { ITradeCargoClient } from '../trade-cargo/ITradeCargoClient'
import { ILCCacheDataAgent } from '../../data-layer/data-agents'
import { NotificationManager } from '@komgo/notification-publisher'
import { TradeDocumentProcessor } from './TradeDocumentProcessor'
import { IDocumentEventData } from '../documents/IDocumentEventData'
import ILCDocument from '../types/ILCDocument'

let mockDocumentService: IDocumentServiceClient
let mockDocumentRequestBuilder: IDocumentRequestBuilder
let notificationClientMock: NotificationManager
let mockTradeCargoClient: ITradeCargoClient
let mockLCdataAgent: ILCCacheDataAgent

let processor: TradeDocumentProcessor
const PARCEL_ID = 'F0401A'
const VAKT_ID = 'V1233'
const LC_ID = 'LCID-1122'

const message: IDocumentEventData = {
  messageType: 'KOMGO.TradeDocument',
  contents: 'MTIzNGQ=',
  documentType: 'COMMERCIAL_CONTRACT',
  vaktId: VAKT_ID,
  parcelId: PARCEL_ID,
  filename: 'yyy.txt',
  metadata: {}
}

const getTradeByVaktMock = jest.fn().mockResolvedValue({
  _id: 1,
  buyer: 'company-static-id-1',
  seller: 'company-2'
})

const getCargoByTradeMock = jest.fn().mockResolvedValue({
  parcels: [
    {
      id: PARCEL_ID
    }
  ]
})

describe('Trade Document Processor', () => {
  beforeEach(() => {
    mockDocumentService = {
      registerDocument: jest.fn().mockResolvedValueOnce('111222333'),
      shareDocument: jest.fn(),
      deleteDocument: jest.fn(),
      getDocument: jest.fn(),
      getDocuments: jest.fn(),
      getDocumentTypes: jest.fn(() => [
        {
          product: { id: 'TradeFinance' },
          category: { id: 'commercialDocuments' },
          typeId: 'COMMERCIAL_CONTRACT',
          vaktId: 'COMMERCIAL_CONTRACT'
        }
      ]),
      getDocumentById: jest.fn(),
      getDocumentContent: jest.fn(),
      sendDocumentFeedback: jest.fn(),
      getReceivedDocuments: jest.fn(),
      getSendDocumentFeedback: jest.fn()
    }

    mockDocumentRequestBuilder = {
      getLCDocumentRequest: jest.fn(),
      getLCDocumentToShareRequest: jest.fn(),
      getTradeDocumentRequest: jest.fn().mockResolvedValue({
        productId: 'TradeFinance',
        categoryId: 'commercialDocuments',
        typeId: 'COMMERCIAL_CONTRACT'
      }),
      getLCDocumentContext: jest.fn(),
      getLCDocumentSearchContext: jest.fn(),
      getTradeDocumentContext: jest.fn(),
      getTradeDocumentSearchContext: jest.fn(),
      getPresentationDocumentSearchContext: jest.fn(),
      getLCPresentationDocumentRequest: jest.fn(),
      getLCAmendmentDocumentRequest: jest.fn(),
      getSBLCDocumentRequest: jest.fn(),
      getSBLCDocumentToShareRequest: jest.fn(),
      getSBLCDocumentContext: jest.fn(),
      getLetterOfCreditDocumentContext: jest.fn(),
      getLetterOfCreditDocumentRequest: jest.fn(),
      buildShareableDocumentRequest: jest.fn()
    }
    mockTradeCargoClient = {
      getTrade: jest.fn(),
      getCargoByTrade: getCargoByTradeMock,
      getTradeByVakt: getTradeByVaktMock,
      getTradeAndCargoBySourceAndSourceId: jest.fn()
    }

    mockLCdataAgent = {
      saveLC: jest.fn(),
      updateField: jest.fn(),
      updateStatus: jest.fn(),
      getLC: jest.fn().mockImplementation(() => {
        return {
          tradeAndCargoSnapshot: {
            trade: {
              vaktId: VAKT_ID
            }
          }
        }
      }),
      getLCs: jest.fn(),
      updateLcByReference: jest.fn(),
      getNonce: jest.fn(),
      count: jest.fn()
    }

    notificationClientMock = createMockInstance(NotificationManager)
    processor = new TradeDocumentProcessor(
      'company-static-id-1',
      mockDocumentService,
      mockDocumentRequestBuilder,
      mockTradeCargoClient,
      mockLCdataAgent,
      notificationClientMock
    )
  })

  it('to be defined', async () => {
    expect(processor).toBeDefined()
  })

  it('sends document', async () => {
    await processor.processEvent(message)

    expect(mockDocumentRequestBuilder.getTradeDocumentRequest).toBeCalled()
    const paramVakt = getTradeByVaktMock.mock.calls[0][0]
    expect(paramVakt).toEqual(VAKT_ID)

    expect(mockTradeCargoClient.getCargoByTrade).toBeCalled()
    const paramTradeId = getCargoByTradeMock.mock.calls[0][0]
    expect(paramTradeId).toEqual(1)

    expect(mockDocumentService.registerDocument).toBeCalled()
    expect(notificationClientMock.createNotification).toBeCalled()
  })

  it('sends document with LC given', async () => {
    const messageWithLC = {
      ...message,
      lcId: LC_ID
    }
    await processor.processEvent(messageWithLC)

    expect(mockDocumentRequestBuilder.getLCDocumentRequest).toBeCalled()
    const paramVakt = getTradeByVaktMock.mock.calls[0][0]
    expect(paramVakt).toEqual(VAKT_ID)

    expect(mockTradeCargoClient.getCargoByTrade).toBeCalled()
    const paramTradeId = getCargoByTradeMock.mock.calls[0][0]
    expect(paramTradeId).toEqual(1)

    expect(mockDocumentService.registerDocument).toBeCalled()
    expect(notificationClientMock.createNotification).toBeCalled()
  })

  it('throw error on invalid trade', async () => {
    mockTradeCargoClient.getTradeByVakt = jest.fn().mockResolvedValueOnce(null)
    const error = new Error(`Trade ${VAKT_ID} not found, error processing commercial document`)
    await expect(processor.processEvent(message)).rejects.toThrow(error)
  })

  it('throw error non applicant / beneficiary', async () => {
    mockTradeCargoClient.getTradeByVakt = jest.fn().mockResolvedValueOnce({
      _id: 1,
      buyer: 'false-company-1',
      seller: 'false-company-2'
    })
    const error = new Error(`Company is not party (Applicant/Beneficiary) in trade ${VAKT_ID}.`)
    await expect(processor.processEvent(message)).rejects.toThrow(error)
  })

  it('throw error parcel ID not valid', async () => {
    mockTradeCargoClient.getTradeByVakt = jest.fn().mockResolvedValueOnce({
      _id: 1,
      buyer: 'company-static-id-1',
      seller: 'company-2'
    })
    mockTradeCargoClient.getCargoByTrade = jest.fn().mockResolvedValueOnce({})
    const error = new Error(`Parcel ${PARCEL_ID} not found, error processing commercial document vaktId: ${VAKT_ID}`)
    await expect(processor.processEvent(message)).rejects.toThrow(error)
  })

  it('throw error on invalid doc type', async () => {
    const msg = { ...message, documentType: 'UNKNOWN' }
    const error = new Error("Can't find document with vaktTypeId: [UNKNOWN]")
    await expect(processor.processEvent(msg)).rejects.toThrow(error)
  })
})
