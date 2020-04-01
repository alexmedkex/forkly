import { createMockInstance } from 'jest-create-mock-instance'
import { stringify } from 'qs'
import { compressToBase64 } from 'lz-string'
import 'reflect-metadata'
import { DocumentRequestBuilder, IDocumentRequestBuilder } from '../../business-layer/documents/DocumentRequestBuilder'
import { DocumentService } from '../../business-layer/documents/DocumentService'
import { DocumentServiceClient, IDocumentServiceClient } from '../../business-layer/documents/DocumentServiceClient'
import { IDocumentRegisterResponse } from '../../business-layer/documents/IDocumentRegisterResponse'
import { LCAcknowledgeUseCase } from '../../business-layer/LCAcknowledgeUseCase'
import { LCAdviseUseCase } from '../../business-layer/LCAdviseUseCase'
import { LCIssueUseCase } from '../../business-layer/LCIssueUseCase'
import { LCRejectAdvisingUseCase } from '../../business-layer/LCRejectAdvisingUseCase'
import { LCRejectBeneficiaryUseCase } from '../../business-layer/LCRejectBeneficiaryUseCase'
import { LCRequestRejectUseCase } from '../../business-layer/LCRequestRejectUseCase'
import { LCUseCase } from '../../business-layer/LCUseCase'
import { documentResponse } from '../../business-layer/test-entities'
import { LCCacheDataAgent } from '../../data-layer/data-agents'
import { IRejectLCRequest } from '../requests/IRejectLCRequest'
import { IRequestLCResponse } from '../responses/ICreateLCResponse'
import Uploader from '../utils/Uploader'
import { LCController } from './LCController'
import { LCPresentationService } from '../../business-layer/lc-presentation/LCPresentationService'
import { ICreateLCRequest } from '../requests/ILetterOfCredit'
import { LCPresentationStatus, Currency } from '@komgo/types'
import { HttpException } from '@komgo/microservice-config'
import { TimerServiceClient } from '../../business-layer/timers/TimerServiceClient'
import { ITimerResponse } from '../../business-layer/timers/ITimer'
import { LC_STATE } from '../../business-layer/events/LC/LCStates'
import { TradeInstrumentValidationService } from '../../business-layer/trade-cargo/TradeInstrumentValidationService'

const MockExpressRequest = require('mock-express-request')
const lcUseCaseMock = createMockInstance(LCUseCase)
const lcRejectUseCaseMock = createMockInstance(LCRequestRejectUseCase)
const lcIssueUseCaseMock = createMockInstance(LCIssueUseCase)
const lcAcknowledgeUseCase = createMockInstance(LCAcknowledgeUseCase)
const lcRejectBeneficiaryUseCase = createMockInstance(LCRejectBeneficiaryUseCase)
const lcRejectAdvisingUseCase = createMockInstance(LCRejectAdvisingUseCase)
const lcAdviseUseCase = createMockInstance(LCAdviseUseCase)

const lcDataAgentMock = createMockInstance(LCCacheDataAgent)
const uploaderMock = createMockInstance(Uploader)
const documentService = createMockInstance(DocumentService)
const lCPresentationServiceMock = createMockInstance(LCPresentationService)
const timerServiceClientMock = createMockInstance(TimerServiceClient)
const tradeInstrumentValidationMock = createMockInstance(TradeInstrumentValidationService)

let documentClientMock: IDocumentServiceClient
let documentRequestBuilderMock: IDocumentRequestBuilder

let controller: LCController

const applicantId = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'

