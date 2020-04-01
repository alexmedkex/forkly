import 'reflect-metadata'

import { NotificationManager } from '@komgo/notification-publisher'
import createMockInstance from 'jest-create-mock-instance'

import { ILCCacheDataAgent } from '../../data-layer/data-agents'
import { IDocumentRequestBuilder } from '../documents/DocumentRequestBuilder'
import { IDocumentServiceClient } from '../documents/DocumentServiceClient'
import { IDocumentEventData } from '../documents/IDocumentEventData'
import { documentResponse } from '../test-entities'
import { ITradeCargoClient } from '../trade-cargo/ITradeCargoClient'
import { DiscardTradeDocumentProcessor } from './DiscardTradeDocumentProcessor'

let mockDocumentClient: IDocumentServiceClient
let mockDocumentRequestBuilder: IDocumentRequestBuilder
let notificationClientMock: NotificationManager
let mockTradeCargoClient: ITradeCargoClient
let mockLCdataAgent: ILCCacheDataAgent

let processor: DiscardTradeDocumentProcessor
const PARCEL_ID = 'F0401A'
const VAKT_ID = 'V1233'
const LC_ID = 'LCID-1122'

const discardDocMessage: IDocumentEventData = {
  messageType: 'KOMGO.DiscardDocument',
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
    mockDocumentClient = {
      registerDocument: jest.fn(),
      shareDocument: jest.fn(),
      getDocument: jest.fn(() => documentResponse()),
      getDocuments: jest.fn(),
      deleteDocument: jest.fn(() => documentResponse()),
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
      getTradeDocumentRequest: jest.fn(),
      getLCDocumentContext: jest.fn(),
      getLCDocumentSearchContext: jest.fn(),
      getTradeDocumentContext: jest.fn(),
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
    processor = new DiscardTradeDocumentProcessor(
      'company-static-id-1',
      mockDocumentClient,
      mockDocumentRequestBuilder,
      mockTradeCargoClient,
      mockLCdataAgent,
      notificationClientMock
    )
  })

  it('discard document', async () => {
    const result: boolean = await processor.processEvent(discardDocMessage)
    expect(result).toEqual(true)
  })

  it('discard document with lcId', async () => {
    const messageWithLC = {
      ...discardDocMessage,
      lcId: LC_ID
    }
    const result: boolean = await processor.processEvent(messageWithLC)
    expect(result).toEqual(true)
  })
})
