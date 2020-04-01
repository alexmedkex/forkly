import { TaskManager, TaskStatus, ITask } from '@komgo/notification-publisher'
import {
  IProductContext,
  CreditLineRequestType,
  CreditLineRequestStatus,
  DepositLoanType,
  Currency,
  DepositLoanPeriod,
  ISharedDepositLoan,
  DepositLoanRequestType,
  DepositLoanRequestStatus,
  IDepositLoanRequest
} from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { DepositLoanRequestService, IDepositLoanRequestService } from './DepositLoanRequestService'
import DepositLoanRequestDataAgent from '../../data-layer/data-agents/DepositLoanRequestDataAgent'
import { NotificationClient } from '../notifications/notifications/NotificationClient'
import { CompanyClient } from '../clients/CompanyClient'
import { DepositLoanNotificationFactory } from '../notifications/DepositLoanNotificationFactory'
import { RequestClient } from '../messaging/RequestClient'
import { CreditLineValidationService } from '../CreditLineValidationService'
import DepositLoanDataAgent from '../../data-layer/data-agents/DepositLoanDataAgent'
import SharedDepositLoanDataAgent from '../../data-layer/data-agents/SharedDepositLoanDataAgent'
import { CreditLineRequestTaskFactory } from '../tasks/CreditLineRequestTaskFactory'
import { CONFIG } from '../../inversify/config'
import { IDepositLoanRequestDocument } from '../../data-layer/models/IDepositLoanRequestDocument'
import { ICompany } from '../clients/ICompany'

