import { LCPresentationDocumentStatus, LCPresentationStatus } from '@komgo/types'

const mockCompliantStatus = jest.fn().mockReturnValue(LCPresentationStatus.DocumentsCompliantByIssuingBank)
const mockDiscrepantStatus = jest.fn().mockReturnValue(LCPresentationStatus.DocumentsDiscrepantByNominatedBank)
const mockResolveAdviseStatus = jest.fn()
const mockResolveDiscrepanciesAcceptStatus = jest.fn()
const mockResolveDiscrepanciesRejectStatus = jest.fn()

jest.mock('./reviewStateUtil', () => ({
  resolveCompliantStatus: () => {
    return mockCompliantStatus()
  },
  resolveDisrepantStatus: () => {
    return mockDiscrepantStatus()
  },
  resolveAdviseStatus: () => {
    return mockResolveAdviseStatus()
  },
  resolveDiscrepanciesAcceptStatus: () => {
    return mockResolveDiscrepanciesAcceptStatus()
  },
  resolveDiscrepanciesRejectStatus: () => {
    return mockResolveDiscrepanciesRejectStatus()
  }
}))

import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'
import { ILC } from '../../data-layer/models/ILC'
import { ILCPresentationDataAgent } from '../../data-layer/data-agents'
import {
  DOCUMENT_ID,
  documentReceivedResponse,
  documentReviewResponse,
  sharedDocumentsResponse
} from '../test-entities'
import { ILCPresentationDocument } from '../../data-layer/models/ILCPresentationDocument'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { DocumentServiceClient, IDocumentServiceClient } from '../documents/DocumentServiceClient'
import { LCPresentationReviewService } from './LCPresentationReviewService'
import { IDocumentRequestBuilder, DocumentRequestBuilder } from '../documents/DocumentRequestBuilder'
import { IReceivedDocumentsResponse, DOCUMENT_STATUS } from '../documents/IReceivedDocuments'

import { ILCPresentationTaskFactory } from '../tasks/LCPresentationTaskFactory'
import { TaskManager, TaskStatus } from '@komgo/notification-publisher'
import { fakeLetterOfCredit } from '../messaging/mock-data/fakeLetterOfCredit'
import {
  ILCPresentationTransactionManager,
  LCPresentationTransactionManager
} from '../blockchain/LCPresentationTransactionManager'

import { ISharedDocumentsResponse } from '../documents/ISharedDocumentsResponse'
import { InvalidOperationException } from '../../exceptions'

const lc: ILC = fakeLetterOfCredit()
const presentationDocument: ILCPresentationDocument = {
  documentId: DOCUMENT_ID,
  status: LCPresentationDocumentStatus.Submitted,
  dateProvided: new Date(),
  documentHash: '34234234',
  documentTypeId: 'type'
}
const presentation: ILCPresentation = {
  staticId: '10ba038e-48da-487b-96e8-8d3b99b6d18a',
  status: LCPresentationStatus.DocumentsPresented,
  stateHistory: [],
  beneficiaryId: 'beneficiary1',
  applicantId: 'app1',
  issuingBankId: 'company1',
  LCReference: 'lcref1',
  reference: 'ref1',
  documents: [presentationDocument],
  contracts: [
    {
      contractAddress: '0x2B0Cf1aE69E24044776e5e3FfBE2424FdeFD44DF',
      transactionHash: '0x0de4ea415e830ac80443f1082622e81b67306accf305596566fbb83082673feb',
      key: LCPresentationStatus.DocumentsPresented
    }
  ]
}
const mockDataAgent: jest.Mocked<ILCPresentationDataAgent> = {
  savePresentation: jest.fn(),
  getById: jest.fn(),
  getByAttributes: jest.fn(),
  getByReference: jest.fn(),
  getByLcReference: jest.fn(),
  deleteLCPresentation: jest.fn(),
  updateField: jest.fn()
}
const receivedDocuments: IReceivedDocumentsResponse = documentReceivedResponse()
const sharedDocuments: ISharedDocumentsResponse = sharedDocumentsResponse()

