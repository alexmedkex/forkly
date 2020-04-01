// tslint:disable-next-line:no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  metric: jest.fn()
}
const getLoggerMock = jest.fn(() => loggerMock)
jest.mock('@komgo/logging', () => ({
  getLogger: getLoggerMock
}))

import { ICounterparty } from '../../service-layer/responses/ICounterparty'
import { ICoverageCompany } from '../registry/ICompany'

import { ICompanyCoverageDocument } from '../../data-layer/models/ICompanyCoverageDocument'
import { STATUSES } from '../../data-layer/constants/Status'
import { RequestClient } from '../messaging/RequestClient'
import { MESSAGE_TYPE } from '../messaging/MessageTypes'

let companyClient: jest.Mocked<ICompanyClient>
let companyCoverageDataAgent: jest.Mocked<ICompanyCoverageDataAgent>
let counterpartyService: CounterpartyService
let requestClient: jest.Mocked<RequestClient>
let notificationClient: jest.Mocked<NotificationManager>
let taskManager: any

requestClient = createMockInstance(RequestClient)

import { ICompanyClient } from '../registry/ICompanyClient'
import { ICompanyCoverageDataAgent } from '../../data-layer/data-agents/ICompanyCoverageDataAgent'
import CounterpartyService from './CounterpartyService'
import { CompanyCoverageDataAgent } from '../../data-layer/data-agents/CompanyCoverageDataAgent'
import CounterpartyProfileDataAgent from '../../data-layer/data-agents/CounterpartyProfileDataAgent'
import { ICounterpartyProfileDataAgent } from '../../data-layer/data-agents/ICounterpartyProfileDataAgent'
import { CompanyClient } from '../registry/CompanyClient'
import { TaskManager, NotificationManager } from '@komgo/notification-publisher'
import { COUNTERPARTY_ACTIONS } from './Constants'
import { CounterpartyError } from '../errors/CounterpartyError'
import { COUNTERPARTY_ERROR_CODE } from '../errors/CounterpartyErrorCode'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'