const sampleLC: IRequestLCResponse = {
  applicantId: 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016',
  applicantContactPerson: 'Donald Duck',
  beneficiaryId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c',
  beneficiaryContactPerson: 'string',
  issuingBankId: '1bc05a66-1eba-44f7-8f85-38204e4d3516',
  issuingBankContactPerson: 'Scrooge',
  direct: false,
  beneficiaryBankId: 'ecc3b179-00bc-499c-a2f9-f8d1cc58e9db',
  beneficiaryBankContactPerson: 'Mickey Mouse',
  beneficiaryBankRole: 'ADVISING',
  tradeId: '555',
  cargoIds: [],
  type: 'IRREVOCABLE',
  applicableRules: 'UCP latest version',
  feesPayableBy: 'OTHER',
  currency: Currency.EUR,
  amount: 1000000,
  expiryDate: '2020-12-31',
  expiryPlace: 'ISSUING_BANK',
  availableWith: 'ISSUING_BANK',
  availableBy: 'DEFERRED_PAYMENT',
  partialShipmentAllowed: true,
  transhipmentAllowed: false,
  documentPresentationDeadlineDays: 21,
  comments: 'a comment',
  reference: 'LC18-MER-1'
}

const sampleCreateLCRequest: ICreateLCRequest = {
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
  availableWith: 'IssuingBank',
  availableBy: 'DEFERRED_PAYMENT',
  documentPresentationDeadlineDays: 21,
  cargoIds: ['string'],
  billOfLadingEndorsement: 'IssuingBank',
  templateType: 'KOMGO_BFOET',
  LOI: 'hi',
  LOIAllowed: true,
  LOIType: 'KOMGO_LOI',
  generatedPDF: 'example PDF',
  freeTextLc: 'example free text',
  invoiceRequirement: 'EXHAUSTIVE'
}

const lcDocument: IDocumentRegisterResponse = {
  id: 'document-1',
  name: 'test-document',
  ...documentResponse()
}

const tradeDocument: IDocumentRegisterResponse = {
  id: 'document-2',
  name: 'test-document-2',
  ...documentResponse()
}

const presentationDocument: IDocumentRegisterResponse = {
  id: 'document-3',
  name: 'test-document-3',
  ...documentResponse()
}

const sampleRejectLCRequest: IRejectLCRequest = {
  reason: 'whatever'
}

const timerResponse: ITimerResponse = {
  submissionDateTime: new Date(),
  timerData: [
    {
      status: 'pending',
      retry: 0,
      timerId: '1898f14f-4871-40c1-941a-24386d843b20',
      time: new Date()
    }
  ]
}

const id = '123'
const genericError = new Error('test')
let createLCRequest
const jwt: string =
  'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJCZTB6VktGN1BGTGtKTGVHaGNOVzU0ckhUckRBZThkVERqYUJTMjFkMFZjIn0.eyJqdGkiOiJhNTUyM2RhZS0yMDEwLTQyZWEtOTM0Yy1iOGY1Yzg4NjhjZGYiLCJleHAiOjE1NDMzMjcxMjUsIm5iZiI6MCwiaWF0IjoxNTQzMzI2ODI1LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwNzAvYXV0aC9yZWFsbXMvS09NR08iLCJhdWQiOiJ3ZWItYXBwIiwic3ViIjoiN2EyZmQwMzYtNTBlOC00NzA2LTllOWQtMzgyNWVlNjY1YmQ5IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsIm5vbmNlIjoiZTNiNDY5MWQtYTUxMi00YjZhLTg3MDktYzcwZjI4MmUwOGQ5IiwiYXV0aF90aW1lIjoxNTQzMzI2ODI1LCJzZXNzaW9uX3N0YXRlIjoiNzE5NjQxNjUtMjNjZi00MWI4LWE5ZTAtOTdiODY5NjIwZjMxIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMTAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidHJhZGVGaW5hbmNlT2ZmaWNlciIsIm1pZGRsZUFuZEJhY2tPZmZpY2VyIiwidXNlckFkbWluIiwidW1hX2F1dGhvcml6YXRpb24iLCJyZWxhdGlvbnNoaXBNYW5hZ2VyIiwia3ljQW5hbHlzdCIsImNvbXBsaWFuY2VPZmZpY2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJtYW5hZ2UtdXNlcnMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlN1cGVyIFVzZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzdXBlcnVzZXIiLCJnaXZlbl9uYW1lIjoiU3VwZXIiLCJmYW1pbHlfbmFtZSI6IlVzZXIiLCJlbWFpbCI6InN1cGVyQGtvbWdvLmlvIn0.HysQLhMcdockuZ0MuAmqW0L6VpuLy0bdvlHlVEHfsIADDaXKbRVkxe1kx0ezCMwLc6Uvp-ohy-2EyXXNUKhk_uoqqkKnhYLMIRD2cK9yIYvWi_Q1f5uazfBMnp53M8VQWxvzGPtJpAtYHmwKpLb5uK4XoiHpdEH1WnMYrWdM4dpzYcX-jygpnQX4oVgVUswybBwEUTn-OqY8wNNVX2GLbtKxTwi2OjCvPRVs-qZ5KJYpsYOq0Mpm1RrS-4A-CL942Eee5RYPFNvQNuZqcDGb2kNvnCNpC7Z954OgCrJ7m3MCjh2Ndw0K2Hp_D1IFk0O1LPdW-BS4kvgChQwjQEkG7A'
