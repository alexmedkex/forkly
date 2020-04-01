import 'reflect-metadata'

import { mockPresentation } from '../mock-data/LCPresentation'
import { LCPresentationStatus } from '@komgo/types'
import { LCPresentationRole } from '../../LCPresentationRole'
import { TaskStatus } from '@komgo/notification-publisher'
import { LCPresentationTaskType } from '../../../../tasks/LCPresentationTaskType'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'
import { LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor } from './LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor'

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
      taskType: LCPresentationTaskType.ReviewPresentation,
      context: 'presentationcontext'
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

let processor: LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor

describe('LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor', () => {
  beforeEach(() => {
    processor = new LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor(
      docServiceClient,
      docRequestBuilder,
      presentationTaskFactory,
      taskManager,
      presentationNotificationProcessor
    )
  })

  it('process as issuing bank', async () => {
    await processor.processEvent(
      {
        ...mockPresentation,
        status: LCPresentationStatus.DocumentsCompliantByNominatedBank
      },
      {},
      {
        companyId: 'issuing',
        role: LCPresentationRole.IssuingBank
      },
      {} as any
    )
    expect(presentationTaskFactory.getTask).toBeCalled()
    expect(taskManager.createTask).toBeCalled()
  })
})