describe('CounterpartyService', () => {
  beforeEach(() => {
    companyClient = createMockInstance(CompanyClient)
    companyCoverageDataAgent = createMockInstance(CompanyCoverageDataAgent)
    requestClient = createMockInstance(RequestClient)
    notificationClient = createMockInstance(NotificationManager)
    taskManager = createMockInstance(TaskManager)
    loggerMock.info.mockClear()
    loggerMock.warn.mockClear()
    loggerMock.error.mockClear()
    loggerMock.metric.mockClear()

    taskManager = {
      createTask: jest.fn(),
      updateTaskStatus: jest.fn()
    }

    counterpartyService = new CounterpartyService(
      companyClient,
      companyCoverageDataAgent,
      createMockInstance(CounterpartyProfileDataAgent),
      requestClient,
      notificationClient,
      taskManager,
      'komgo-staticid-1'
    )
  })

  const mockedCompanies: ICoverageCompany[] = [
    {
      staticId: '5bb31f79dd1c67002faa15be',
      x500Name: {
        CN: 'Display Name',
        O: 'Full legal entity name',
        C: 'ISO 3166-1 alpha-2  country code',
        L: 'Locality/city',
        STREET: 'street',
        PC: 'post code'
      },
      hasSWIFTKey: true,
      isFinancialInstitution: true,
      isMember: true,
      komgoMnid: '112233'
    }
  ]

  const mockedAllCompanies: ICoverageCompany[] = [
    {
      staticId: '5bb31f79dd1c67002faa15be',
      x500Name: {
        CN: 'Display Name',
        O: 'Full legal entity name 1',
        C: 'ISO 3166-1 alpha-2  country code',
        L: 'Locality/city',
        STREET: 'street',
        PC: 'post code'
      },
      hasSWIFTKey: true,
      isFinancialInstitution: true,
      isMember: true,
      komgoMnid: '112233'
    },
    {
      staticId: '5bb31f79dd1c67002faa15bc',
      x500Name: {
        CN: 'Display Name',
        O: 'Full legal entity name 2',
        C: 'ISO 3166-1 alpha-2  country code',
        L: 'Locality/city',
        STREET: 'street',
        PC: 'post code'
      },
      hasSWIFTKey: true,
      isFinancialInstitution: true,
      isMember: true,
      komgoMnid: '112244',
      status: 'PENDING'
    },
    {
      staticId: '5bb31f79dd1c67002faa15bd',
      x500Name: {
        CN: 'Display Name',
        O: 'Full legal entity name 3',
        C: 'ISO 3166-1 alpha-2  country code',
        L: 'Locality/city',
        STREET: 'street',
        PC: 'post code'
      },
      hasSWIFTKey: true,
      isFinancialInstitution: true,
      isMember: true,
      komgoMnid: '112255',
      status: 'PENDING'
    }
  ]

  describe('get companies', () => {
    it('returns empty', async () => {
      const mockedCounterparties: ICompanyCoverageDocument[] = [
        {
          companyId: '5bb31f79dd1c67002faa15be',
          covered: true,
          status: 'COMPLETED'
        }
      ]

      companyClient.getCompanies.mockImplementation(() => mockedCompanies)
      companyCoverageDataAgent.findByCompanyIds.mockImplementation(() => mockedCounterparties)
      await counterpartyService.getCompanies({ name: '1111' })
      expect(companyClient.getCompanies).toHaveBeenCalledTimes(1)
      expect(companyCoverageDataAgent.findByCompanyIds).toHaveBeenCalledTimes(1)
    })

    it('returns company', async () => {
      companyClient.getCompanies.mockImplementation(() => mockedCompanies)
      companyCoverageDataAgent.findByCompanyIds.mockImplementation(() => [])
      expect(await counterpartyService.getCompanies({ name: '1111' })).toEqual(mockedCompanies)
      expect(companyClient.getCompanies).toHaveBeenCalledTimes(1)
      expect(companyCoverageDataAgent.findByCompanyIds).toHaveBeenCalledTimes(1)
    })

    it('returns company - no companies', async () => {
      companyClient.getCompanies.mockImplementation(() => [])
      expect(await counterpartyService.getCompanies({ name: '1111' })).toEqual([])
      expect(companyClient.getCompanies).toHaveBeenCalledTimes(1)
    })
  })

  describe('get counterparty', () => {
    it('returns empty', async () => {
      companyClient.getCompanies.mockImplementation(() => mockedCompanies)
      companyCoverageDataAgent.findByCompanyIds.mockImplementation(() => [])
      expect(await counterpartyService.getCounterparties({ name: '1111' })).toEqual([])
      expect(companyClient.getCompanies).toHaveBeenCalledTimes(1)
      expect(companyCoverageDataAgent.findByCompanyIds).toHaveBeenCalledTimes(1)
    })

    it('empty company result', async () => {
      companyClient.getCompanies.mockImplementation(() => undefined)
      expect(await counterpartyService.getCounterparties({ name: '1111' })).toEqual([])
      expect(companyClient.getCompanies).toHaveBeenCalledTimes(1)
      expect(companyCoverageDataAgent.findByCompanyIds).not.toHaveBeenCalledTimes(1)
    })

    it('returns not empty', async () => {
      companyClient.getCompanies.mockImplementation(() => mockedAllCompanies)
      companyCoverageDataAgent.findByCompanyIds.mockImplementation(() => [])
      expect(await counterpartyService.getConnectedCounterpartiesWithRequests({ name: '1111' })).toEqual([])
      expect(companyClient.getCompanies).toHaveBeenCalledTimes(1)
      expect(companyCoverageDataAgent.findByCompanyIds).toHaveBeenCalledTimes(1)
    })

    it('empty company result', async () => {
      companyClient.getCompanies.mockImplementation(() => undefined)
      expect(await counterpartyService.getConnectedCounterpartiesWithRequests({ name: '1111' })).toEqual([])
      expect(companyClient.getCompanies).toHaveBeenCalledTimes(1)
      expect(companyCoverageDataAgent.findByCompanyIds).not.toHaveBeenCalledTimes(1)
    })

    it('returns counterparty with find', async () => {
      const mockedCounterparties: ICompanyCoverageDocument[] = [
        {
          companyId: '5bb31f79dd1c67002faa15be',
          covered: true,
          status: STATUSES.COMPLETED,
          coverageRequestId: '5c014afda016252f96821dfc'
        }
      ]

      const { komgoMnid, ...counterpartyCompany } = mockedCompanies[0]

      const expectedResult: ICounterparty[] = [
        {
          ...counterpartyCompany,
          covered: true,
          status: STATUSES.COMPLETED,
          timestamp: null,
          coverageRequestId: '5c014afda016252f96821dfc'
        }
      ]
      companyClient.getCompanies.mockImplementation(() => mockedCompanies)
      companyCoverageDataAgent.findByCompanyIds.mockImplementation(() => mockedCounterparties)
      expect(await counterpartyService.getCounterparties({ name: '1111' })).toEqual(expectedResult)
      expect(companyClient.getCompanies).toHaveBeenCalledTimes(1)
      expect(companyCoverageDataAgent.findByCompanyIds).toHaveBeenCalledTimes(1)
    })

    it('returns counterparty with findAll', async () => {
      const mockedAllCounterparties: ICompanyCoverageDocument[] = [
        {
          companyId: '5bb31f79dd1c67002faa15be',
          covered: false,
          status: STATUSES.WAITING,
          coverageRequestId: '5c014afda016252f96821dfc'
        }
      ]
      const { komgoMnid, ...counterpartyCompany } = mockedAllCompanies[0]

      const expectedResult: ICounterparty[] = [
        {
          ...counterpartyCompany,
          covered: false,
          status: STATUSES.WAITING,
          timestamp: null,
          coverageRequestId: '5c014afda016252f96821dfc'
        }
      ]
      companyClient.getCompanies.mockImplementation(() => mockedAllCompanies)
      companyCoverageDataAgent.findByCompanyIds.mockImplementation(() => mockedAllCounterparties)
      expect(await counterpartyService.getConnectedCounterpartiesWithRequests({ name: '1111' })).toEqual(expectedResult)
      expect(companyClient.getCompanies).toHaveBeenCalledTimes(1)
      expect(companyCoverageDataAgent.findByCompanyIds).toHaveBeenCalledTimes(1)
    })
  })

  describe('get counterparty request', () => {
    it('get counterparty request', async () => {
      const company: ICoverageCompany = mockedCompanies[0]
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'

      companyCoverageDataAgent.findOne.mockImplementationOnce(
        (): ICompanyCoverageDocument => {
          return {
            companyId: '5bb31f79dd1c67002faa15be',
            covered: true,
            status: 'COMPLETED',
            coverageRequestId: requestId
          }
        }
      )

      companyClient.getCompanyByStaticId.mockImplementation(x => {
        if (x === companyId) {
          return company
        }
        return { komgoMnid: '223344', staticId: 'komgo-staticid-1' }
      })

      expect(await counterpartyService.getCounterpartyRequest(requestId)).toMatchObject({
        requestId
      })
      expect(companyCoverageDataAgent.findOne).toHaveBeenCalledTimes(1)
      expect(companyClient.getCompanyByStaticId).toHaveBeenCalledTimes(1)
    })

    it('get counterparty request - no company found', async () => {
      companyCoverageDataAgent.findOne.mockImplementationOnce(() => null)
      await expect(counterpartyService.getCounterpartyRequest('requestId')).rejects.toBeInstanceOf(CounterpartyError)
      expect(loggerMock.error.mock.calls[0][0]).toEqual(ErrorCode.DatabaseMissingData)
    })
  })

  describe('add counterparty', () => {
    it('add request', async () => {
      const company: ICoverageCompany = mockedCompanies[0]

      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(x => {
        if (x === companyId) {
          return company
        }

        return { komgoMnid: '223344', staticId: 'komgo-staticid-1' }
      })
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '11223344' }))
      companyCoverageDataAgent.findOne.mockImplementation(() => null)
      requestClient.sendCommonRequest.mockImplementation(() => null)

      await counterpartyService.addCounterparty(companyId)

      expect(companyClient.getCompanyByStaticId).toHaveBeenCalledWith(companyId)
      const arg = companyCoverageDataAgent.create.mock.calls[0][0]
      expect(arg).toMatchObject({
        companyId,
        covered: false,
        status: STATUSES.PENDING
      })

      expect(loggerMock.info.mock.calls[0][1]).toMatchObject({
        action: COUNTERPARTY_ACTIONS.ADD,
        companyId,
        memberCompanyId: 'komgo-staticid-1'
      })
      expect(requestClient.sendCommonRequest).toHaveBeenCalled()

      const message = requestClient.sendCommonRequest.mock.calls[0][2]
      expect(message).toMatchObject({
        context: {
          requestId
        },
        data: {
          requesterCompanyId: 'komgo-staticid-1',
          receiverCompanyId: companyId,
          requestId
        }
      })
    })
    it('company does not exists', async () => {
      companyClient.getCompanyByStaticId.mockImplementation(x => undefined)

      await expect(counterpartyService.addCounterparty('112233')).rejects.toBeInstanceOf(CounterpartyError)
      expect(loggerMock.error).toBeCalled()
      expect(companyCoverageDataAgent.create).not.toBeCalled()
    })
    it('already added', async () => {
      const company: ICoverageCompany = mockedCompanies[0]

      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(x => company)
      companyCoverageDataAgent.findOne.mockImplementation(() => ({ companyId }))

      await expect(counterpartyService.addCounterparty(companyId)).rejects.toMatchObject({
        errorCode: COUNTERPARTY_ERROR_CODE.INVALID_REQUEST
      })

      expect(companyClient.getCompanyByStaticId).toHaveBeenCalledWith(companyId)
      expect(companyCoverageDataAgent.create).not.toBeCalled()
      expect(loggerMock.error).toBeCalled()
    })
    it('pending request added', async () => {
      const company: ICoverageCompany = mockedCompanies[0]

      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(x => company)
      companyCoverageDataAgent.findOne.mockImplementation(data => {
        if (data.status === STATUSES.COMPLETED) {
          return null
        }
        return { companyId }
      })

      await expect(counterpartyService.addCounterparty(companyId)).rejects.toMatchObject({
        errorCode: COUNTERPARTY_ERROR_CODE.INVALID_REQUEST
      })

      expect(companyClient.getCompanyByStaticId).toHaveBeenCalledWith(companyId)
      expect(companyCoverageDataAgent.create).not.toBeCalled()
      expect(loggerMock.warn).toBeCalled()
    })
    it('add list', async () => {
      const company: ICoverageCompany = mockedCompanies[0]

      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(x => {
        if (x === companyId) {
          return company
        }

        return { komgoMnid: '223344', staticId: 'komgo-staticid-1' }
      })
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '11223344' }))
      companyCoverageDataAgent.findOne.mockImplementation(() => null)
      requestClient.sendCommonRequest.mockImplementation(() => null)

      await counterpartyService.addCounterpartyList([companyId])

      expect(companyClient.getCompanyByStaticId).toHaveBeenCalledWith(companyId)
      const arg = companyCoverageDataAgent.create.mock.calls[0][0]
      expect(arg).toMatchObject({
        companyId,
        covered: false,
        status: STATUSES.PENDING
      })

      expect(loggerMock.info.mock.calls[0][1]).toMatchObject({
        action: COUNTERPARTY_ACTIONS.ADD,
        companyId,
        memberCompanyId: 'komgo-staticid-1'
      })
      expect(requestClient.sendCommonRequest).toHaveBeenCalled()

      const message = requestClient.sendCommonRequest.mock.calls[0][2]
      expect(message).toMatchObject({
        context: {
          requestId
        },
        data: {
          requesterCompanyId: 'komgo-staticid-1',
          receiverCompanyId: companyId,
          requestId
        }
      })
    })
    it('failed add list does not exists', async () => {
      companyClient.getCompanyByStaticId.mockImplementation(x => undefined)

      await expect(counterpartyService.addCounterpartyList(['112233', '223344'])).rejects.toMatchObject({
        errorCode: COUNTERPARTY_ERROR_CODE.GENERAL_ERROR
      })
      expect(companyCoverageDataAgent.create).not.toBeCalled()
    })

    it('failed add list does not exists - single company', async () => {
      companyClient.getCompanyByStaticId.mockImplementation(x => undefined)

      await expect(counterpartyService.addCounterpartyList(['112233'])).rejects.toMatchObject({
        errorCode: COUNTERPARTY_ERROR_CODE.INVALID_REQUEST
      })
      expect(companyCoverageDataAgent.create).not.toBeCalled()
    })
  })

  describe('approve counterparty', () => {
    it('approve counterparty', async () => {
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'

      companyCoverageDataAgent.findOne.mockImplementation(() => ({
        coverageRequestId: requestId,
        covered: false,
        status: STATUSES.WAITING,
        companyId,
        coverageApprovedOn: null
      }))

      companyClient.getCompanyByStaticId.mockImplementation(x => {
        return { komgoMnid: '223344', staticId: 'komgo-staticid-1' }
      })

      await counterpartyService.approveCounterparty(companyId)

      // expect(companyClient.getCompanyByStaticId).toHaveBeenCalledWith(companyId)
      expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId,
        covered: false,
        status: STATUSES.WAITING
      })

      expect(companyCoverageDataAgent.update).toHaveBeenCalledTimes(1)
      expect(requestClient.sendCommonRequest).toHaveBeenCalled()

      expect(loggerMock.info.mock.calls[0][1]).toMatchObject({
        action: COUNTERPARTY_ACTIONS.APPROVE,
        companyId,
        requestId,
        memberCompanyId: 'komgo-staticid-1'
      })

      const message = requestClient.sendCommonRequest.mock.calls[0][2]
      const messagetype = requestClient.sendCommonRequest.mock.calls[0][0]

      expect(messagetype).toEqual(MESSAGE_TYPE.ApproveConnectRequest)
      expect(message).toMatchObject({
        context: {
          requestId
        },
        data: {
          requesterCompanyId: companyId,
          receiverCompanyId: 'komgo-staticid-1',
          requestId
        }
      })
      expect(taskManager.updateTaskStatus).toHaveBeenCalled()
    })
    it('reqest does not exists', async () => {
      companyCoverageDataAgent.findOne.mockImplementation(x => undefined)

      await expect(counterpartyService.approveCounterparty('112233')).rejects.toMatchObject({
        errorCode: COUNTERPARTY_ERROR_CODE.INVALID_REQUEST
      })
      expect(loggerMock.error).toBeCalled()
      expect(companyCoverageDataAgent.create).not.toBeCalled()
    })
  })

  describe('reject counterparty', () => {
    it('reject counterparty', async () => {
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'

      companyClient.getCompanyByStaticId.mockImplementation(x => {
        return { komgoMnid: '223344', staticId: 'komgo-staticid-1' }
      })
      companyCoverageDataAgent.findOne.mockImplementation(() => ({
        coverageRequestId: requestId,
        covered: false,
        status: STATUSES.WAITING,
        companyId
      }))
      await counterpartyService.rejectCounterparty(companyId)

      expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId,
        covered: false,
        status: STATUSES.WAITING
      })

      expect(companyCoverageDataAgent.update).toHaveBeenCalledTimes(1)

      expect(loggerMock.info.mock.calls[0][1]).toMatchObject({
        action: COUNTERPARTY_ACTIONS.REJECT,
        companyId,
        requestId,
        memberCompanyId: 'komgo-staticid-1'
      })
      const message = requestClient.sendCommonRequest.mock.calls[0][2]
      const messagetype = requestClient.sendCommonRequest.mock.calls[0][0]

      expect(messagetype).toEqual(MESSAGE_TYPE.RejectConnectRequest)
      expect(message).toMatchObject({
        context: {
          requestId
        },
        data: {
          requesterCompanyId: companyId,
          receiverCompanyId: 'komgo-staticid-1',
          requestId
        }
      })

      expect(taskManager.updateTaskStatus).toHaveBeenCalled()
    })

    it('.request does not exists', async () => {
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyCoverageDataAgent.findOne.mockImplementation(x => undefined)
      await expect(counterpartyService.rejectCounterparty(companyId)).rejects.toMatchObject({
        message: 'No proper request to reject',
        errorCode: COUNTERPARTY_ERROR_CODE.INVALID_REQUEST
      })

      expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId,
        covered: false,
        status: STATUSES.WAITING
      })
      expect(companyCoverageDataAgent.update).not.toHaveBeenCalled()
      expect(loggerMock.error).toBeCalled()
    })
  })

  describe('.requestApproved', () => {
    it('request approved', async () => {
      const company: ICoverageCompany = mockedCompanies[0]
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'

      companyClient.getCompanyByStaticId.mockImplementation(() => company)
      companyCoverageDataAgent.findOne.mockImplementation(() => ({
        coverageRequestId: requestId,
        covered: false,
        status: STATUSES.PENDING,
        companyId,
        coverageApprovedOn: null
      }))
      await counterpartyService.requestApproved(companyId, requestId)

      expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId,
        coverageRequestId: requestId,
        status: STATUSES.PENDING
      })
      expect(companyCoverageDataAgent.update).toHaveBeenCalledTimes(1)
      expect(loggerMock.info.mock.calls[0][1]).toMatchObject({
        action: COUNTERPARTY_ACTIONS.REQUEST_APPROVED,
        companyId,
        requestId,
        memberCompanyId: 'komgo-staticid-1'
      })

      expect(notificationClient.createNotification).toHaveBeenCalled()
    })

    it('approve request does not exists', async () => {
      companyCoverageDataAgent.findOne.mockResolvedValue(null)
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      await counterpartyService.requestApproved(companyId, requestId)

      expect(loggerMock.error).toBeCalled()
      expect(companyCoverageDataAgent.update).not.toBeCalled()
    })

    it('request approved notification failed', async () => {
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'

      companyClient.getCompanyByStaticId.mockImplementation(() => undefined)
      companyCoverageDataAgent.findOne.mockImplementation(() => ({
        coverageRequestId: requestId,
        covered: false,
        status: STATUSES.PENDING,
        companyId,
        coverageApprovedOn: null
      }))
      await counterpartyService.requestApproved(companyId, requestId)

      expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId,
        coverageRequestId: requestId,
        status: STATUSES.PENDING
      })
      expect(companyCoverageDataAgent.update).toHaveBeenCalledTimes(1)
      expect(loggerMock.info.mock.calls[0][1]).toMatchObject({
        action: COUNTERPARTY_ACTIONS.REQUEST_APPROVED,
        companyId,
        requestId,
        memberCompanyId: 'komgo-staticid-1'
      })

      expect(loggerMock.error.mock.calls[0][0]).toEqual(ErrorCode.DatabaseMissingData)
      expect(notificationClient.createNotification).not.toHaveBeenCalled()
    })
  })

  describe('.requestRejected', () => {
    it('reject resend counterparty - status: waiting', async () => {
      const company: ICoverageCompany = mockedCompanies[0]
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => ({
        komgoMnid: '223344',
        staticId: 'komgo-staticid-1'
      }))
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '11223344' }))
      companyCoverageDataAgent.find.mockImplementation(() => [
        {
          coverageRequestId: requestId,
          covered: false,
          status: STATUSES.PENDING,
          companyId,
          coverageApprovedOn: null
        }
      ])
      requestClient.sendCommonRequest.mockImplementation(() => null)

      await counterpartyService.resendCounterparty(companyId)
      expect(requestClient.sendCommonRequest).toBeCalled()
      expect(loggerMock.info).toBeCalled()
    })

    it('reject resend counterparty - status: waiting', async () => {
      const company: ICoverageCompany = mockedCompanies[0]
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => ({
        komgoMnid: '223344',
        staticId: 'komgo-staticid-1'
      }))
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '11223344' }))
      companyCoverageDataAgent.find.mockImplementation(() => [
        {
          coverageRequestId: requestId,
          covered: false,
          status: STATUSES.WAITING,
          companyId,
          coverageApprovedOn: null
        }
      ])
      requestClient.sendCommonRequest.mockImplementation(() => null)

      await expect(counterpartyService.resendCounterparty(companyId)).rejects.toBeInstanceOf(CounterpartyError)
      expect(loggerMock.error).toBeCalled()
    })

    it('reject resend counterparty - status: completed', async () => {
      const company: ICoverageCompany = mockedCompanies[0]
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => ({
        komgoMnid: '223344',
        staticId: 'komgo-staticid-1'
      }))
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '11223344' }))
      companyCoverageDataAgent.find.mockImplementation(() => [
        {
          coverageRequestId: requestId,
          covered: true,
          status: STATUSES.COMPLETED,
          companyId,
          coverageApprovedOn: null
        }
      ])
      requestClient.sendCommonRequest.mockImplementation(() => null)

      await expect(counterpartyService.resendCounterparty(companyId)).rejects.toBeInstanceOf(CounterpartyError)
      expect(loggerMock.error).toBeCalled()
    })

    it('reject resend counterparty - not found counterparty', async () => {
      const company: ICoverageCompany = mockedCompanies[0]
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => ({
        komgoMnid: '223344',
        staticId: 'komgo-staticid-1'
      }))
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '11223344' }))
      companyCoverageDataAgent.find.mockImplementation(() => [])
      requestClient.sendCommonRequest.mockImplementation(() => null)

      await expect(counterpartyService.resendCounterparty(companyId)).rejects.toBeInstanceOf(CounterpartyError)
      expect(loggerMock.error).toBeCalled()
    })

    it('reject resend counterparty - not found counterparty status', async () => {
      const companyId = 'komgo-staticid-1'
      companyClient.getCompanyByStaticId.mockImplementation(() => ({
        komgoMnid: '223344',
        staticId: 'komgo-staticid-1'
      }))
      companyCoverageDataAgent.find.mockImplementation(() => [{ status: 'impossible', coverageRequestId: '11223344' }])
      requestClient.sendCommonRequest.mockImplementation(() => null)

      await expect(counterpartyService.resendCounterparty(companyId)).rejects.toBeInstanceOf(CounterpartyError)
      expect(loggerMock.error).toBeCalled()
    })

    it('reject resend counterparty - not found company', async () => {
      const company: ICoverageCompany = mockedCompanies[0]
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => null)
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '11223344' }))
      companyCoverageDataAgent.find.mockImplementation(() => [])
      requestClient.sendCommonRequest.mockImplementation(() => null)

      await expect(counterpartyService.resendCounterparty(companyId)).rejects.toBeInstanceOf(CounterpartyError)
      expect(loggerMock.error).toBeCalled()
    })
  })

  describe('.requestRejected', () => {
    it('request rejected', async () => {
      const company: ICoverageCompany = mockedCompanies[0]
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'

      companyClient.getCompanyByStaticId.mockImplementation(() => company)
      companyCoverageDataAgent.findOne.mockImplementation(() => ({
        coverageRequestId: requestId,
        covered: false,
        status: STATUSES.PENDING,
        companyId,
        coverageApprovedOn: null
      }))
      await counterpartyService.requestRejected(companyId, requestId)

      // expect(companyClient.getCompanyByStaticId).toHaveBeenCalledWith(companyId)
      expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId,
        coverageRequestId: requestId
      })
      expect(companyCoverageDataAgent.update).toHaveBeenCalledTimes(1)
      expect(loggerMock.info.mock.calls[0][1]).toMatchObject({
        action: COUNTERPARTY_ACTIONS.REQUEST_REJECTED,
        companyId,
        requestId,
        memberCompanyId: 'komgo-staticid-1'
      })

      expect(notificationClient.createNotification).toHaveBeenCalled()
    })

    it('reject request does not exists', async () => {
      companyCoverageDataAgent.findOne.mockResolvedValue(null)
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      await counterpartyService.requestRejected(companyId, requestId)

      expect(loggerMock.error).toBeCalled()
      expect(companyCoverageDataAgent.update).not.toBeCalled()
    })

    it('request rejected - notification failed', async () => {
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'

      companyClient.getCompanyByStaticId.mockImplementation(() => undefined)
      companyCoverageDataAgent.findOne.mockImplementation(() => ({
        coverageRequestId: requestId,
        covered: false,
        companyId,
        coverageApprovedOn: null,
        status: STATUSES.PENDING
      }))
      await counterpartyService.requestRejected(companyId, requestId)

      // expect(companyClient.getCompanyByStaticId).toHaveBeenCalledWith(companyId)
      expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId,
        coverageRequestId: requestId
      })
      expect(companyCoverageDataAgent.update).toHaveBeenCalledTimes(1)
      expect(loggerMock.info.mock.calls[0][1]).toMatchObject({
        action: COUNTERPARTY_ACTIONS.REQUEST_REJECTED,
        companyId,
        requestId,
        memberCompanyId: 'komgo-staticid-1'
      })
      expect(loggerMock.error.mock.calls[0][0]).toEqual(ErrorCode.DatabaseMissingData)
    })

    it('counterparty does not exists', async () => {
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'

      companyClient.getCompanyByStaticId.mockImplementation(() => undefined)
      companyCoverageDataAgent.findOne.mockImplementation(() => undefined)
      await counterpartyService.requestRejected(companyId, requestId)

      expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId,
        coverageRequestId: requestId
      })
      expect(loggerMock.error.mock.calls[0][0]).toEqual(ErrorCode.DatabaseMissingData)
    })
  })

  describe('.addRequest', () => {
    it('request added', async () => {
      const company: ICoverageCompany = mockedCompanies[0]

      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => company)
      companyCoverageDataAgent.find.mockImplementation(() => undefined)
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '1' }))

      await counterpartyService.addRequest(companyId, requestId)

      expect(companyCoverageDataAgent.find).toHaveBeenCalledWith({
        companyId
      })
      expect(companyCoverageDataAgent.create).toHaveBeenCalledWith({
        companyId,
        covered: false,
        status: STATUSES.WAITING,
        coverageRequestId: requestId
      })

      expect(taskManager.createTask).toHaveBeenCalled()
      expect(loggerMock.info.mock.calls[0][1]).toMatchObject({
        action: COUNTERPARTY_ACTIONS.ADD_REQUEST,
        companyId,
        requestId,
        memberCompanyId: 'komgo-staticid-1'
      })
    })

    it('request added with existing request in status pending', async () => {
      const company: ICoverageCompany = mockedCompanies[0]

      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => company)
      companyCoverageDataAgent.find.mockImplementation(query => {
        return [
          {
            companyId,
            covered: false,
            status: STATUSES.PENDING
          }
        ]
      })

      await counterpartyService.addRequest(companyId, requestId)

      expect(companyCoverageDataAgent.find).toHaveBeenCalledWith({
        companyId
      })

      expect(loggerMock.warn).toHaveBeenCalledWith(
        ErrorCode.DatabaseInvalidData,
        ErrorName.CounterpartyRequestAlreadyExist,
        {
          action: COUNTERPARTY_ACTIONS.REQUEST_SUPPRESSED,
          companyId,
          requestId,
          memberCompanyId: 'komgo-staticid-1'
        }
      )

      expect(companyCoverageDataAgent.update).toHaveBeenCalledTimes(1)
      expect(notificationClient.createNotification).toHaveBeenCalled()
      expect(companyCoverageDataAgent.create).not.toBeCalled()
    })

    it('company does not exists', async () => {
      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => undefined)
      expect(await counterpartyService.addRequest(companyId, requestId)).toBeUndefined()
      expect(companyCoverageDataAgent.create).not.toBeCalled()
      expect(loggerMock.error).toBeCalled()
    })

    it('counterparty exists', async () => {
      const company: ICoverageCompany = mockedCompanies[0]

      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => company)
      companyCoverageDataAgent.find.mockImplementation(query => [
        { companyId: query.companyId, covered: true, status: STATUSES.COMPLETED }
      ])
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '1' }))
      requestClient.sendCommonRequest.mockImplementation(() => null)

      await counterpartyService.addRequest(companyId, requestId)

      expect(companyCoverageDataAgent.find).toHaveBeenCalledWith({
        companyId
      })
      expect(loggerMock.error).toHaveBeenCalledWith(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyAdded, {
        action: COUNTERPARTY_ACTIONS.ADD_REQUEST,
        companyId,
        requestId,
        memberCompanyId: 'komgo-staticid-1'
      })
      expect(requestClient.sendCommonRequest).toBeCalled()
    })

    it('counterparty rejected exists', async () => {
      const company: ICoverageCompany = mockedCompanies[0]

      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => company)
      companyCoverageDataAgent.find.mockImplementation(query => [
        { companyId: query.companyId, covered: false, status: STATUSES.COMPLETED, coverageRequestId: requestId }
      ])
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '1' }))
      requestClient.sendCommonRequest.mockImplementation(() => null)

      await counterpartyService.addRequest(companyId, requestId)

      expect(companyCoverageDataAgent.find).toHaveBeenCalledWith({
        companyId
      })
      expect(loggerMock.error).toHaveBeenCalledWith(
        ErrorCode.DatabaseInvalidData,
        ErrorName.CounterpartyAlreadyRejected,
        {
          action: COUNTERPARTY_ACTIONS.ADD_REQUEST,
          companyId,
          requestId,
          memberCompanyId: 'komgo-staticid-1'
        }
      )
      expect(requestClient.sendCommonRequest).toBeCalled()
    })

    it('request exists', async () => {
      const company: ICoverageCompany = mockedCompanies[0]

      const requestId = '11223344'
      const companyId = '5bb31f79dd1c67002faa15be'
      companyClient.getCompanyByStaticId.mockImplementation(() => company)
      companyCoverageDataAgent.find.mockImplementation(query => {
        if (query.covered) {
          return undefined
        }
        return [{ companyId, covered: false, status: STATUSES.WAITING }]
      })
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '1' }))

      await counterpartyService.addRequest(companyId, requestId)

      expect(loggerMock.error).toHaveBeenCalledWith(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyAdded, {
        action: COUNTERPARTY_ACTIONS.ADD_REQUEST,
        companyId,
        requestId,
        memberCompanyId: 'komgo-staticid-1'
      })
    })
  })

  describe('not covered companies', () => {
    it('resolveNotCoveredCompanies', async () => {
      const company: ICoverageCompany[] = [mockedCompanies[0]]
      const mockedCounterparties: ICompanyCoverageDocument[] = [
        {
          companyId: '5bb31f79dd1c67002faa15be',
          covered: false,
          status: STATUSES.PENDING
        }
      ]
      companyCoverageDataAgent.findByCompanyIds.mockImplementationOnce(() => mockedCounterparties)
      expect(await counterpartyService.resolveNotCoveredCompanies(company)).toMatchObject([
        {
          status: STATUSES.PENDING
        }
      ])
    })
  })

  describe('.autoAdd', () => {
    it('auto add list', async () => {
      // Auto add company test
      const company: ICoverageCompany = mockedCompanies[0]

      companyClient.getCompanyByStaticId.mockImplementation(() => company)
      companyCoverageDataAgent.findOne.mockImplementation(() => undefined)
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '1' }))

      await counterpartyService.autoAddCountepartyList(['company-id-1'])

      await expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId: 'company-id-1',
        covered: true,
        status: STATUSES.COMPLETED
      })
      await expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId: 'company-id-1',
        covered: false,
        status: { $ne: STATUSES.COMPLETED }
      })
      expect(companyCoverageDataAgent.create).toHaveBeenCalled()
    })

    it('auto add list failed', async () => {
      companyClient.getCompanyByStaticId.mockResolvedValue(null)

      await counterpartyService.autoAddCountepartyList(['company-id-1'])
      expect(loggerMock.error).toBeCalled()
      expect(companyCoverageDataAgent.create).not.toHaveBeenCalled()
    })

    it('auto add failed to add counterparty with self', async () => {
      await counterpartyService.autoAddCounteparty('komgo-staticid-1')
      expect(loggerMock.error).toBeCalled()
      expect(companyCoverageDataAgent.create).not.toHaveBeenCalled()
    })

    it('counterparty exists', async () => {
      // Auto add company test
      const company: ICoverageCompany = mockedCompanies[0]

      companyClient.getCompanyByStaticId.mockImplementation(() => company)
      companyCoverageDataAgent.findOne.mockImplementation(() => ({
        companyId: 'company-id-1',
        covered: true,
        status: STATUSES.COMPLETED
      }))
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '1' }))

      await counterpartyService.autoAddCountepartyList(['company-id-1'])
      await expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId: 'company-id-1',
        covered: true,
        status: STATUSES.COMPLETED
      })

      expect(loggerMock.error).toHaveBeenCalledWith(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyAdded, {
        action: COUNTERPARTY_ACTIONS.AUTO_ADD,
        companyId: 'company-id-1',
        memberCompanyId: 'komgo-staticid-1'
      })
    })

    it('counterparty update', async () => {
      // Auto add company test
      const company: ICoverageCompany = mockedCompanies[0]

      companyClient.getCompanyByStaticId.mockImplementation(() => company)
      companyCoverageDataAgent.findOne.mockImplementation(query => {
        if (query.covered) {
          return undefined
        }
        return { companyId: 'company-id-1', covered: false, status: STATUSES.PENDING }
      })
      companyCoverageDataAgent.create.mockImplementation(() => ({ coverageRequestId: '1' }))

      await counterpartyService.autoAddCountepartyList(['company-id-1'])
      await expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId: 'company-id-1',
        covered: true,
        status: STATUSES.COMPLETED
      })
      await expect(companyCoverageDataAgent.findOne).toHaveBeenCalledWith({
        companyId: 'company-id-1',
        covered: false,
        status: { $ne: STATUSES.COMPLETED }
      })
      expect(companyCoverageDataAgent.update).toHaveBeenCalled()
    })
  })
})