describe('LCController', () => {
  documentClientMock = createMockInstance(DocumentServiceClient)
  documentRequestBuilderMock = createMockInstance(DocumentRequestBuilder)

  beforeEach(() => {
    tradeInstrumentValidationMock.validateById.mockResolvedValue(true)

    controller = new LCController(
      lcDataAgentMock,
      lcUseCaseMock,
      lcRejectUseCaseMock,
      lcIssueUseCaseMock as LCIssueUseCase,
      lcAcknowledgeUseCase,
      lcAdviseUseCase,
      lcRejectBeneficiaryUseCase,
      lcRejectAdvisingUseCase,
      uploaderMock,
      documentClientMock,
      documentRequestBuilderMock,
      documentService,
      lCPresentationServiceMock,
      timerServiceClientMock,
      tradeInstrumentValidationMock,
      applicantId
    )
  })
  describe('Post', () => {
    beforeEach(() => {
      createLCRequest = { ...sampleCreateLCRequest }
    })

    it('should return an LC id if deploying and caching is successful', async () => {
      lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
      const result = await controller.createLC(createLCRequest, jwt)
      expect(lcUseCaseMock.createLC).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ _id: '0x123', reference: '2018-MER-1' })
    })

    it('should throw if txManager throws', async () => {
      lcUseCaseMock.createLC.mockImplementation(() => {
        throw genericError
      })
      lcDataAgentMock.saveLC.mockImplementation(() => id)
      await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 500)
    })

    describe('Validation', () => {
      beforeEach(() => {
        createLCRequest = { ...sampleCreateLCRequest }
      })
      it('should fail if beneficiaryBankRole is not AdvisingBank', async () => {
        createLCRequest.beneficiaryBankRole = 'test'
        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should fail if feesPayableBy is not APPLICANT, BENEFICIARY or SPLIT', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.feesPayableBy = 'APPLICANT'
        await expect(controller.createLC(createLCRequest, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
        createLCRequest.feesPayableBy = 'BENEFICIARY'
        await expect(controller.createLC(createLCRequest, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
        createLCRequest.feesPayableBy = 'SPLIT'
        await expect(controller.createLC(createLCRequest, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
        createLCRequest.feesPayableBy = 'test'
        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should fail if availableBy is not SIGHT_PAYMENT, DEFERRED_PAYMENT, ACCEPTANCE or NEGOTIATION', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.availableBy = 'SIGHT_PAYMENT'
        await expect(controller.createLC(createLCRequest, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
        createLCRequest.availableBy = 'DEFERRED_PAYMENT'
        await expect(controller.createLC(createLCRequest, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
        createLCRequest.availableBy = 'ACCEPTANCE'
        await expect(controller.createLC(createLCRequest, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
        createLCRequest.availableBy = 'test'
        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should fail if billOfLadingEndorsement is not Applicant or IssuingBank', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.billOfLadingEndorsement = 'Applicant'
        await expect(controller.createLC(createLCRequest, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
        createLCRequest.billOfLadingEndorsement = 'IssuingBank'
        await expect(controller.createLC(createLCRequest, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
        createLCRequest.billOfLadingEndorsement = 'test'
        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should fail if templateType is not FREE_TEXT or KOMGO_BFOET', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.templateType = 'FREE_TEXT'
        await expect(controller.createLC(createLCRequest, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
        createLCRequest.templateType = 'KOMGO_BFOET'
        await expect(controller.createLC(createLCRequest, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
        createLCRequest.templateType = 'test'
        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should fail if templateType is KOMGO_BFOET and generatedPDF field is not set', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.templateType = 'KOMGO_BFOET'
        const { generatedPDF, ...createLCRequestWithoutPDF } = createLCRequest

        await expect(controller.createLC(createLCRequestWithoutPDF, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should fail if templateType is KOMGO_BFOET and LOI fields are not set', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.templateType = 'KOMGO_BFOET'
        const { LOI, LOIAllowed, LOIType, ...createLCRequestWithoutLOI } = createLCRequest

        await expect(controller.createLC(createLCRequestWithoutLOI, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should not fail if templateType is FREE_TEXT and LOI fields are not set', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.templateType = 'FREE_TEXT'
        const { LOI, LOIAllowed, LOIType, ...createLCRequestWithoutLOI } = createLCRequest

        await expect(controller.createLC(createLCRequestWithoutLOI, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
      })
      it('should not fail if templateType is FREE_TEXT and invoiceRequirement field is not set', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.templateType = 'FREE_TEXT'
        const { invoiceRequirement, ...createLCRequestWithoutInvoice } = createLCRequest

        await expect(controller.createLC(createLCRequestWithoutInvoice, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
      })
      it('should fail if templateType is KOMGO_BFOET and invoiceRequirement field is not set', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.templateType = 'KOMGO_BFOET'
        const { invoiceRequirement, ...createLCRequestWithoutInvoiceRequirement } = createLCRequest

        await expect(controller.createLC(createLCRequestWithoutInvoiceRequirement, jwt)).rejects.toHaveProperty(
          'status',
          400
        )
      })
      it('should fail if templateType is KOMGO_BFOET and invoiceRequirement field is set to something wrong', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.templateType = 'KOMGO_BFOET'
        createLCRequest.invoiceRequirement = 'WRONG'

        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should not fail if templateType is FREE_TEXT and freeTextLc field is not set', async () => {
        lcUseCaseMock.createLC.mockImplementation(() => ['0x123', '2018-MER-1'])
        createLCRequest.templateType = 'FREE_TEXT'
        const { freeTextLc, ...createLCRequestWithoutFreeTextLC } = createLCRequest

        await expect(controller.createLC(createLCRequestWithoutFreeTextLC, jwt)).resolves.toEqual({
          _id: '0x123',
          reference: '2018-MER-1'
        })
      })
      it('issueDueDate validate conditional required on unit', async () => {
        createLCRequest.issueDueDateDuration = 2
        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('issueDueDate validate conditional required on duration', async () => {
        createLCRequest.issueDueDateUnit = 'WEEKS'
        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should fail if issueDueDate is out of range - max value', async () => {
        createLCRequest.issueDueDateDuration = 2
        createLCRequest.issueDueDateUnit = 'WEEKS'
        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should fail if issueDueDate is out of range - min value', async () => {
        createLCRequest.issueDueDateDuration = 59
        createLCRequest.issueDueDateUnit = 'MINUTES'

        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
      })
      it('should fail if issueDueDate unit enum failed', async () => {
        lcUseCaseMock.createLC.mockClear()
        createLCRequest.issueDueDateDuration = 2
        createLCRequest.issueDueDateUnit = 'TEST'
        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 400)
        expect(lcUseCaseMock.createLC).not.toBeCalled()
      })
      it('should fail if active financial instrument exists', async () => {
        lcUseCaseMock.createLC.mockClear()
        tradeInstrumentValidationMock.validateById.mockResolvedValueOnce(false)
        await expect(controller.createLC(createLCRequest, jwt)).rejects.toHaveProperty('status', 409)
        expect(lcUseCaseMock.createLC).not.toBeCalled()
      })
    })
  })
  describe('Get', () => {
    it('should return an LC if fetching from cache is successful', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return {
          _id: '123',
          reference: '2018-BP-16',
          status: LC_STATE.REQUESTED,
          issueDueDate: {
            timerStaticId: 'timerStaticId'
          }
        }
      })
      lCPresentationServiceMock.getPresentationsByLcReference.mockImplementation(() => {
        return [
          {
            LCReference: '2018-BP-16'
          }
        ]
      })
      timerServiceClientMock.fetchTimer.mockImplementation(() => {
        return timerResponse
      })

      const result = await controller.getLC('123')
      expect(result).toEqual({
        _id: '123',
        reference: '2018-BP-16',
        status: LC_STATE.REQUESTED,
        issueDueDate: {
          timerStaticId: 'timerStaticId'
        },
        presentations: [{ LCReference: '2018-BP-16' }],
        timer: timerResponse
      })
    })
    it('should throw if data agent throws', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        throw genericError
      })
      await expect(controller.getLC('123')).rejects.toBeInstanceOf(HttpException)
    })
  })

  describe('find', () => {
    it('returns all', async () => {
      lcDataAgentMock.getLCs.mockImplementation(() => {
        return [sampleLC]
      })
      lcDataAgentMock.count.mockImplementation(() => {
        return 1
      })
      // const url = request.protocol + '://' + request.get('host') + request.originalUrl;
      const req = new MockExpressRequest({
        method: 'GET',
        orginalUrl: '/lc'
      })

      const result = await controller.getLCs(undefined, req)

      expect(result).toEqual({
        items: [sampleLC],
        limit: 200,
        skip: 0,
        total: 1
      })
    })

    it('returns the matching results', async () => {
      lcDataAgentMock.getLCs.mockImplementation(() => {
        return [sampleLC]
      })
      const filter = {
        query: { 'tradeAndCargoSnapshot.trade._id': { $in: [123] } },
        projection: { status: 1, _id: 1, 'tradeAndCargoSnapshot.trade._id': 1 },
        options: { sort: { updateAt: -1 }, limit: 100, skip: 0 }
      }
      const query = stringify({ filter })

      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/lc?${query}`
      })

      const result = await controller.getLCs(query, req)

      expect(result).toEqual({
        items: [sampleLC],
        limit: 100,
        skip: 0,
        total: 1
      })
      expect(lcDataAgentMock.getLCs).toBeCalledWith(filter.query, filter.projection, {
        ...filter.options
      })
    })

    it('returns lc with matching timer', async () => {
      lcDataAgentMock.getLCs.mockImplementation(() => {
        return [
          {
            ...sampleLC,
            issueDueDate: {
              timerStaticId: 'timerStaticId'
            },
            status: LC_STATE.REQUESTED
          }
        ]
      })
      timerServiceClientMock.fetchTimer.mockImplementation(() => {
        return timerResponse
      })

      const req = new MockExpressRequest({
        method: 'GET',
        orginalUrl: '/lc'
      })

      const result = await controller.getLCs(undefined, req)
      expect(result).toEqual({
        items: [
          {
            ...sampleLC,
            issueDueDate: {
              timerStaticId: 'timerStaticId'
            },
            status: LC_STATE.REQUESTED,
            timer: timerResponse
          }
        ],
        limit: 200,
        skip: 0,
        total: 1
      })
    })

    it('returns matching results (with sort)', async () => {
      lcDataAgentMock.getLCs.mockImplementation(() => {
        return [sampleLC]
      })
      const options = { sort: { updateAt: -1 }, limit: 100, skip: 0 }
      const filter = {
        query: {},
        projection: undefined,
        options
      }

      const query = stringify({ filter })
      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/lc?${query}`
      })

      const result = await controller.getLCs(query, req)

      expect(result).toEqual({
        items: [sampleLC],
        limit: 100,
        skip: 0,
        total: 1
      })
      expect(lcDataAgentMock.getLCs).toBeCalledWith(filter.query, filter.projection, {
        ...options
      })
    })

    it('accepts query with most than 20 elements', async () => {
      lcDataAgentMock.getLCs.mockImplementation(() => {
        return [sampleLC]
      })
      const options = { sort: { updateAt: -1 }, limit: 100, skip: 0 }
      const filter = {
        query: { 'tradeAndCargoSnapshot.trade._id': { $in: Array.from({ length: 30 }).map((k, v) => v) } },
        projection: undefined,
        options
      }

      const query = stringify({ filter })
      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/lc?${query}`
      })

      const result = await controller.getLCs(query, req)

      expect(result).toEqual({
        items: [sampleLC],
        limit: 100,
        skip: 0,
        total: 1
      })
      expect(lcDataAgentMock.getLCs).toBeCalledWith(filter.query, filter.projection, {
        ...options
      })
    })

    it('accepts base64 encoded queries', async () => {
      lcDataAgentMock.getLCs.mockImplementation(() => {
        return [sampleLC]
      })
      timerServiceClientMock.fetchTimer.mockImplementation(() => {
        return timerResponse
      })
      const options = { sort: { updateAt: -1 }, limit: 100, skip: 0 }
      const filter = {
        query: { 'tradeAndCargoSnapshot.trade._id': { $in: Array.from({ length: 30 }).map((k, v) => v) } },
        projection: undefined,
        options
      }

      const query = compressToBase64(stringify(filter))
      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/lc?${query}`
      })

      const result = await controller.getLCs(query, req)

      expect(result).toEqual({
        items: [sampleLC],
        limit: 200,
        skip: 0,
        total: 1
      })
      expect(lcDataAgentMock.getLCs).toBeCalledWith(filter.query, filter.projection, {
        ...options
      })
    })

    it('should test pagination', async () => {
      lcDataAgentMock.getLCs.mockImplementation(() => {
        return [sampleLC, sampleLC, sampleLC]
      })
      lcDataAgentMock.count.mockImplementation(() => {
        return 3
      })
      timerServiceClientMock.fetchTimer.mockImplementation(() => {
        return timerResponse
      })
      const options = {
        sort: {},
        limit: 3,
        skip: 0
      }
      const filter = {
        query: {},
        projection: undefined,
        options
      }

      const query = stringify({ filter })
      const req = new MockExpressRequest({
        method: 'GET',
        originalUrl: `/lc?${query}`
      })

      const result = await controller.getLCs(query, req)

      expect(result).toEqual({
        items: [sampleLC, sampleLC, sampleLC],
        limit: 3,
        skip: 0,
        total: 3
      })

      expect(lcDataAgentMock.getLCs).toBeCalledWith(filter.query, filter.projection, {
        ...options
      })
    })

    it('should throw if data agent throws', async () => {
      lcDataAgentMock.getLCs.mockImplementation(() => {
        throw genericError
      })

      const req = new MockExpressRequest({
        method: 'GET',
        url: '/lc'
      })

      await expect(controller.getLCs(undefined, req)).rejects.toBeInstanceOf(HttpException)
    })
  })

  describe('Reject LC', () => {
    it('should call reject', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lcRejectUseCaseMock.rejectLC.mockImplementation(() => '0x123')

      const result = await controller.requestReject('1', { reason: 'some' })

      expect(result).toEqual('0x123')
    })

    it('should fail it no LC', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return null
      })

      const lcid = '1'
      await expect(controller.requestReject(lcid, sampleRejectLCRequest)).rejects.toBeInstanceOf(HttpException)
    })
  })

  describe('Get LC documents', () => {
    it('should return LC documents', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lCPresentationServiceMock.getPresentationsByLcReference.mockImplementation(() => {
        return [
          {
            _id: 1,
            LCReference: 'LCReference'
          }
        ]
      })

      documentClientMock.getDocuments = jest.fn().mockImplementation(() => {
        return [lcDocument]
      })
      documentRequestBuilderMock.getLCDocumentSearchContext = jest.fn().mockImplementation(() => {
        return {
          lcid: '1'
        }
      })

      const result = await controller.getLCDocuments('1')
      expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', { lcid: '1' })
      expect(result).toEqual([lcDocument])
    })

    it('should return lc and trade documents', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return {
          ...sampleLC,
          tradeAndCargoSnapshot: {
            trade: {
              vaktId: 'vakt-id'
            }
          }
        }
      })

      documentClientMock.getDocuments = jest
        .fn()
        .mockResolvedValueOnce([lcDocument])
        .mockResolvedValueOnce([tradeDocument])
      documentRequestBuilderMock.getLCDocumentSearchContext = jest.fn().mockImplementation(() => {
        return {
          lcid: '1'
        }
      })
      documentRequestBuilderMock.getTradeDocumentSearchContext = jest.fn().mockImplementation(() => {
        return {
          vaktId: 'vakt-id'
        }
      })

      lCPresentationServiceMock.getPresentationsByLcReference.mockImplementation(() => {
        return [
          {
            _id: 1,
            LCReference: 'LCReference',
            reference: 'reference',
            status: LCPresentationStatus.DocumentsAcceptedByApplicant
          }
        ]
      })

      const result = await controller.getLCDocuments('1')
      expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', { lcid: '1' })
      expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', { vaktId: 'vakt-id' })
      expect(result).toEqual([lcDocument, tradeDocument])
    })

    it('should return trade documents', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return {
          ...sampleLC,
          tradeAndCargoSnapshot: {
            trade: {
              vaktId: 'vakt-id'
            }
          }
        }
      })

      documentClientMock.getDocuments = jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce([tradeDocument])

      documentRequestBuilderMock.getLCDocumentSearchContext = jest.fn().mockImplementation(() => {
        return {
          lcid: '1'
        }
      })
      documentRequestBuilderMock.getTradeDocumentSearchContext = jest.fn().mockImplementation(() => {
        return {
          vaktId: 'vakt-id'
        }
      })

      const result = await controller.getLCDocuments('1')
      expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', { lcid: '1' })
      expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', { vaktId: 'vakt-id' })
      expect(result).toEqual([tradeDocument])
    })

    it('should return LC and presentation documents', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lCPresentationServiceMock.getPresentationsByLcReference.mockImplementation(() => {
        return [
          {
            _id: 1,
            LCReference: 'LCReference',
            reference: 'reference',
            applicantId,
            status: LCPresentationStatus.DocumentsAcceptedByApplicant
          }
        ]
      })

      documentClientMock.getDocuments = jest
        .fn()
        .mockResolvedValueOnce([presentationDocument])
        .mockResolvedValueOnce([lcDocument])
      documentRequestBuilderMock.getLCDocumentSearchContext = jest.fn().mockImplementation(() => {
        return {
          lcid: '1'
        }
      })

      documentRequestBuilderMock.getPresentationDocumentSearchContext = jest.fn().mockImplementation(() => {
        return {
          presentationId: '1'
        }
      })

      const result = await controller.getLCDocuments('1')
      expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', { presentationId: '1' })
      expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', { lcid: '1' })
      expect(result).toEqual([lcDocument, presentationDocument])
    })

    it('should fail it no LC', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return null
      })

      const lcid = '1'
      await expect(controller.getLCDocuments(lcid)).rejects.toBeInstanceOf(HttpException)
    })
  })

  describe('Reject advising LC', () => {
    it('should call reject', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lcRejectAdvisingUseCase.rejectAdvisingLC.mockImplementation(() => '0x123')

      const result = await controller.rejectAdvising('1', { reason: 'some' })

      expect(result).toEqual('0x123')
    })

    it('should be rejectAdvisin throw error', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lcRejectAdvisingUseCase.rejectAdvisingLC.mockImplementation(() => {
        throw Error(`Action not allowed for direct LC`)
      })

      const result = controller.rejectAdvising('1', { reason: 'some' })

      await expect(result).rejects.toBeInstanceOf(HttpException)
    })

    it('should call rejectBeneficiary', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lcRejectBeneficiaryUseCase.rejectBeneficiaryLC.mockImplementation(() => '0x123')

      const result = await controller.rejectBeneficiary('1', { reason: 'some' })

      expect(result).toEqual('0x123')
    })

    it('should rejectBeneficiaryLC throw error', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lcRejectBeneficiaryUseCase.rejectBeneficiaryLC.mockImplementation(() => {
        throw Error(`Action not allowed for direct LC`)
      })

      const result = controller.rejectBeneficiary('1', { reason: 'some' })

      await expect(result).rejects.toBeInstanceOf(HttpException)
    })

    it('should call acknowledge', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lcAcknowledgeUseCase.acknowledgeLC.mockImplementation(() => '0x123')

      const result = await controller.acknowledge('1')

      expect(result).toEqual('0x123')
    })

    it('should acknowledge throw error', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lcAcknowledgeUseCase.acknowledgeLC.mockImplementation(() => {
        throw Error(`Action not allowed for direct LC`)
      })

      const result = controller.acknowledge('1')

      await expect(result).rejects.toBeInstanceOf(HttpException)
    })

    it('should call advise', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lcAdviseUseCase.adviseLC.mockImplementation(() => '0x123')

      const result = await controller.advise('1')

      expect(result).toEqual('0x123')
    })

    it('should advise throw error', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return sampleLC
      })

      lcAdviseUseCase.adviseLC.mockImplementation(() => {
        throw Error(`Action not allowed for direct LC`)
      })

      const result = controller.advise('1')

      await expect(result).rejects.toBeInstanceOf(HttpException)
    })

    it('should fail it no LC', async () => {
      lcDataAgentMock.getLC.mockImplementation(() => {
        return null
      })

      const lcid = '1'
      await expect(controller.rejectAdvising(lcid, { reason: 'some' })).rejects.toBeInstanceOf(HttpException)
    })
  })

  describe('Documents', () => {
    it('should get document', async () => {
      documentClientMock.getDocumentById = jest.fn(() => ({ id: '1' }))
      const result = await controller.getLCDocument('1')

      expect(result).toEqual({ id: '1' })
    })

    it('should throw error if document not found', async () => {
      documentClientMock.getDocumentById = jest.fn(() => null)
      const result = controller.getLCDocument('1')

      expect(result).rejects.toMatchObject({ status: 404 })
    })

    it('should get document content', async () => {
      const fileContentResponse = { data: Buffer.from([0]), headers: {} }

      documentClientMock.getDocumentContent = jest.fn(() => fileContentResponse)
      const request = new MockExpressRequest({
        method: 'GET',
        url: '/lc/documents/1/content/',
        headers: {
          Accept: '*'
        }
      })

      request.res = {
        set: jest.fn(),
        write: jest.fn()
      }

      const result = await controller.getLCDocumentContent(request, '1')
      expect(request.res.write).toHaveBeenCalledWith(fileContentResponse.data)
    })
    it('should return not found document', async () => {
      const fileContentResponse = { data: Buffer.from([0]), headers: {}, status: 404 }

      documentClientMock.getDocumentContent = jest.fn(() => fileContentResponse)
      const request = new MockExpressRequest({
        method: 'GET',
        url: '/lc/documents/1/content/',
        headers: {
          Accept: '*'
        }
      })

      request.res = {
        set: jest.fn(),
        write: jest.fn()
      }

      await expect(controller.getLCDocumentContent(request, '1')).rejects.toHaveProperty('status', 404)
    })
  })
  it('should return internal error from document client', async () => {
    documentClientMock.getDocumentContent = jest.fn(() => {
      throw new Error()
    })
    const request = new MockExpressRequest({
      method: 'GET',
      url: '/lc/documents/1/content/',
      headers: {
        Accept: '*'
      }
    })

    request.res = {
      set: jest.fn(),
      write: jest.fn()
    }
    const reply = controller.getLCDocumentContent(request, '1')
    await expect(reply).rejects.toBeInstanceOf(HttpException)
  })
})
