import 'reflect-metadata'
import { LCPresentationCreatedProcessor } from './LCPresentationCreatedProcessor'
import { IEvent } from '../../../common/IEvent'
import { ILCPresentationCreatedEvent } from './eventTypes/ILCPresentationCreatedEvent'
import { mockPresentation } from './mock-data/LCPresentation'
import * as _ from 'lodash'
import { LCPresentationContractStatus } from '../LCPresentationContractStatus'
import { LCPresentationStatus } from '@komgo/types'
import { InvalidMessageException } from '../../../../exceptions'

describe('LCPresentationCreatedProcessor', () => {
  const mockPresentationService = {
    getLCPresentationByReference: jest.fn(() => _.cloneDeep(mockPresentation)),
    updatePresentation: jest.fn(pres => pres)
  }

  const mockEventProcessor = {
    state: LCPresentationContractStatus.DocumentsPresented,
    processEvent: jest.fn()
  }

  const mockEventProcessorInvalid = {
    processEvent: jest.fn()
  }

  const mockLC = {
    beneficiaryId: 'ben',
    applicantId: 'app',
    issuingBankId: 'issuing'
  }

  const mockLcCacheDataAgent = {
    getLC: jest.fn().mockReturnValue(mockLC)
  }

  const mockPresCreatedEventData: ILCPresentationCreatedEvent = {
    name: 'LCPresentationCreated',
    beneficiaryGuid: '0xc8d02aa286d47b5052ca17edd5a4aea724ff2c3b2b3c1e254df5b64c0427a7e7',
    nominatedBankGuid: '0x0000000000000000000000000000000000000000000000000000000000000000',
    issuingBankGuid: '0x35aebb69355319478893e918a54eb50f1dd6c9fc8c718d778a3efb6ff38541af',
    applicantGuid: '0x791becc1ef6cd306e4d76b5d0a2c33a57043b69cb77d2ec2bd888c8f85d5936b',
    tradeDocuments: [
      [
        '["0x4063795c521c6c0e5d563c5a265a5a130b4906534d44196a6f2330734e421a18"]',
        '0x696e766f69636500000000000000000000000000000000000000000000000000' // invoice
      ]
    ],
    lcPresentationData: '{"lcPresentationReference":"1550655884375","lcReference":"2019-BP-7"}',
    lcAddress: '0xE4f4d8aD3Ad682F62AeF1dff017A83E48CDD1B89',
    beneficiaryComments: '',
    nominatedBankComments: '',
    issuingBankComments: '',
    currentStateId: '0xcd83c3c89af26a2e7e9a4890168b2b438291ac0e27e4a31fe3eb3ababa9084e8' // doc presented
  }

  const parsedPresentationDataForEvent = {
    LCReference: '2019-BP-7',
    applicantId: 'app',
    beneficiaryId: 'ben',
    destinationState: null,
    documents: [
      {
        // "dateProvided": 2019-02-20T10:39:44.111Z,
        documentHash: 'hash',
        documentId: 'docid',
        documentTypeId: 'q88'
      }
    ],
    issuingBankId: 'issuing',
    nominatedBankId: 'nominated',
    reference: '1550655884375',
    status: 'DOCUMENT_PRESENTED'
  }

  const mockTx = '0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1aa'
  const mockContractAddress = '0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1bd'
  const mockEvent: IEvent = {
    data: '',
    topics: ['0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1bd'],
    blockNumber: 1234,
    transactionHash: mockTx,
    address: mockContractAddress
  }

  let mockCompaniesReponse = [
    {
      node: mockPresCreatedEventData.applicantGuid,
      staticId: mockPresentation.applicantId
    },
    {
      node: mockPresCreatedEventData.nominatedBankGuid,
      staticId: mockPresentation.nominatedBankId
    },
    {
      node: mockPresCreatedEventData.issuingBankGuid,
      staticId: mockPresentation.issuingBankId
    },
    {
      node: mockPresCreatedEventData.beneficiaryGuid,
      staticId: mockPresentation.beneficiaryId
    }
  ]

  mockCompaniesReponse = _.filter(mockCompaniesReponse, c => c.node.indexOf('0x00') === -1)

  const mockCompanyRegistryService = {
    getMembersByNode: jest.fn().mockReturnValue(mockCompaniesReponse)
  }

  let processor: LCPresentationCreatedProcessor

  beforeEach(() => {
    processor = new LCPresentationCreatedProcessor(
      mockPresentationService as any,
      [mockEventProcessor as any],
      mockLcCacheDataAgent as any,
      mockCompanyRegistryService as any,
      mockPresentation.beneficiaryId
    )
  })

  it('should fail in no lc', async () => {
    mockLcCacheDataAgent.getLC.mockReturnValueOnce(null)

    await expect(processor.processEvent(mockPresCreatedEventData, mockEvent)).rejects.toThrow(
      new InvalidMessageException(`LC with address ${mockPresCreatedEventData.lcAddress} not found`)
    )
  })

  it('should fail if non matching parties', async () => {
    const resp = _.cloneDeep(mockCompaniesReponse)
    resp[0].staticId = 'invalid'

    mockCompanyRegistryService.getMembersByNode.mockReturnValueOnce(resp)

    await expect(processor.processEvent(mockPresCreatedEventData, mockEvent)).rejects.toThrow(
      new InvalidMessageException(`Parties received from contract do not match LC parties`)
    )
  })

  it('should process event', async () => {
    await processor.processEvent(mockPresCreatedEventData, mockEvent)

    expect(mockPresentationService.getLCPresentationByReference).toHaveBeenCalledWith(
      parsedPresentationDataForEvent.reference
    )
    const presentationData = mockEventProcessor.processEvent.mock.calls[0][0]

    const expected = {
      ...parsedPresentationDataForEvent,
      contracts: [
        {
          contractAddress: mockContractAddress,
          key: 'docs presented',
          transactionHash: mockTx
        }
      ],
      destinationState: null,
      documents: [
        {
          documentHash: 'hash',
          documentId: 'docid',
          documentTypeId: 'q88'
        }
      ],
      stateHistory: [
        {
          fromState: LCPresentationStatus.DocumentsPresented,
          performer: 'ben',
          toState: LCPresentationStatus.DocumentsPresented
        }
      ],
      status: LCPresentationStatus.DocumentsPresented
    }
    expect(presentationData).toMatchObject(expected)
  })

  it('should fail if non matching processor', async () => {
    processor = new LCPresentationCreatedProcessor(
      mockPresentationService as any,
      [mockEventProcessorInvalid as any],
      mockLcCacheDataAgent as any,
      mockCompanyRegistryService as any,
      mockPresentation.beneficiaryId
    )

    await expect(processor.processEvent(mockPresCreatedEventData, mockEvent)).rejects.toThrow(
      new InvalidMessageException(`Can't find processor for state docs presented`)
    )
  })
})
