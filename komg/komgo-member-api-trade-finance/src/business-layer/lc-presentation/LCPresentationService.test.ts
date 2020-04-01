import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'
import { LCPresentationDocumentStatus, LCPresentationStatus } from '@komgo/types'
import { ILC } from '../../data-layer/models/ILC'
import { ILCPresentationDataAgent } from '../../data-layer/data-agents'
import { LCPresentationService } from './LCPresentationService'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { DocumentServiceClient, IDocumentServiceClient } from '../documents/DocumentServiceClient'
import { documentResponse, DOCUMENT_ID } from '../test-entities'
import { ILCPresentationDocument } from '../../data-layer/models/ILCPresentationDocument'
import { IDocumentRequestBuilder, DocumentRequestBuilder } from '../documents/DocumentRequestBuilder'
import { LC_STATE } from '../events/LC/LCStates'
import {
  ILCPresentationTransactionManager,
  LCPresentationTransactionManager
} from '../blockchain/LCPresentationTransactionManager'
import { InvalidOperationException } from '../../exceptions'

const lc: ILC = {
  _id: '1',
  applicantId: 'app1',
  beneficiaryId: 'ben1',
  beneficiaryBankId: 'benBankId',
  issuingBankId: 'iss1',
  direct: false,
  feesPayableBy: 'fees',
  type: 'type',
  applicableRules: 'applicable',
  currency: 'usd',
  amount: 123,
  expiryDate: new Date(),
  expiryPlace: 'place',
  availableWith: 'available',
  availableBy: 'by',
  documentPresentationDeadlineDays: 5,
  cargoIds: []
}

export const trade = {
  _id: '1',
  version: 1,
  source: 'VAKT',
  messageType: 'KOMGO.Trade.TradeData',
  sellerEtrmId: '49779',
  buyerEtrmId: '95267',
  vaktId: '49000',
  seller: 'a3d82ae6-908c-49da-95b3-ba1ebe7e5f85',
  buyer: '08e9f8e3-94e5-459e-8458-ab512bee6e2c',
  dealDate: '2018-10-25',
  currency: 'USD',
  price: 73.1415,
  priceUnit: 'BBL',
  quantity: 600000,
  deliveryTerms: 'FOB',
  deliveryPeriod: {
    startDate: '2018-10-01',
    endDate: '2018-10-31'
  },
  pricingTerms: null,
  paymentTerms: {
    eventBase: 'BL',
    when: 'FROM',
    time: 30,
    timeUnit: 'DAYS',
    dayType: 'CALENDAR'
  },
  inspection: null,
  credit: 'DOCUMENTARY_LETTER_OF_CREDIT',
  laytime: 'as per GT&Cs',
  invoiceQuantity: 'load',
  demurrageTerms: 'as per GT&Cs',
  generalTermsAndConditions: 'SUKO90',
  law: 'ENGLISH_LAW',
  maxTolerance: 1,
  minTolerance: 1,
  requiredDocuments: [
    'BILL_OF_LADING',
    'CERTIFICATE_OF_ORIGIN',
    'QUALITY_AND_QUANTITY_REPORT',
    'CERTIFICATE_OF_INSURANCE'
  ],
  isLCCancelled: false
}

const presentationDocument: ILCPresentationDocument = {
  documentId: DOCUMENT_ID,
  status: LCPresentationDocumentStatus.Draft,
  dateProvided: new Date(),
  documentHash: '34234234',
  documentTypeId: 'type'
}
const presentation: ILCPresentation = {
  staticId: '10ba038e-48da-487b-96e8-8d3b99b6d18a',
  status: LCPresentationStatus.Draft,
  beneficiaryId: 'beneficiary1',
  applicantId: 'app1',
  issuingBankId: 'company1',
  LCReference: 'lcref1',
  reference: 'ref1',
  documents: [presentationDocument]
}

const mockDataAgent: ILCPresentationDataAgent = {
  savePresentation: jest.fn(),
  getById: jest.fn(),
  getByAttributes: jest.fn(),
  getByReference: jest.fn(),
  getByLcReference: jest.fn(),
  deleteLCPresentation: jest.fn(),
  updateField: jest.fn()
}

const tradeAndCargoSnapshot = {
  source: trade.source,
  sourceId: trade.vaktId,
  trade
}

let documentClientMock: IDocumentServiceClient
let documentRequestBuilder: IDocumentRequestBuilder
let transtactionManagerMock: ILCPresentationTransactionManager

documentClientMock = createMockInstance(DocumentServiceClient)
documentRequestBuilder = createMockInstance(DocumentRequestBuilder)
transtactionManagerMock = createMockInstance(LCPresentationTransactionManager)

