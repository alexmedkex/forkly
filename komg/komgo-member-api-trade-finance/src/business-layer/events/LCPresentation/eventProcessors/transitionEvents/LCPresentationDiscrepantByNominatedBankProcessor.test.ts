import 'reflect-metadata'

import { LCPresentationDiscrepantByNominatedBankProcessor } from './LCPresentationDiscrepantByNominatedBankProcessor'
import { mockPresentation } from '../mock-data/LCPresentation'
import { ILCPresentationActionPerformer } from '../ILCPresentationActionPerformer'
import { LCPresentationRole } from '../../LCPresentationRole'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'
import { TaskStatus } from '@komgo/notification-publisher'
import { LC_TASK_TYPE } from '../../../../tasks/LCTaskType'
import { LCPresentationTaskType } from '../../../../tasks/LCPresentationTaskType'

const mockTaskManager: any = {
  getTasks: jest.fn().mockReturnValue([
    {
      status: TaskStatus.ToDo,
      taskType: LCPresentationTaskType.ReviewPresentation,
      context: 'lccontext'
    }
  ]),
  updateTaskStatus: jest.fn(),
  createTask: jest.fn()
}
const mockPresentationTaskFactory: ILCPresentationTaskFactory = {
  getTaskContext: jest.fn().mockReturnValue({ lcPresentationStaticId: mockPresentation.staticId }),
  getTask: jest.fn().mockImplementation(taskType => ({
    task: { taskType, lcPresentationStaticId: mockPresentation.staticId },
    notification: { message: 'msg' }
  }))
}

const mockReviewService: any = {
  sendDocumentFeedback: jest.fn()
}

describe('LCPresentationDiscrepantByNominatedBankProcessor', () => {
  let processor: LCPresentationDiscrepantByNominatedBankProcessor

  beforeEach(() => {
    processor = new LCPresentationDiscrepantByNominatedBankProcessor(
      null,
      null,
      mockPresentationTaskFactory,
      mockTaskManager,
      null,
      mockReviewService
    )
  })

  it('should create task for beneficiary', async () => {
    const performer: ILCPresentationActionPerformer = { companyId: 'someCompany', role: LCPresentationRole.Beneficiary }
    await processor.processEvent(mockPresentation, {}, performer, {} as any)

    expect(mockTaskManager.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskType: LCPresentationTaskType.ReviewDiscrepantPresentation }),
      expect.any(String)
    )
  })

  it('should process for nominated bank', async () => {
    const performer: ILCPresentationActionPerformer = {
      companyId: 'someCompany',
      role: LCPresentationRole.NominatedBank
    }
    await processor.processEvent(mockPresentation, {}, performer, {} as any)

    expect(mockTaskManager.updateTaskStatus).toHaveBeenCalled()
    expect(mockReviewService.sendDocumentFeedback).toHaveBeenCalled()
  })
})
