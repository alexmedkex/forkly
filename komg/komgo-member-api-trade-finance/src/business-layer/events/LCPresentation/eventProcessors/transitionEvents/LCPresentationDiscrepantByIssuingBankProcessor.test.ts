import 'reflect-metadata'

import { LCPresentationDiscrepantByIssuingBankProcessor } from './LCPresentationDiscrepantByIssuingBankProcessor'
import { mockPresentation } from '../mock-data/LCPresentation'
import { ILCPresentationActionPerformer } from '../ILCPresentationActionPerformer'
import { LCPresentationRole } from '../../LCPresentationRole'
import { ILCPresentationTaskFactory } from '../../../../tasks/LCPresentationTaskFactory'
import { TaskStatus } from '@komgo/notification-publisher'
import { LCPresentationTaskType } from '../../../../tasks/LCPresentationTaskType'
import { ILCPresentationNotificationProcessor } from '../../../../tasks/LCPresentationNotificationProcessor'
import { LCPresentationStatus } from '@komgo/types'

const docServiceClient: any = {
  getDocuments: jest.fn(() => [{ id: 'docId' }]),
  shareDocument: jest.fn()
}
const docRequestBuilder: any = {
  getPresentationDocumentSearchContext: jest.fn()
}
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

const presentationNotificationProcessor: ILCPresentationNotificationProcessor = {
  sendStateUpdatedNotification: jest.fn()
}
const mockReviewService: any = {
  sendDocumentFeedback: jest.fn()
}

describe('LCPresentationDiscrepantByIssuingBankProcessor', () => {
  let processor: LCPresentationDiscrepantByIssuingBankProcessor

  beforeEach(() => {
    processor = new LCPresentationDiscrepantByIssuingBankProcessor(
      docServiceClient,
      docRequestBuilder,
      mockPresentationTaskFactory,
      mockTaskManager,
      presentationNotificationProcessor,
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

  it('should process as issuing bank', async () => {
    const performer: ILCPresentationActionPerformer = { companyId: 'someCompany', role: LCPresentationRole.IssuingBank }
    await processor.processEvent(mockPresentation, {}, performer, {} as any)

    expect(mockTaskManager.updateTaskStatus).toHaveBeenCalledWith(
      expect.objectContaining({ taskType: LCPresentationTaskType.ReviewPresentation })
    )
    expect(mockReviewService.sendDocumentFeedback).toHaveBeenCalledWith(mockPresentation)
  })

  it('should process for nominated bank', async () => {
    const performer: ILCPresentationActionPerformer = {
      companyId: 'someCompany',
      role: LCPresentationRole.NominatedBank
    }
    await processor.processEvent(mockPresentation, {}, performer, {} as any)
    expect(presentationNotificationProcessor.sendStateUpdatedNotification).toHaveBeenCalledWith(
      expect.objectContaining(mockPresentation),
      expect.any(Object),
      LCPresentationStatus.DocumentsDiscrepantByIssuingBank,
      LCPresentationRole.NominatedBank
    )
  })
})
