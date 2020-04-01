import 'reflect-metadata'

import { ILCAmendmentDataAgent } from '../../../data-layer/data-agents'
import { ILCAmendmentEventService } from './ILCAmendmentEventService'
import { LCAmendmentCreatedService } from './LCAmendmentCreatedService'
import { IEvent } from '../../common/IEvent'
import { LCAmendmentStatus } from '@komgo/types'
import { HashMetaDomain } from '../../common/HashFunctions'
import { ILCCacheDataAgent } from '../../../data-layer/data-agents'
import { ILCDocumentManager } from '../LC/LCTransitionEvents/LCDocumentManager'

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

const taskManagerMock: any = {
  createTask: jest.fn(),
  getTasks: jest.fn(),
  updateTaskStatus: jest.fn(),
  notifBaseUrl: ''
}

const rawEvent: IEvent = {
  transactionHash: '0x123456',
  address: '0x0',
  blockNumber: 1,
  data: '0x123',
  topics: ['0x69']
}

const amendmentData = {
  status: LCAmendmentStatus.Pending,
  staticId: '1234',
  createdAt: 'date1',
  updatedAt: 'date2',
  transactionHash: '0x11',
  contractAddress: '0x22'
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

const decodedEventNotIssuingBank = {
  lcAmendmentData: JSON.stringify(amendmentData),
  issuingBankGuid: 'bankId'
}

const decodedEventIssuingBank = {
  lcAmendmentData: JSON.stringify(amendmentData),
  issuingBankGuid: HashMetaDomain(COMPANY_STATIC_ID)
}

const documentManagerMock: ILCDocumentManager = {
  deleteDocument: jest.fn(),
  shareDocument: jest.fn()
}

const notificationManagerMock: any = {
  createNotification: jest.fn()
}

describe('LCAmendmentCreatedService', () => {
  let service: ILCAmendmentEventService
  beforeEach(() => {
    service = new LCAmendmentCreatedService(
      amendmentDataAgent,
      COMPANY_STATIC_ID,
      taskManagerMock,
      notificationManagerMock,
      lcCacheMock,
      documentManagerMock
    )
  })

  it('doEvent without creating task', async () => {
    await service.doEvent(undefined, decodedEventNotIssuingBank, rawEvent)
    expect(amendmentDataAgent.update).toHaveBeenCalledTimes(1)
    expect(taskManagerMock.createTask).toHaveBeenCalledTimes(0)
  })

  it('doEvent creating task', async () => {
    await service.doEvent(undefined, decodedEventIssuingBank, rawEvent)
    expect(amendmentDataAgent.update).toHaveBeenCalledTimes(1)
    expect(taskManagerMock.createTask).toHaveBeenCalledTimes(1)
  })
})
