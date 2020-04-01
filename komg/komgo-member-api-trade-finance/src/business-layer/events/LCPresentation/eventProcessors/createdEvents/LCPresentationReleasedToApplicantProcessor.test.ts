import 'reflect-metadata'

import { LCPresentationReleasedToApplicantProcessor } from './LCPresentationReleasedToApplicantProcessor'
import { mockPresentation } from '../mock-data/LCPresentation'
import { LCPresentationStatus } from '@komgo/types'
import { LCPresentationRole } from '../../LCPresentationRole'
import { TaskStatus } from '@komgo/notification-publisher'
import { LCPresentationTaskType } from '../../../../tasks/LCPresentationTaskType'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'

let docServiceClient: any
let docRequestBuilder: any
let presentationTaskFactory: any
let taskManager: any
let presentationNotificationProcessor: ILCPresentationNotificationProcessor
let processor: LCPresentationReleasedToApplicantProcessor

describe('LCPresentation released to applicant - created', () => {
  beforeEach(() => {
    docServiceClient = {
      getDocuments: jest.fn(() => [{ id: 'docId' }]),
      shareDocument: jest.fn()
    }
    docRequestBuilder = {
      getPresentationDocumentSearchContext: jest.fn()
    }
    presentationTaskFactory = {
      getTaskContext: jest.fn().mockReturnValue({ lcPresentationStaticId: mockPresentation.staticId }),
      getTask: jest.fn().mockReturnValue({
        task: { lcPresentationStaticId: mockPresentation.staticId },
        notification: { message: 'msg' }
      })
    }
    taskManager = {
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
    presentationNotificationProcessor = {
      sendStateUpdatedNotification: jest.fn()
    }

    processor = new LCPresentationReleasedToApplicantProcessor(
      docServiceClient,
      docRequestBuilder,
      presentationTaskFactory,
      taskManager,
      presentationNotificationProcessor
    )
  })
  it('process as issuing', async () => {
    await processor.processEvent(
      {
        ...mockPresentation,
        stateHistory: [
          {
            toState: LCPresentationStatus.DocumentsPresented,
            performer: 'ben', // static ID of the company triggering the state transition
            date: new Date()
          }
        ],
        status: LCPresentationStatus.DocumentsCompliantByIssuingBank
      },
      {},
      {
        companyId: 'issuing',
        role: LCPresentationRole.IssuingBank
      },
      {
        _id: 'lcid'
      } as any
    )
    expect(taskManager.updateTaskStatus).toBeCalled()
  })

  it('process as issuing - null presentation', async () => {
    await processor.processEvent(
      null,
      {},
      {
        companyId: 'issuing',
        role: LCPresentationRole.IssuingBank
      },
      null
    )
    expect(taskManager.updateTaskStatus).toBeCalled()
  })

  it('process as applicant', async () => {
    await processor.processEvent(
      {
        ...mockPresentation,
        stateHistory: [
          {
            toState: LCPresentationStatus.DocumentsPresented,
            performer: 'ben', // static ID of the company triggering the state transition
            date: new Date()
          }
        ],
        status: LCPresentationStatus.DocumentsCompliantByIssuingBank
      },
      {},
      {
        companyId: 'app',
        role: LCPresentationRole.Applicant
      },
      { _id: 'lcid' } as any
    )
    expect(presentationTaskFactory.getTask).toBeCalled()
    expect(taskManager.createTask).toBeCalled()
  })

  it('process as applicant - null presentation', async () => {
    await processor.processEvent(
      null,
      {},
      {
        companyId: 'app',
        role: LCPresentationRole.Applicant
      },
      null
    )
    expect(presentationTaskFactory.getTask).toBeCalled()
    expect(taskManager.createTask).toBeCalled()
  })

  it('process as beneficiary', async () => {
    await processor.processEvent(
      {
        ...mockPresentation,
        stateHistory: [
          {
            toState: LCPresentationStatus.DocumentsPresented,
            performer: 'ben',
            date: new Date()
          }
        ],
        status: LCPresentationStatus.DocumentsCompliantByIssuingBank
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

  it('process as beneficiary - do not send docs to applicant', async () => {
    await processor.processEvent(
      {
        ...mockPresentation,
        stateHistory: [
          {
            toState: LCPresentationStatus.DocumentsPresented,
            performer: 'ben',
            date: new Date()
          },
          {
            toState: LCPresentationStatus.DocumentsCompliantByNominatedBank,
            performer: 'nominated',
            date: new Date()
          }
        ],
        status: LCPresentationStatus.DocumentsCompliantByIssuingBank
      },
      {},
      {
        companyId: 'ben',
        role: LCPresentationRole.Beneficiary
      },
      { _id: 'lcid' } as any
    )
    expect(docServiceClient.shareDocument).not.toBeCalled()
    expect(presentationNotificationProcessor.sendStateUpdatedNotification).toBeCalled()
  })

  it('process as beneficiary - null presentation', async () => {
    await processor.processEvent(
      null,
      {},
      {
        companyId: 'ben',
        role: LCPresentationRole.Beneficiary
      },
      null
    )
    expect(presentationNotificationProcessor.sendStateUpdatedNotification).toBeCalled()
  })

  it('process as beneficiary - share failed presentation', async () => {
    docServiceClient.shareDocument = jest.fn(() => {
      throw new Error('share doc failed')
    })

    const process = processor.processEvent(
      {
        ...mockPresentation,
        stateHistory: [
          {
            toState: LCPresentationStatus.DocumentsPresented,
            performer: 'ben',
            date: new Date()
          }
        ],
        status: LCPresentationStatus.DocumentsCompliantByIssuingBank
      },
      {},
      {
        companyId: 'ben',
        role: LCPresentationRole.Beneficiary
      },
      { _id: 'lcid' } as any
    )
    await expect(process).rejects.toThrow(new Error('share doc failed'))
  })
})
