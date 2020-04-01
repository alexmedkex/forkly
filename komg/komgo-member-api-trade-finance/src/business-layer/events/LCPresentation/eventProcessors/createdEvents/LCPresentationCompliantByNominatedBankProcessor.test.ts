import 'reflect-metadata'

import { LCPresentationCompliantByNominatedBankProcessor } from './LCPresentationCompliantByNominatedBankProcessor'
import { mockPresentation } from '../mock-data/LCPresentation'
import { LCPresentationStatus } from '@komgo/types'
import { LCPresentationRole } from '../../LCPresentationRole'
import { TaskStatus } from '@komgo/notification-publisher'
import { LCPresentationTaskType } from '../../../../tasks/LCPresentationTaskType'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'

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

let processor: LCPresentationCompliantByNominatedBankProcessor

describe('LCPresentation compliant by nominated - created', () => {
  beforeEach(() => {
    processor = new LCPresentationCompliantByNominatedBankProcessor(
      docServiceClient,
      docRequestBuilder,
      presentationTaskFactory,
      taskManager,
      presentationNotificationProcessor
    )
  })

  it('process as nominated', async () => {
    await processor.processEvent(
      {
        ...mockPresentation,
        status: LCPresentationStatus.DocumentsCompliantByNominatedBank
      },
      {},
      {
        companyId: 'nominated',
        role: LCPresentationRole.NominatedBank
      },
      {} as any
    )
    expect(presentationTaskFactory.getTaskContext).toBeCalled()
    expect(taskManager.getTasks).toBeCalled()
    expect(taskManager.updateTaskStatus).toBeCalled()
  })

  it('process as nominated - null presentation', async () => {
    await processor.processEvent(
      {} as any,
      {},
      {
        companyId: 'nominated',
        role: LCPresentationRole.NominatedBank
      },
      {} as any
    )
    expect(presentationTaskFactory.getTaskContext).toBeCalled()
    expect(taskManager.getTasks).toBeCalled()
    expect(taskManager.updateTaskStatus).toBeCalled()
  })

  it('process as nominated - no task', async () => {
    taskManager.getTasks = jest.fn().mockReturnValue(null)
    await processor.processEvent(
      {
        ...mockPresentation,
        status: LCPresentationStatus.DocumentsCompliantByNominatedBank
      },
      {},
      {
        companyId: 'nominated',
        role: LCPresentationRole.NominatedBank
      },
      {} as any
    )
    expect(presentationTaskFactory.getTaskContext).toBeCalled()
    expect(taskManager.getTasks).toBeCalled()
    expect(taskManager.updateTaskStatus).not.toBeCalled()
  })

  it('process as beneficiary', async () => {
    await processor.processEvent(
      {
        ...mockPresentation,
        status: LCPresentationStatus.DocumentsCompliantByNominatedBank
      },
      {},
      {
        companyId: 'ben',
        role: LCPresentationRole.Beneficiary
      },
      { _id: 'lcid' } as any
    )
    expect(docServiceClient.shareDocument).toBeCalled()
    expect(presentationNotificationProcessor.sendStateUpdatedNotification).toBeCalled()
  })
  it('process as beneficiary - null presentation', async () => {
    await processor.processEvent(
      {} as any,
      {},
      {
        companyId: 'ben',
        role: LCPresentationRole.Beneficiary
      },
      {} as any
    )
    expect(docServiceClient.shareDocument).toBeCalled()
    expect(presentationNotificationProcessor.sendStateUpdatedNotification).toBeCalled()
  })

  it('process as beneficiary - failed notification', async () => {
    presentationNotificationProcessor.sendStateUpdatedNotification = jest.fn().mockImplementation(() => {
      throw new Error('Notification failed')
    })
    await processor.processEvent(
      {
        ...mockPresentation,
        status: LCPresentationStatus.DocumentsCompliantByNominatedBank
      },
      {},
      {
        companyId: 'ben',
        role: LCPresentationRole.Beneficiary
      },
      {} as any
    )
    expect(docServiceClient.shareDocument).toBeCalled()
  })

  it('process as issuing', async () => {
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

  it('process as issuing - null presentation', async () => {
    await processor.processEvent(
      {} as any,
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