describe('DepositLoanRequestService', () => {
  let depositLoanRequestService: IDepositLoanRequestService
  const mockDepositLoanRequestDataAgent = createMockInstance(DepositLoanRequestDataAgent)
  const mockTaskManager = createMockInstance(TaskManager)
  const mockNotificationClient = createMockInstance(NotificationClient)
  const mockCompanyClient = createMockInstance(CompanyClient)
  const mockRequestClient = createMockInstance(RequestClient)
  const mockValidationService = createMockInstance(CreditLineValidationService)
  const mockDepositLoanDataAgent = createMockInstance(DepositLoanDataAgent)
  const mockSharedDepositLoanDataAgent = createMockInstance(SharedDepositLoanDataAgent)
  const mockCreditLineRequestTaskFactory = new CreditLineRequestTaskFactory(mockCompanyClient, CONFIG.KapsuleUrl)

  const companyStaticId = 'companyStaticId'

  const sharedDepositLoan: ISharedDepositLoan = {
    depositLoanStaticId: 'depositLoanStaticId',
    appetite: {
      shared: true
    },
    createdAt: '2019-07-16',
    pricing: {
      pricing: 10,
      shared: true
    },
    sharedWithStaticId: 'sharedWithStaticId',
    staticId: 'staticId',
    updatedAt: '2019-07-16'
  }

  const depositLoanRequest: IDepositLoanRequest = {
    comment: 'comment',
    companyStaticId,
    createdAt: '2019-07-16',
    currency: Currency.AED,
    period: DepositLoanPeriod.Days,
    periodDuration: 3,
    requestType: DepositLoanRequestType.Received,
    staticId: 'staticId',
    status: DepositLoanRequestStatus.Pending,
    type: DepositLoanType.Deposit,
    updatedAt: '2019-07-16'
  }

  const depositLoanRequestDocument: IDepositLoanRequestDocument = {
    comment: 'comment',
    companyStaticId,
    createdAt: new Date(),
    currency: Currency.AED,
    period: DepositLoanPeriod.Days,
    periodDuration: 3,
    requestType: DepositLoanRequestType.Received,
    staticId: 'staticId',
    status: DepositLoanRequestStatus.Pending,
    type: DepositLoanType.Deposit,
    updatedAt: new Date()
  }

  const task: ITask = {
    _id: '_id',
    summary: 'summary',
    taskType: 'taskType',
    status: TaskStatus.ToDo,
    assignee: null,
    requiredPermission: {
      actionId: 'actionId',
      productId: 'productId'
    },
    context: {},
    updatedAt: new Date(),
    createdAt: new Date()
  }

  const company: ICompany = {
    hasSWIFTKey: true,
    isFinancialInstitution: false,
    isMember: true,
    komgoMnid: 'komgoMnid',
    staticId: 'staticId',
    x500Name: {
      C: 'C',
      CN: 'CN',
      L: 'L',
      O: 'O',
      PC: 'PC',
      STREET: 'STREET'
    }
  }

  beforeEach(() => {
    jest.resetAllMocks()
    mockDepositLoanRequestDataAgent.find.mockResolvedValue([])
    mockDepositLoanRequestDataAgent.update.mockReset()
    mockDepositLoanRequestDataAgent.create.mockReset()
    mockDepositLoanRequestDataAgent.findForCompaniesAndType.mockReset()

    depositLoanRequestService = new DepositLoanRequestService(
      mockDepositLoanRequestDataAgent,
      mockTaskManager,
      mockNotificationClient,
      mockCompanyClient,
      companyStaticId,
      new DepositLoanNotificationFactory(),
      mockRequestClient,
      mockValidationService,
      mockDepositLoanDataAgent,
      mockSharedDepositLoanDataAgent,
      mockCreditLineRequestTaskFactory
    )
  })

  describe('.create', () => {
    it('should successfully create deposit / loan request', async () => {
      mockDepositLoanRequestDataAgent.create.mockImplementation(() => Promise.resolve('id'))

      await depositLoanRequestService.create(DepositLoanType.Deposit, {
        comment: 'comment',
        companyIds: ['id1', 'id2'],
        currency: Currency.AED,
        period: DepositLoanPeriod.Days,
        periodDuration: 3,
        type: DepositLoanType.Deposit
      })

      expect(mockRequestClient.sendCommonRequest).toHaveBeenCalled()
    })

    it('should successfully create deposit / loan request - periodDuration missing', async () => {
      mockDepositLoanRequestDataAgent.create.mockImplementation(() => Promise.resolve('id'))

      await depositLoanRequestService.create(DepositLoanType.Deposit, {
        comment: 'comment',
        companyIds: ['id3'],
        currency: Currency.AED,
        period: DepositLoanPeriod.Days,
        type: DepositLoanType.Deposit
      })

      expect(mockDepositLoanRequestDataAgent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: 'comment',
          companyStaticId: 'id3',
          currency: Currency.AED,
          period: DepositLoanPeriod.Days,
          type: DepositLoanType.Deposit,
          requestType: DepositLoanRequestType.Requested,
          staticId: undefined,
          status: DepositLoanRequestStatus.Pending,
          updatedAt: undefined,
          createdAt: undefined
        })
      )
      expect(mockRequestClient.sendCommonRequest).toHaveBeenCalled()
    })

    it('should failed create deposit / loan request', async () => {
      mockDepositLoanRequestDataAgent.create.mockRejectedValueOnce(new Error('error'))

      const result = depositLoanRequestService.create(DepositLoanType.Deposit, {
        comment: 'comment',
        companyIds: ['id1', 'id2'],
        currency: Currency.AED,
        period: DepositLoanPeriod.Days,
        periodDuration: 3,
        type: DepositLoanType.Deposit
      })

      await expect(result).rejects.toEqual(new Error('error'))
    })
  })

  describe('.getPendingRequest', () => {
    it('should successfully get all peding requests for deposit / loan - return null', async () => {
      mockDepositLoanRequestDataAgent.findForCompaniesAndType.mockImplementation(() => Promise.resolve([]))
      const result = await depositLoanRequestService.getPendingRequest(
        DepositLoanType.Deposit,
        companyStaticId,
        Currency.AED,
        DepositLoanPeriod.Days,
        3
      )
      expect(result).toBeNull()
    })

    it('should successfully get all peding requests for deposit / loan', async () => {
      mockDepositLoanRequestDataAgent.findForCompaniesAndType.mockImplementation(() =>
        Promise.resolve([depositLoanRequestDocument])
      )
      const result = await depositLoanRequestService.getPendingRequest(
        DepositLoanType.Deposit,
        companyStaticId,
        Currency.AED,
        DepositLoanPeriod.Days,
        3
      )
      expect(result).toMatchObject({
        comment: 'comment',
        companyStaticId,
        currency: Currency.AED,
        period: DepositLoanPeriod.Days,
        periodDuration: 3,
        requestType: DepositLoanRequestType.Received,
        staticId: 'staticId',
        status: DepositLoanRequestStatus.Pending,
        type: DepositLoanType.Deposit
      })
    })

    it('should failed to get all peding requests for deposit / loan', async () => {
      mockDepositLoanRequestDataAgent.findForCompaniesAndType.mockRejectedValueOnce(new Error('error'))
      const result = depositLoanRequestService.getPendingRequest(
        DepositLoanType.Deposit,
        companyStaticId,
        Currency.AED,
        DepositLoanPeriod.Days,
        3
      )

      await expect(result).rejects.toEqual(new Error('error'))
    })
  })

  describe('.markCompleted', () => {
    it('should successfully mark to completed', async () => {
      mockTaskManager.updateTaskStatus.mockImplementation(() => Promise.resolve(task))
      mockDepositLoanRequestDataAgent.update.mockImplementation(() => Promise.resolve(depositLoanRequestDocument))

      await expect(depositLoanRequestService.markCompleted(depositLoanRequest)).toBeTruthy()
    })
  })

  describe('.requestReceived', () => {
    it('should successfully process received request - existing', async () => {
      mockValidationService.validateNonFinanceInstitution.mockImplementation(() => Promise.resolve(company))
      mockDepositLoanRequestDataAgent.update.mockImplementation(() => Promise.resolve(depositLoanRequestDocument))
      mockDepositLoanRequestDataAgent.findForCompaniesAndType.mockImplementation(() =>
        Promise.resolve([depositLoanRequestDocument])
      )

      const result = await depositLoanRequestService.requestReceived(depositLoanRequest)

      expect(result).toBeTruthy()
      expect(mockDepositLoanRequestDataAgent.update).toHaveBeenCalled()
    })
  })
})
