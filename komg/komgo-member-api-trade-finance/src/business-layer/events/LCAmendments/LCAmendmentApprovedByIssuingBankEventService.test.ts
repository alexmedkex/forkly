import 'reflect-metadata'
import { LCAmendmentApprovedByIssuingBankEventService } from './LCAmendmentApprovedByIssuingBankEventService'
import { ILCAmendmentEventService } from './ILCAmendmentEventService'
import { ILCAmendmentDataAgent, ILCCacheDataAgent } from '../../../data-layer/data-agents'
import { ILCDocumentManager } from '../LC/LCTransitionEvents/LCDocumentManager'
import { buildFakeAmendment } from '@komgo/types'
import { TaskManager, TaskStatus } from '@komgo/notification-publisher'
import { DOCUMENT_TYPE } from '../../documents/documentTypes'

const COMPANY_STATIC_ID = 'companyId123'

const amendmentDataAgent: ILCAmendmentDataAgent = {
  count: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  getByAddress: jest.fn()
}

const lcCacheMock: ILCCacheDataAgent = {
  getLC: jest.fn(),
  updateField: jest.fn(),
  updateStatus: jest.fn(),
  saveLC: jest.fn(),
  getLCs: jest.fn(),
  updateLcByReference: jest.fn(),
  getNonce: jest.fn(),
  count: jest.fn()
}

const taskManagerMock: any = {
  createTask: jest.fn(),
  getTasks: jest.fn(),
  updateTaskStatus: jest.fn(),
  notifBaseUrl: ''
}

const documentManagerMock: ILCDocumentManager = {
  deleteDocument: jest.fn(),
  shareDocument: jest.fn()
}

const amendment = buildFakeAmendment()

const notificationManagerMock: any = {
  createNotification: jest.fn()
}

const tasks = [
  {
    status: TaskStatus.ToDo
  }
]

describe('LCAmendmentApprovedByIssuingBankEventService', () => {
  let lcAmendmentApprovedByIssuingBankEventService: ILCAmendmentEventService
  let lc

  beforeEach(() => {
    lcAmendmentApprovedByIssuingBankEventService = new LCAmendmentApprovedByIssuingBankEventService(
      amendmentDataAgent,
      COMPANY_STATIC_ID,
      taskManagerMock,
      notificationManagerMock,
      lcCacheMock,
      documentManagerMock
    )
    taskManagerMock.getTasks = jest.fn().mockImplementationOnce(() => tasks)
  })

  it('doEvent from issuing bank', async () => {
    lc = {
      issuingBankId: COMPANY_STATIC_ID,
      beneficiaryId: 'beneficiary',
      applicantId: 'applicant'
    }
    lcCacheMock.getLC = jest.fn().mockImplementationOnce(() => lc)
    await lcAmendmentApprovedByIssuingBankEventService.doEvent(amendment, {}, {})
    expect(taskManagerMock.updateTaskStatus).toHaveBeenCalledTimes(1)
    expect(taskManagerMock.createTask).toHaveBeenCalledTimes(0)
    expect(amendmentDataAgent.update).toHaveBeenCalledTimes(1)
    expect(documentManagerMock.shareDocument).toHaveBeenCalledWith(lc, DOCUMENT_TYPE.LC_Amendment, [
      lc.applicantId,
      lc.beneficiaryId
    ])
  })

  it('doEvent from advising bank', async () => {
    lc = {
      beneficiaryBankId: COMPANY_STATIC_ID,
      beneficiaryId: 'beneficiary',
      applicantId: 'applicant'
    }
    lcCacheMock.getLC = jest.fn().mockImplementationOnce(() => lc)
    await lcAmendmentApprovedByIssuingBankEventService.doEvent(amendment, {}, {})
    expect(taskManagerMock.updateTaskStatus).toHaveBeenCalledTimes(0)
    expect(taskManagerMock.createTask).toHaveBeenCalledTimes(1)
    expect(amendmentDataAgent.update).toHaveBeenCalledTimes(1)
    expect(documentManagerMock.shareDocument).toHaveBeenCalledTimes(0)
  })

  it('doEvent from beneficiary', async () => {
    lc = {
      beneficiaryId: COMPANY_STATIC_ID,
      applicantId: 'applicant'
    }
    lcCacheMock.getLC = jest.fn().mockImplementationOnce(() => lc)
    await lcAmendmentApprovedByIssuingBankEventService.doEvent(amendment, {}, {})
    expect(taskManagerMock.updateTaskStatus).toHaveBeenCalledTimes(0)
    expect(taskManagerMock.createTask).toHaveBeenCalledTimes(1)
    expect(amendmentDataAgent.update).toHaveBeenCalledTimes(1)
    expect(documentManagerMock.shareDocument).toHaveBeenCalledTimes(0)
  })
})
