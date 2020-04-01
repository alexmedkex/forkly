import 'reflect-metadata'

const loggerMock = {
  warn: jest.fn(),
  info: jest.fn()
}
const getLoggerMock = jest.fn(() => loggerMock)
jest.mock('@komgo/logging', () => ({
  getLogger: getLoggerMock
}))

import { LCPresentationSubmittedProcessor } from './LCPresentationSubmittedProcessor'
import { ILCPresentation } from '../../../../../data-layer/models/ILCPresentation'
import { LCPresentationRole } from '../../LCPresentationRole'
import { TaskStatus } from '@komgo/notification-publisher'
import { LC_TASK_TYPE } from '../../../../tasks/LCTaskType'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'

describe('LCPresentationSubmittedProcessor', () => {
  let processor: LCPresentationSubmittedProcessor

  const mockPresentation: Partial<ILCPresentation> = {
    beneficiaryId: 'ben',
    applicantId: 'app',
    issuingBankId: 'issuing',
    nominatedBankId: 'nominated',
    LCReference: 'lc-01',
    reference: 'lc-p-01',
    documents: [
      {
        documentId: 'docid',
        documentTypeId: 'q88',
        documentHash: 'hash',
        dateProvided: new Date()
      }
    ]
  }

  const docServiceClient: any = {
    getDocuments: jest.fn(() => [{ id: 'docId' }]),
    shareDocument: jest.fn()
  }
  const docRequestBuilder: any = {
    getPresentationDocumentSearchContext: jest.fn()
  }
  const presentationTaskFactory: ILCPresentationTaskFactory = {
    getTaskContext: jest.fn().mockReturnValue({ lcPresentationStaticId: mockPresentation.staticId }),
    getTask: jest.fn().mockReturnValue({
      task: { lcPresentationStaticId: mockPresentation.staticId },
      notification: { message: 'msg' }
    })
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
  const lcTaskFactory: any = {
    getTaskContext: jest.fn().mockReturnValue({ lcid: 'lc-01' })
  }
  const presentationNotificationProcessor: ILCPresentationNotificationProcessor = {
    sendStateUpdatedNotification: jest.fn()
  }

  beforeEach(() => {
    processor = new LCPresentationSubmittedProcessor(
      lcTaskFactory,
      docServiceClient,
      docRequestBuilder,
      presentationTaskFactory,
      taskManager,
      presentationNotificationProcessor
    )
  })

  describe('as beneficiary', () => {
    const process = async (presentation?) => {
      await processor.processEvent(
        (presentation || mockPresentation) as ILCPresentation,
        {},
        { companyId: 'ben', role: LCPresentationRole.Beneficiary },
        {} as any
      )
    }

    it('should process', async () => {
      await process()

      expect(docServiceClient.shareDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          documents: ['docId'],
          companies: ['nominated']
        })
      )

      expect(taskManager.updateTaskStatus).toHaveBeenCalled()
    })

    describe('no tasks to update', () => {
      const runNoTaskTest = (message, tasks) => {
        it(message, async () => {
          taskManager.getTasks.mockReturnValueOnce(tasks)

          await process()

          expect(taskManager.updateTaskStatus).not.toHaveBeenCalled()
        })
      }

      runNoTaskTest('should not update task if empty task list', [])
      runNoTaskTest('should not update task if no tasks', null)
    })

    it('should share with issuing bank if no nominated', async () => {
      const presentation = {
        ...mockPresentation,
        nominatedBankId: null
      }

      await process(presentation)

      expect(docServiceClient.shareDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          documents: ['docId'],
          companies: ['issuing']
        })
      )
    })
  })

  it('should process as reviewing bank', async () => {
    await processor.processEvent(
      mockPresentation as ILCPresentation,
      {},
      { companyId: 'nominated', role: LCPresentationRole.NominatedBank },
      {} as any
    )

    expect(taskManager.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ lcPresentationStaticId: mockPresentation.staticId }),
      'msg'
    )
  })

  it('shouldnt process of other party', async () => {
    await processor.processEvent(
      mockPresentation as ILCPresentation,
      {},
      { companyId: 'applicant', role: LCPresentationRole.Applicant },
      {} as any
    )

    expect(loggerMock.info).toHaveBeenCalledWith(`No handler for company role: APPLICANT`)
  })
})
