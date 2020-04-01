import 'reflect-metadata'
import { ILCAmendmentEventService } from './ILCAmendmentEventService'
import { LCAmendmentRejectionDataUpdatedEventService } from './LCAmendmentRejectionDataUpdatedEventService'
import { buildFakeAmendment } from '@komgo/types'
import { ILCDocumentManager } from '../LC/LCTransitionEvents/LCDocumentManager'
import { ILCAmendmentDataAgent, ILCCacheDataAgent } from '../../../data-layer/data-agents'

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

const notificationManagerMock: any = {
  createNotification: jest.fn()
}

const documentManagerMock: ILCDocumentManager = {
  deleteDocument: jest.fn(),
  shareDocument: jest.fn()
}

const amendment = buildFakeAmendment()
const COMPANY_STATIC_ID = 'companyId123'

const decodedEvent = {
  data: 'stuff'
}

describe('LCAmendmentRejectionDataUpdatedEventService', () => {
  let lcAmendmentRejectionDataUpdatedEventService: ILCAmendmentEventService

  beforeEach(() => {
    lcAmendmentRejectionDataUpdatedEventService = new LCAmendmentRejectionDataUpdatedEventService(
      amendmentDataAgent,
      COMPANY_STATIC_ID,
      taskManagerMock,
      notificationManagerMock,
      lcCacheMock,
      documentManagerMock
    )
  })

  it('doEvent', async () => {
    await lcAmendmentRejectionDataUpdatedEventService.doEvent(amendment, decodedEvent, {})
    expect(amendmentDataAgent.update).toHaveBeenCalledTimes(1)
  })
})
