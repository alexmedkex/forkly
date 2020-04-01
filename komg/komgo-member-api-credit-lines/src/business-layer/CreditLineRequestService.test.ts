import { ErrorCode } from '@komgo/error-utilities'
import { TaskManager, TaskStatus } from '@komgo/notification-publisher'
import { IProductContext, CreditLineRequestType, CreditLineRequestStatus } from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import CreditLineDataAgent from '../data-layer/data-agents/CreditLineDataAgent'
import CreditLineRequestDataAgent from '../data-layer/data-agents/CreditLineRequestDataAgent'
import SharedCreditLineDataAgent from '../data-layer/data-agents/SharedCreditLineDataAgent'

import { CreditLineRequestService } from './CreditLineRequestService'
import { CreditLineValidationService } from './CreditLineValidationService'
import { RequestClient } from './messaging/RequestClient'
import { CreditLineRequestTaskFactory } from './tasks/CreditLineRequestTaskFactory'
import { buildFakeCreditLineRequest } from './testUtils'
import { CompanyClient } from './clients/CompanyClient'
import { CreditLineRequestTaskType } from './tasks/CreditLineRequestTaskType'
import { MessageType } from './messaging/MessageTypes'
import { NotificationClient } from './notifications/notifications/NotificationClient'
import { NotificationFactory } from './notifications'
import { CONFIG } from '../inversify/config'

