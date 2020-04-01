import 'reflect-metadata'

import { ILCPresentationTransactionManager } from '../../../../blockchain/LCPresentationTransactionManager'
import { LCPresentationCompliantByIssuingBankProcessor } from './LCPresentationCompliantByIssuingBankProcessor'
import { mockPresentation } from '../mock-data/LCPresentation'
import { LCPresentationRole } from '../../LCPresentationRole'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'
import { LC_TASK_TYPE } from '../../../../tasks/LCTaskType'
import { TaskStatus } from '@komgo/notification-publisher'

const transactionManager: ILCPresentationTransactionManager = {
  deployDocPresented: jest.fn(),
  deployCompliantAsNominatedBank: jest.fn(),
  deployCompliantAsIssuingBank: jest.fn(),
  deployAdviseDiscrepanciesAsNominatedBank: jest.fn(),
  deployAdviseDiscrepanciesAsIssuingBank: jest.fn(),

  nominatedBankSetDocumentsCompliant: jest.fn(),
  nominatedBankSetDocumentsDiscrepant: jest.fn(),
  issuingBankSetDocumentsCompliant: jest.fn(),
  issuingBankSetDocumentsDiscrepant: jest.fn(),
  nominatedBankAdviseDiscrepancies: jest.fn(),
  issungBankAdviseDiscrepancies: jest.fn(),

  issuingBankSetDiscrepanciesAccepted: jest.fn(),
  issuingBankSetDiscrepanciesRejected: jest.fn(),
  applicantSetDiscrepanciesAccepted: jest.fn(),
  applicantSetDiscrepanciesRejected: jest.fn()
}

const docServiceClient: any = {
  getDocuments: jest.fn(() => [{ id: 'docId' }]),
  shareDocument: jest.fn()
}
const docRequestBuilder: any = {
  getPresentationDocumentSearchContext: jest.fn()
}
const taskManager: any = {
  getTasks: jest.fn().mockReturnValue([
    {
      status: TaskStatus.ToDo,
      taskType: LC_TASK_TYPE.ManagePresentation,
      context: 'lccontext'
    }
  ]),
  updateTaskStatus: jest.fn(),
  createTask: jest.fn()
}
const presentationTaskFactory: ILCPresentationTaskFactory = {
  getTaskContext: jest.fn().mockReturnValue({ lcPresentationStaticId: mockPresentation.staticId }),
  getTask: jest
    .fn()
    .mockReturnValue({ task: { lcPresentationStaticId: mockPresentation.staticId }, notification: { message: 'msg' } })
}
const presentationNotificationProcessor: ILCPresentationNotificationProcessor = {
  sendStateUpdatedNotification: jest.fn()
}

let processor: LCPresentationCompliantByIssuingBankProcessor
describe('LCPresentationTransitionByIssuingBankProcessor', () => {
  beforeEach(() => {
    processor = new LCPresentationCompliantByIssuingBankProcessor(
      docServiceClient,
      docRequestBuilder,
      presentationTaskFactory,
      taskManager,
      presentationNotificationProcessor,
      transactionManager
    )
  })

  it('should init', () => {
    expect(
      new LCPresentationCompliantByIssuingBankProcessor(
        docServiceClient,
        docRequestBuilder,
        presentationTaskFactory,
        taskManager,
        presentationNotificationProcessor,
        transactionManager
      )
    ).toBeDefined()
  })

  it('process  init', async () => {
    await processor.processEvent(
      mockPresentation,
      {},
      {
        companyId: 'issuing',
        role: LCPresentationRole.IssuingBank
      },
      {} as any
    )
    expect(transactionManager.deployCompliantAsIssuingBank).toBeCalled()
  })
})