const service: LCPresentationService = new LCPresentationService(
  mockDataAgent as any,
  documentClientMock as any,
  documentRequestBuilder,
  transtactionManagerMock
)
const logger = (service as any).logger
logger.info = jest.fn()
logger.warn = jest.fn()
logger.error = jest.fn()

const id = '10ba038e-48da-487b-96e8-8d3b99b6d18a'

describe('ILCPresentationService', () => {
  it('Nominated back is IssuingBank - create new presentation', async () => {
    const customLc = {
      ...lc,
      availableWith: 'IssuingBank'
    }
    await service.createNewPresentation(customLc)
    expect(mockDataAgent.savePresentation).toBeCalled()
  })
  it('Nominated back is AdvisingBank - create new presentation', async () => {
    const customLc = {
      ...lc,
      availableWith: 'AdvisingBank',
      beneficiaryBankRole: 'AdvisingBank'
    }
    await service.createNewPresentation(customLc)
    expect(mockDataAgent.savePresentation).toBeCalled()
  })
  it('Nominated back is AdvisingBank and beneficiaryBankId is null create new presentation', async () => {
    const customLc = {
      ...lc,
      availableWith: 'AdvisingBank',
      beneficiaryBankRole: 'ben1',
      beneficiaryBankId: null
    }
    await expect(service.createNewPresentation(customLc)).rejects.toBeDefined()
  })
  it('Update presentation', async () => {
    await service.updatePresentation(presentation)
    expect(mockDataAgent.savePresentation).toBeCalled()
  })
  it('Get presentation', async () => {
    await service.getLCPresentationById('1')
    expect(mockDataAgent.getById).toBeCalled()
  })

  it('Get presentation by id - not found presentation', async () => {
    mockDataAgent.getById = jest.fn().mockImplementation(() => {
      throw Error('Not found lc presentation by id')
    })

    const result = service.getLCPresentationById('reference')
    expect(mockDataAgent.getById).toBeCalled()
    await expect(result).rejects.toBeDefined()
  })

  it('Delete presentation', async () => {
    documentClientMock.deleteDocument = jest.fn().mockImplementation(() => documentResponse())
    mockDataAgent.getById = jest.fn().mockResolvedValue({
      staticId: id,
      status: LCPresentationStatus.Draft,
      documents: [
        {
          _id: '123455'
        }
      ]
    })
    await service.deletePresentationById(id)
    expect(mockDataAgent.deleteLCPresentation).toBeCalled()
  })

  it('Get presentation by reference', async () => {
    await service.getPresentationsByLcReference(presentation.reference)
    expect(mockDataAgent.getByLcReference).toBeCalled()
  })

  it('Get presentation by reference - not found presentation', async () => {
    mockDataAgent.getByLcReference = jest.fn().mockImplementation(() => {
      throw Error(`Failed to get LC Presentation`)
    })

    const result = service.getPresentationsByLcReference(presentation.reference)
    expect(mockDataAgent.getByLcReference).toBeCalled()
    await expect(result).rejects.toBeDefined()
  })

  it('Get presentation documents by reference', async () => {
    documentClientMock.getDocuments = jest.fn().mockImplementation(() => [documentResponse()])
    const simpleLC = {
      ...lc,
      ...tradeAndCargoSnapshot
    }
    expect(Array.isArray(await service.getLCPresentationDocuments(simpleLC, presentation))).toEqual(true)
  })

  it('should not delete document from presentation invalid operation', async () => {
    mockDataAgent.getById = jest.fn().mockResolvedValue({
      ...presentation,
      status: LCPresentationStatus.DocumentsPresented
    })
    await expect(service.deletePresentationDocument(id, DOCUMENT_ID)).rejects.toBeInstanceOf(InvalidOperationException)
  })

  it('should not delete document from presentation not found', async () => {
    mockDataAgent.getById = jest.fn().mockResolvedValue({
      ...presentation,
      documents: []
    })
    await expect(service.deletePresentationDocument(id, DOCUMENT_ID)).rejects.toBeDefined()
  })

  it('should not delete document from presentation not found', async () => {
    documentClientMock.deleteDocument = jest.fn().mockImplementation(() => documentResponse())
    mockDataAgent.getById = jest.fn().mockResolvedValue(presentation)

    await service.deletePresentationDocument(id, DOCUMENT_ID)
    expect(mockDataAgent.savePresentation).toBeCalled()
  })

  it('Should not delete lc presentation', async () => {
    documentClientMock.deleteDocument = jest.fn().mockImplementation(() => documentResponse())
    mockDataAgent.getById = jest.fn().mockImplementation(() => {
      return {
        ...presentation,
        status: LCPresentationStatus.DocumentsPresented
      }
    })
    await expect(service.deletePresentationById(presentation.staticId)).rejects.toBeInstanceOf(
      InvalidOperationException
    )
  })
  it('should be can not remove documents', async () => {
    documentClientMock.deleteDocument = jest.fn().mockImplementation(() => null)
    mockDataAgent.getById = jest.fn().mockImplementation(() => {
      return {
        staticId: id,
        status: LCPresentationStatus.Draft,
        documents: [
          {
            _id: '123455'
          }
        ]
      }
    })
    const result = service.deletePresentationById(id)
    await expect(result).rejects.toBeDefined()
  })
  it('Shoud be failed delete lc presentation', async () => {
    documentClientMock.deleteDocument = jest.fn().mockImplementation(() => documentResponse())
    mockDataAgent.getById = jest.fn().mockImplementation(() => {
      return {
        staticId: id,
        status: LCPresentationStatus.Draft,
        documents: [
          {
            _id: '123455'
          }
        ]
      }
    })
    mockDataAgent.deleteLCPresentation = jest.fn().mockImplementation(() => {
      throw new Error(`LC presentation ${id} not found`)
    })
    const result = service.deletePresentationById(id)
    await expect(result).rejects.toBeDefined()
  })

  it('Should be get lc presentation by attibutes', async () => {
    mockDataAgent.getByAttributes = jest.fn().mockImplementation(() => {
      return {
        _id: '1',
        reference: 'reference'
      }
    })
    const result = await service.getLCPresentation({ _id: '1', reference: 'reference' })
    expect(mockDataAgent.getByAttributes).toBeCalled()
    expect(result).toEqual({ _id: '1', reference: 'reference' })
  })

  it('Shoud be get lc presentation by attibutes', async () => {
    mockDataAgent.getByAttributes = jest.fn().mockImplementation(() => {
      throw Error('Not found lc presentation by reference')
    })
    const result = service.getLCPresentation({ _id: '1', reference: 'reference' })
    expect(mockDataAgent.getByAttributes).toBeCalled()
    await expect(result).rejects.toBeDefined()
  })

  it('Shoud be get lc presentation by reference', async () => {
    mockDataAgent.getByReference = jest.fn().mockImplementation(() => {
      return {
        _id: '1'
      }
    })

    const result = await service.getLCPresentationByReference('reference')
    expect(mockDataAgent.getByReference).toBeCalled()
    expect(result).toEqual({ _id: '1' })
  })

  it('Shoud be get lc presentation by reference - not found presentation', async () => {
    mockDataAgent.getByReference = jest.fn().mockImplementation(() => {
      throw Error('Not found lc presentation by reference')
    })

    const result = service.getLCPresentationByReference('reference')
    expect(mockDataAgent.getByReference).toBeCalled()
    await expect(result).rejects.toBeDefined()
  })

  it('Shoud be submit presentation', async () => {
    const comment = 'Test comment'

    const LC = {
      ...lc,
      status: LC_STATE.ACKNOWLEDGED
    }

    transtactionManagerMock.deployDocPresented = jest.fn().mockImplementation(() => {
      return '0x5e710c0d0a76351c7012241f641f64307c494c660a3d2e4c5b772f7855457d5a'
    })

    mockDataAgent.savePresentation = jest.fn().mockImplementation(() => {
      return {
        _id: '1'
      }
    })
    const result = await service.submitPresentation(presentation, comment, LC)
    expect(await transtactionManagerMock.deployDocPresented).toBeCalled()
    expect(result).toEqual('0x5e710c0d0a76351c7012241f641f64307c494c660a3d2e4c5b772f7855457d5a')
  })

  it('Submit presentation wrong lc status', async () => {
    const comment = 'Test comment'
    const result = service.submitPresentation(presentation, comment, lc)
    await expect(result).rejects.toBeDefined()
  })

  it('Submit presentation wrong lc presentation status', async () => {
    const comment = 'Test comment'

    const LC = {
      ...lc,
      status: LC_STATE.ACKNOWLEDGED
    }

    const LCPresentation = {
      ...presentation,
      status: LCPresentationStatus.DocumentsPresented
    }

    const result = service.submitPresentation(LCPresentation, comment, LC)
    await expect(result).rejects.toBeDefined()
  })

  it('Submit presentation - failed save presentation', async () => {
    const comment = 'Test comment'

    const LC = {
      ...lc,
      status: LC_STATE.ACKNOWLEDGED
    }

    const LCPresentation = {
      ...presentation
    }

    transtactionManagerMock.deployDocPresented = jest.fn().mockImplementation(() => {
      return '0x5e710c0d0a76351c7012241f641f64307c494c660a3d2e4c5b772f7855457d5a'
    })

    mockDataAgent.savePresentation = jest.fn().mockImplementation(() => {
      throw Error('Update presentation failed')
    })

    const result = service.submitPresentation(LCPresentation, comment, LC)
    await expect(result).rejects.toBeDefined()
  })
})
