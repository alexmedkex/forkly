import 'reflect-metadata'

import { LCPresentationTaskFactory } from './LCPresentationTaskFactory'
import { LCPresentationTaskType } from './LCPresentationTaskType'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { TRADE_FINANCE_ACTION } from './permissions'

const mockCompanyService: any = {
  getMember: jest.fn(() => Promise.resolve({ data: [{ x500Name: { CN: 'test company' } }] }))
}

const mockPresentation: Partial<ILCPresentation> = {
  staticId: 'lcPresId',
  reference: '1234'
}

const mockLC: any = {
  _id: 'lcId'
}

describe('LCPresentationTaskFactory', () => {
  let taskFactory: LCPresentationTaskFactory

  beforeEach(() => {
    taskFactory = new LCPresentationTaskFactory(mockCompanyService)
  })

  it('should create PresentationReview task', async () => {
    const task = await taskFactory.getTask(
      LCPresentationTaskType.ReviewPresentation,
      mockPresentation as any,
      mockLC,
      TRADE_FINANCE_ACTION.ManagePresentation
    )

    expect(task).toBeDefined()
  })

  it('should create ReviewDiscrepantPresentation task', async () => {
    const task = await taskFactory.getTask(
      LCPresentationTaskType.ReviewDiscrepantPresentation,
      mockPresentation as ILCPresentation,
      mockLC,
      TRADE_FINANCE_ACTION.ManagePresentation
    )

    expect(task).toBeDefined()
  })
})