let documentClientMock: IDocumentServiceClient
documentClientMock = createMockInstance(DocumentServiceClient)

let requestBuilder: IDocumentRequestBuilder
requestBuilder = createMockInstance(DocumentRequestBuilder)

const mockTaskFactory: ILCPresentationTaskFactory = {
  getTask: jest.fn(() => ({
    task: {},
    notification: {}
  })),
  getTaskContext: jest.fn().mockReturnValue({ lcPresentationStaticId: 1 })
}

const mockTaskManager = createMockInstance(TaskManager)

let service: LCPresentationReviewService
let presentationTransactionManager: jest.Mocked<ILCPresentationTransactionManager>

describe('LCPresentationReviewService', () => {
  beforeEach(() => {
    mockTaskManager.updateTaskStatus.mockReset()
    mockDataAgent.savePresentation.mockReset()

    presentationTransactionManager = createMockInstance(LCPresentationTransactionManager)
    documentClientMock.getReceivedDocuments = jest.fn().mockResolvedValue([receivedDocuments])
    documentClientMock.getSendDocumentFeedback = jest.fn().mockResolvedValue([])
    service = new LCPresentationReviewService(
      mockDataAgent,
      documentClientMock,
      requestBuilder,
      presentationTransactionManager,
      mockTaskFactory,
      mockTaskManager,
      'company1'
    )
  })

  describe('mark compliant', async () => {
    it('should mark compliant as NominatedBank', async () => {
      mockCompliantStatus.mockReturnValueOnce(LCPresentationStatus.DocumentsCompliantByNominatedBank)

      await service.markCompliant(presentation, lc)

      expect(presentationTransactionManager.nominatedBankSetDocumentsCompliant).toHaveBeenCalled()
    })

    it('should mark compliant as IssuingBank', async () => {
      mockCompliantStatus.mockReturnValueOnce(LCPresentationStatus.DocumentsCompliantByIssuingBank)

      await service.markCompliant(presentation, lc)

      expect(presentationTransactionManager.issuingBankSetDocumentsCompliant).toHaveBeenCalled()
    })

    it('should fail it invalid compliant state', async () => {
      mockCompliantStatus.mockReturnValueOnce({ error: 'invalid' })

      const response = service.markCompliant(presentation, lc)

      await expect(response).rejects.toBeInstanceOf(InvalidOperationException)
    })

    it('should fail for invalid state', async () => {
      mockCompliantStatus.mockReturnValueOnce('some state')

      const response = service.markCompliant(presentation, lc)

      await expect(response).rejects.toBeInstanceOf(InvalidOperationException)
    })

    it('should fail mark compliant if some documents not accepted', async () => {
      documentClientMock.getReceivedDocuments = jest.fn().mockResolvedValue([
        {
          ...receivedDocuments,
          documents: [
            {
              ...documentReviewResponse(),
              status: DOCUMENT_STATUS.Rejected
            }
          ]
        }
      ])
      await expect(service.markCompliant(presentation, lc)).rejects.toBeInstanceOf(InvalidOperationException)
    })

    it('should revert task state on error', async () => {
      presentationTransactionManager.issuingBankSetDocumentsCompliant.mockImplementationOnce(() => {
        throw Error('some error')
      })

      const response = service.markCompliant(presentation, lc)

      await expect(response).rejects.toBeInstanceOf(Error)
      expect(mockTaskManager.updateTaskStatus.mock.calls[1][0]).toMatchObject({ status: TaskStatus.ToDo })
    })

    it('should continue if setting temp state fails', async () => {
      mockDataAgent.savePresentation.mockRejectedValueOnce(Error('Task update fails'))

      await service.markCompliant(presentation, lc)

      expect(presentationTransactionManager.issuingBankSetDocumentsCompliant).toHaveBeenCalled()
    })

    it('should continue if pending task update fails', async () => {
      mockTaskManager.updateTaskStatus.mockRejectedValueOnce(Error('Task update fails'))

      await service.markCompliant(presentation, lc)

      expect(presentationTransactionManager.issuingBankSetDocumentsCompliant).toHaveBeenCalled()
    })
  })

  describe('mark discrepant', async () => {
    it('should mark discrepant as NominatedBank', async () => {
      mockDiscrepantStatus.mockReturnValueOnce(LCPresentationStatus.DocumentsDiscrepantByNominatedBank)

      await service.markDiscrepant(presentation, lc, 'comment')

      expect(presentationTransactionManager.nominatedBankSetDocumentsDiscrepant).toHaveBeenCalled()
    })

    it('should mark discrepant as IssuingBank', async () => {
      mockDiscrepantStatus.mockReturnValueOnce(LCPresentationStatus.DocumentsDiscrepantByIssuingBank)

      await service.markDiscrepant(presentation, lc, 'comment')

      expect(presentationTransactionManager.issuingBankSetDocumentsDiscrepant).toHaveBeenCalled()
    })

    it('should fail it invalid discrepant state', async () => {
      mockDiscrepantStatus.mockReturnValueOnce({ error: 'invalid' })

      const response = service.markDiscrepant(presentation, lc, 'comment')

      await expect(response).rejects.toBeInstanceOf(InvalidOperationException)
    })

    it('should fail mark discrepant if some documents not reviewed', async () => {
      documentClientMock.getReceivedDocuments = jest.fn().mockResolvedValue([
        {
          ...receivedDocuments,
          documents: [
            {
              ...documentReviewResponse(),
              status: null
            }
          ]
        }
      ])
      await expect(service.markDiscrepant(presentation, lc, 'comment')).rejects.toBeInstanceOf(
        InvalidOperationException
      )
    })

    it('should fail for invalid state', async () => {
      mockDiscrepantStatus.mockReturnValueOnce('some state')

      const response = service.markDiscrepant(presentation, lc, 'comment')

      await expect(response).rejects.toBeInstanceOf(InvalidOperationException)
    })
  })

  describe('advise discrepancies', () => {
    it('should advise as NominatedBank', async () => {
      mockResolveAdviseStatus.mockReturnValueOnce(LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank)

      await service.adviseDiscrepancies(presentation, lc, 'comment')

      expect(presentationTransactionManager.nominatedBankAdviseDiscrepancies).toHaveBeenCalled()
    })

    it('should advise as IssuingBank', async () => {
      mockResolveAdviseStatus.mockReturnValueOnce(LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank)

      await service.adviseDiscrepancies(presentation, lc, 'comment')

      expect(presentationTransactionManager.issungBankAdviseDiscrepancies).toHaveBeenCalled()
    })

    it('should fail for invalid state', async () => {
      mockResolveAdviseStatus.mockReturnValueOnce('some state')

      const response = service.adviseDiscrepancies(presentation, lc, 'comment')

      await expect(response).rejects.toBeInstanceOf(InvalidOperationException)
    })

    it('should fail for invalid bank', async () => {
      mockResolveAdviseStatus.mockReturnValueOnce({ error: `Must be issuing or nominated bank` })

      const response = service.adviseDiscrepancies(presentation, lc, 'comment')

      await expect(response).rejects.toBeInstanceOf(InvalidOperationException)
    })
  })

  describe('accept discrepancies', () => {
    it('should accept as IssuingBank when advised by NominatedBank', async () => {
      mockResolveDiscrepanciesAcceptStatus.mockReturnValueOnce(LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank)

      await service.acceptDiscrepancies(presentation, lc, 'comment')

      expect(presentationTransactionManager.issuingBankSetDiscrepanciesAccepted).toHaveBeenCalled()
    })

    it('should accept as applicant when advised by IssuingBank', async () => {
      mockResolveDiscrepanciesAcceptStatus.mockReturnValueOnce(LCPresentationStatus.DocumentsAcceptedByApplicant)

      await service.acceptDiscrepancies(presentation, lc, 'comment')

      expect(presentationTransactionManager.applicantSetDiscrepanciesAccepted).toHaveBeenCalled()
    })

    it('should accept as applicant when accepted by IssuingBank', async () => {
      mockResolveDiscrepanciesAcceptStatus.mockReturnValueOnce(LCPresentationStatus.DocumentsAcceptedByApplicant)

      await service.acceptDiscrepancies(presentation, lc, 'comment')

      expect(presentationTransactionManager.applicantSetDiscrepanciesAccepted).toHaveBeenCalled()
    })

    it('should fail for invalid state', async () => {
      mockResolveDiscrepanciesAcceptStatus.mockReturnValueOnce('some state')

      const response = service.acceptDiscrepancies(presentation, lc, 'comment')

      await expect(response).rejects.toBeInstanceOf(InvalidOperationException)
    })

    it('should fail for invalid request', async () => {
      mockResolveDiscrepanciesAcceptStatus.mockReturnValueOnce({ error: `Invalid presentation status or party` })

      const response = service.acceptDiscrepancies(presentation, lc, 'comment')

      await expect(response).rejects.toBeInstanceOf(InvalidOperationException)
    })
  })

  describe('reject discrepancies', () => {
    it('should reject as IssuingBank when advised by NominatedBank', async () => {
      mockResolveDiscrepanciesRejectStatus.mockReturnValueOnce(LCPresentationStatus.DiscrepanciesRejectedByIssuingBank)

      await service.rejectDiscrepancies(presentation, lc, 'comment')

      expect(presentationTransactionManager.issuingBankSetDiscrepanciesRejected).toHaveBeenCalled()
    })

    it('should reject as applicant when advised by IssuingBank', async () => {
      mockResolveDiscrepanciesRejectStatus.mockReturnValueOnce(LCPresentationStatus.DiscrepanciesRejectedByApplicant)

      await service.rejectDiscrepancies(presentation, lc, 'comment')

      expect(presentationTransactionManager.applicantSetDiscrepanciesRejected).toHaveBeenCalled()
    })

    it('should reject as applicant when accepted by IssuingBank', async () => {
      mockResolveDiscrepanciesRejectStatus.mockReturnValueOnce(LCPresentationStatus.DiscrepanciesRejectedByApplicant)

      await service.rejectDiscrepancies(presentation, lc, 'comment')

      expect(presentationTransactionManager.applicantSetDiscrepanciesRejected).toHaveBeenCalled()
    })

    it('should fail for invalid state', async () => {
      mockResolveDiscrepanciesRejectStatus.mockReturnValueOnce('some state')

      const response = service.rejectDiscrepancies(presentation, lc, 'comment')

      await expect(response).rejects.toBeInstanceOf(InvalidOperationException)
    })

    it('should fail for invalid request', async () => {
      mockResolveDiscrepanciesRejectStatus.mockReturnValueOnce({ error: `Invalid presentation status or party` })

      const response = service.rejectDiscrepancies(presentation, lc, 'comment')

      await expect(response).rejects.toBeInstanceOf(InvalidOperationException)
    })
  })

  it('get document feedback', async () => {
    const customPresentation = {
      ...presentation,
      beneficiaryId: 'company1',
      nominatedBankId: 'nom1',
      status: LCPresentationStatus.DocumentsDiscrepantByNominatedBank
    }

    documentClientMock.getSendDocumentFeedback = jest
      .fn()
      .mockResolvedValue([{ ...sharedDocuments, companyId: 'nom1' }])
    const feedback = await service.getDocumentsFeedback(customPresentation)
    expect(feedback).toMatchObject({
      companyId: 'nom1',
      documents: sharedDocuments.documents,
      feedbackReceived: sharedDocuments.feedbackReceived
    })
  })

  it('get document feedback - fail if not beneficiary documents ', async () => {
    const customPresentation = {
      ...presentation,
      beneficiaryId: 'failed-beneficiary-id',
      status: LCPresentationStatus.DocumentsDiscrepantByNominatedBank
    }
    await expect(service.getDocumentsFeedback(customPresentation)).rejects.toBeInstanceOf(InvalidOperationException)
  })

  it('get document feedback - fail if not beneficiary documents ', async () => {
    const customPresentation = {
      ...presentation,
      beneficiaryId: 'company1',
      status: LCPresentationStatus.Draft
    }
    await expect(service.getDocumentsFeedback(customPresentation)).rejects.toBeInstanceOf(InvalidOperationException)
  })
})
