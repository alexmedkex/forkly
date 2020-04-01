import 'reflect-metadata'

import { LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor } from './LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor'
import { mockPresentation } from '../../mock-data/LCPresentation'
import { ILCPresentationActionPerformer } from '../../ILCPresentationActionPerformer'
import { LCPresentationRole } from '../../../LCPresentationRole'
import { ILCPresentationTaskFactory } from '../../../../../tasks/LCPresentationTaskFactory'
import { TaskStatus } from '@komgo/notification-publisher'
import { LCPresentationTaskType } from '../../../../../tasks/LCPresentationTaskType'
import { ILCPresentationNotificationProcessor } from '../../../../../tasks/LCPresentationNotificationProcessor'
import { LCPresentationStatus } from '@komgo/types'

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

const mockTransactionManager: any = {
  deployAdviseDiscrepanciesAsNominatedBank: jest.fn()
}

const presentationNotificationProcessor: ILCPresentationNotificationProcessor = {
  sendStateUpdatedNotification: jest.fn()
}

describe('LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor', () => {
  let processor: LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor

  beforeEach(() => {
    processor = new LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor(
      null,
      null,
      mockPresentationTaskFactory,
      mockTaskManager,
      presentationNotificationProcessor,
      mockTransactionManager
    )
  })

  it('should process as nominated bank', async () => {
    const performer: ILCPresentationActionPerformer = {
      companyId: 'someCompany',
      role: LCPresentationRole.NominatedBank
    }
    await processor.processEvent(mockPresentation, {}, performer, {} as any)

    expect(mockTaskManager.updateTaskStatus).toHaveBeenCalled()
    expect(mockTransactionManager.deployAdviseDiscrepanciesAsNominatedBank).toHaveBeenCalled()
  })

  it('should process as beneficiary', async () => {
    const performer: ILCPresentationActionPerformer = { companyId: 'someCompany', role: LCPresentationRole.Beneficiary }
    await processor.processEvent(mockPresentation, {}, performer, {} as any)

    expect(presentationNotificationProcessor.sendStateUpdatedNotification).toHaveBeenCalledWith(
      expect.objectContaining(mockPresentation),
      expect.any(Object),
      LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank,
      LCPresentationRole.Beneficiary
    )
  })
})