describe('CreditLineRequestService', () => {
  let creditLineRequestService: CreditLineRequestService
  const mockCreditLineRequestDataAgent = createMockInstance(CreditLineRequestDataAgent)
  const mockSharedCreditLineDataAgent = createMockInstance(SharedCreditLineDataAgent)
  const mockCreditLineDataAgent = createMockInstance(CreditLineDataAgent)
  const mockRequestClient = createMockInstance(RequestClient)
  const mockValidationService = createMockInstance(CreditLineValidationService)
  const mockTaskManager = createMockInstance(TaskManager)
  const companyClient = createMockInstance(CompanyClient)
  const mockCreditLineRequestTaskFactory = new CreditLineRequestTaskFactory(companyClient, CONFIG.KapsuleUrl)
  const mockNotificationClient = createMockInstance(NotificationClient)
  const mockCompanyClient = createMockInstance(CompanyClient)

  const companyStaticId = 'companyStaticId'
  const counterpartyStaticId = 'counterpartyStaticId'
  const context: IProductContext = { productId: 'tradeFinance', subProductId: 'rd' }

  const request = buildFakeCreditLineRequest()
  const currentCompanyStaticId = 'company-id'

  beforeEach(() => {
    jest.resetAllMocks()
    mockCreditLineRequestDataAgent.find.mockResolvedValue([])
    mockCreditLineRequestDataAgent.update.mockReset()

    creditLineRequestService = new CreditLineRequestService(
      mockCreditLineRequestDataAgent,
      mockSharedCreditLineDataAgent,
      mockCreditLineDataAgent,
      mockRequestClient,
      mockValidationService,
      mockCreditLineRequestTaskFactory,
      mockTaskManager,
      mockNotificationClient,
      mockCompanyClient,
      currentCompanyStaticId,
      new NotificationFactory()
    )
  })

  describe('.create', () => {
    it('should successfully create credit line request', async () => {
      mockCreditLineRequestDataAgent.create.mockImplementation(() => Promise.resolve('id'))

      await creditLineRequestService.create({
        context: {
          productId: 'productId',
          subProductId: 'subProductId'
        },
        comment: 'comment',
        counterpartyStaticId: 'counterpartyStaticId',
        companyIds: ['company-id-1']
      })

      expect(mockRequestClient.sendCommonRequest).toHaveBeenCalled()
    })

    it('should failed to create credit line request', async () => {
      mockCreditLineRequestDataAgent.create.mockRejectedValueOnce(new Error('error'))

      const result = creditLineRequestService.create({
        context: {
          productId: 'productId',
          subProductId: 'subProductId'
        },
        comment: 'comment',
        counterpartyStaticId: 'counterpartyStaticId',
        companyIds: ['company-id-1', 'company-id-2']
      })

      await expect(result).rejects.toEqual(new Error('error'))
    })

    // NOTE: disaplbed validation unitl ui for displaying request is added (if chosed to be)

    // it('should failed to existing credit line request', async () => {
    //   mockCreditLineRequestDataAgent.find.mockResolvedValue([
    //     {
    //       companyStaticId: 'company-id-1'
    //     } as any
    //   ])

    //   const result = creditLineRequestService.create({
    //     context: {
    //       productId: 'productId',
    //       subProductId: 'subProductId'
    //     },
    //     comment: 'comment',
    //     counterpartyStaticId: 'counterpartyStaticId',
    //     companyIds: ['company-id-1', 'company-id-2']
    //   })

    //   await expect(result).rejects.toMatchObject({
    //     message: 'Credit line request for company already exists.',
    //     errorCode: ErrorCode.DatabaseInvalidData
    //   })
    // })
  })

  describe('.getPendingRequest', () => {
    it('should fetch pending requests', async () => {
      mockCreditLineRequestDataAgent.findForCompaniesAndContext.mockResolvedValueOnce([request])

      const response = await creditLineRequestService.getPendingRequest(companyStaticId, counterpartyStaticId, context)
      expect(response.staticId).toBe(request.staticId)
      expect(mockCreditLineRequestDataAgent.findForCompaniesAndContext).toHaveBeenCalledWith(
        context,
        companyStaticId,
        counterpartyStaticId,
        {
          requestType: CreditLineRequestType.Received,
          status: CreditLineRequestStatus.Pending
        }
      )
    })

    it('should return null if no pending requests', async () => {
      mockCreditLineRequestDataAgent.findForCompaniesAndContext.mockResolvedValueOnce([])

      const result = await creditLineRequestService.getPendingRequest(companyStaticId, counterpartyStaticId, context)
      expect(result).toBeNull()
    })
  })

  describe('process received request', () => {
    it('should process received request', async () => {
      mockValidationService.validateCreditLineCounterparty.mockResolvedValueOnce({
        staticId: request.counterpartyStaticId,
        x500Name: { CN: '-Counterparty-' }
      } as any)
      mockValidationService.validateNonFinanceInstitution.mockResolvedValueOnce({
        staticId: request.companyStaticId,
        x500Name: { CN: '-Requester-' }
      } as any)

      // no pending requests
      mockCreditLineRequestDataAgent.findForCompaniesAndContext.mockResolvedValueOnce([])

      await creditLineRequestService.requestReceived(request)

      expect(mockCreditLineRequestDataAgent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          counterpartyStaticId: request.counterpartyStaticId,
          companyStaticId: request.companyStaticId,
          context: request.context,
          requestType: CreditLineRequestType.Received,
          status: CreditLineRequestStatus.Pending
        })
      )

      expect(mockTaskManager.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            companyStaticId: request.companyStaticId,
            counterpartyStaticId: request.counterpartyStaticId,
            ...request.context
          }),
          counterpartyStaticId: request.companyStaticId,
          summary: 'Review request for risk cover information from -Requester- on -Counterparty-',
          taskType: CreditLineRequestTaskType.ReviewCLR
        }),
        expect.anything()
      )
    })
  })

  describe('markCompleted', () => {
    it('should complete request', async () => {
      await creditLineRequestService.markCompleted(request)

      expect(mockCreditLineRequestDataAgent.update).toHaveBeenCalledWith(
        expect.objectContaining({ staticId: request.staticId, status: CreditLineRequestStatus.Disclosed })
      )

      expect(mockTaskManager.updateTaskStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TaskStatus.Done,
          taskType: CreditLineRequestTaskType.ReviewCLR,
          context: expect.objectContaining({
            companyStaticId: request.companyStaticId,
            counterpartyStaticId: request.counterpartyStaticId,
            ...request.context
          })
        })
      )
    })
  })

  describe('closeAllPendingRequests', () => {
    it('should skip if no pending requests', async () => {
      mockCreditLineRequestDataAgent.findForCompaniesAndContext.mockResolvedValueOnce([])
      const result = await creditLineRequestService.closeAllPendingRequests('companyId', context, [])

      expect(mockCreditLineRequestDataAgent.update).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('should close pending requests', async () => {
      mockCreditLineRequestDataAgent.findForCompaniesAndContext.mockResolvedValueOnce([request])
      const result = await creditLineRequestService.closeAllPendingRequests('companyId', context, [])

      expect(mockCreditLineRequestDataAgent.update).toHaveBeenCalledWith(
        expect.objectContaining({ staticId: request.staticId, status: CreditLineRequestStatus.Declined })
      )

      expect(mockTaskManager.updateTaskStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TaskStatus.Done,
          outcome: false,
          taskType: CreditLineRequestTaskType.ReviewCLR,
          context: expect.objectContaining({
            companyStaticId: request.companyStaticId,
            counterpartyStaticId: request.counterpartyStaticId,
            ...request.context
          })
        })
      )

      expect(mockRequestClient.sendCommonRequest).toHaveBeenCalledWith(
        MessageType.CreditLineRequestDeclined,
        request.companyStaticId,
        expect.objectContaining({
          context: request.context,
          messageType: MessageType.CreditLineRequestDeclined,
          companyStaticId: currentCompanyStaticId,
          counterpartyStaticId: request.counterpartyStaticId,
          recepientStaticId: request.companyStaticId
        })
      )
    })
  })
})
