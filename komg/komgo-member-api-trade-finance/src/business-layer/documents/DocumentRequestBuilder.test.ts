import 'reflect-metadata'

import { TradeSource } from '@komgo/types'

import { cargo, trade } from '../../business-layer/messaging/mock-data/mock-lc'
import { ILC } from '../../data-layer/models/ILC'
import IUser from '../IUser'
import { DocumentRequestBuilder, IDocumentRequestBuilder } from './DocumentRequestBuilder'
import { DOCUMENT_CATEGORY, DOCUMENT_PRODUCT, DOCUMENT_SUB_PRODUCT, DOCUMENT_TYPE } from './documentTypes'
import { IDocumentEventData } from './IDocumentEventData'
import { IDocumentType } from './IDocumentType'

let requestBuilder: IDocumentRequestBuilder
const LC: ILC = {
  issuingBankId: 'bank',
  applicantId: 'buyer',
  beneficiaryId: 'seller',
  tradeAndCargoSnapshot: {
    source: TradeSource.Vakt,
    sourceId: 'V123',
    trade,
    cargo: cargo[0]
  },
  direct: true,
  beneficiaryBankId: '',
  cargoIds: [''],
  type: '',
  applicableRules: '',
  feesPayableBy: '',
  currency: '',
  amount: 1,
  expiryDate: '',
  expiryPlace: '',
  availableWith: '',
  availableBy: '',
  documentPresentationDeadlineDays: 1,
  reference: 'test_reference',
  transactionHash: '',
  status: '',
  billOfLadingEndorsement: ''
}

const documentEventData: IDocumentEventData = {
  messageType: 'VAKT.Document',
  contents: 'MTIzNGR4',
  documentType: 'test-document',
  vaktId: 'VAKT112233',
  lcId: '111222',
  parcelId: '333444',
  filename: 'test.txt',
  metadata: {}
}

const documentType: IDocumentType = {
  typeId: 'test-document',
  categoryId: DOCUMENT_CATEGORY.TradeDocuments,
  productId: DOCUMENT_PRODUCT.TradeFinance
}

const user: IUser = {
  id: '1',
  firstName: 'Super',
  lastName: 'User',
  email: 'super@komgo.io'
}

describe('DocumentServiceClient', () => {
  beforeEach(() => {
    requestBuilder = new DocumentRequestBuilder()
  })

  describe('LC document', () => {
    it('LC document context', async () => {
      const constext = requestBuilder.getLCDocumentContext(LC)
      expect(constext).toEqual({
        productId: DOCUMENT_PRODUCT.TradeFinance,
        subProductId: DOCUMENT_SUB_PRODUCT.LC,
        lcId: LC.reference
      })
    })

    it('LC register document', async () => {
      const request = requestBuilder.getLCDocumentRequest(
        LC,
        {
          categoryId: DOCUMENT_CATEGORY.TradeFinanceDocuments,
          typeId: DOCUMENT_TYPE.LC,
          name: 'test-document',
          comment: 'comment'
        },
        {
          originalname: 'test-document',
          buffer: null,
          mimetype: 'text/plain',
          ext: '.txt'
        },
        user
      )
      expect(request.context).toEqual({
        productId: DOCUMENT_PRODUCT.TradeFinance,
        subProductId: DOCUMENT_SUB_PRODUCT.LC,
        lcId: LC.reference
      })
      expect(request.productId).toEqual(DOCUMENT_PRODUCT.TradeFinance)
      expect(request.categoryId).toEqual(DOCUMENT_CATEGORY.TradeFinanceDocuments)
      expect(request.typeId).toEqual(DOCUMENT_TYPE.LC)
      expect(request.comment).toEqual('comment')
    })

    it('adds parcel id to the document context if it is provided', async () => {
      const request = requestBuilder.getLCDocumentRequest(
        LC,
        {
          categoryId: DOCUMENT_CATEGORY.TradeFinanceDocuments,
          typeId: DOCUMENT_TYPE.LC,
          name: 'test-document',
          parcelId: 'parcelId',
          comment: 'comment'
        },
        {
          originalname: 'test-document',
          buffer: null,
          mimetype: 'text/plain',
          ext: '.txt'
        },
        user
      )
      expect(request.context).toEqual({
        productId: DOCUMENT_PRODUCT.TradeFinance,
        subProductId: DOCUMENT_SUB_PRODUCT.LC,
        lcId: LC.reference,
        parcelId: 'parcelId'
      })
      expect(request.productId).toEqual(DOCUMENT_PRODUCT.TradeFinance)
      expect(request.categoryId).toEqual(DOCUMENT_CATEGORY.TradeFinanceDocuments)
      expect(request.typeId).toEqual(DOCUMENT_TYPE.LC)
    })

    it('Trade register document', async () => {
      const request = requestBuilder.getTradeDocumentRequest(documentEventData, documentType, 'company-id1', {
        originalname: 'test-document',
        buffer: null,
        mimetype: 'text/plain',
        ext: '.txt'
      })
      expect(request.context).toEqual({
        productId: DOCUMENT_PRODUCT.TradeFinance,
        subProductId: DOCUMENT_SUB_PRODUCT.TRADE,
        vaktId: documentEventData.vaktId
      })
      expect(request.productId).toEqual(DOCUMENT_PRODUCT.TradeFinance)
      expect(request.categoryId).toEqual(documentType.categoryId)
      expect(request.typeId).toEqual(documentType.typeId)
    })

    it('Trade register document', async () => {
      const shareRequest = requestBuilder.getLCDocumentToShareRequest(LC, 'document-id-1', ['company-id-1'])
      expect(shareRequest).toEqual({
        productId: DOCUMENT_PRODUCT.TradeFinance,
        documents: ['document-id-1'],
        companies: ['company-id-1']
      })
    })
  })
})
