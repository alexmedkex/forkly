import 'reflect-metadata'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'

const mockCompanyClient: ICompanyRegistryService = {
  getMember: jest.fn(id => Promise.resolve({ data: [{ x500Name: { CN: `company-${id}` } }] })),
  getNodeKeys: jest.fn(),
  getMembersByNode: jest.fn(),
  getMembers: jest.fn()
}

import { LCTaskFactory } from './LCTaskFactory'
import { LC_TASK_TYPE } from './LCTaskType'
import { LC_STATE } from '../events/LC/LCStates'

describe('LCTaskFactory', () => {
  let instance: LCTaskFactory
  const lc: any = {
    _id: '1',
    reference: 'LC-1234',
    applicantId: '1',
    issuingBankId: 'issBank',
    beneficiaryBankId: 'benBank'
  }

  beforeEach(() => {
    instance = new LCTaskFactory(mockCompanyClient)
  })

  it('should return ReviewLCApplication task', async () => {
    const task = await instance.getTask(LC_TASK_TYPE.ReviewLCApplication, lc)

    expect(task.task.taskType).toBe(LC_TASK_TYPE.ReviewLCApplication)
    expect(task.task.context.lcid).toBe(lc._id)
    expect(task.task.counterpartyStaticId).toBe('1')
  })

  it('should return getReviewIssuedLCTask (advised) for beneficiary', async () => {
    const lcData = {
      ...lc,
      status: LC_STATE.ADVISED
    }
    const task = await instance.getTask(LC_TASK_TYPE.ReviewIssuedLC, lcData)

    expect(task.task.taskType).toBe(LC_TASK_TYPE.ReviewIssuedLC)
    expect(task.task.context.lcid).toBe(lc._id)
    expect(mockCompanyClient.getMember).toHaveBeenCalledWith(lcData.beneficiaryBankId)

    expect(task.notification.message).toBe(`L/C advised by company-${lcData.beneficiaryBankId} (${lcData.reference})`)
  })

  it('should return getReviewIssuedLCTask (issued) for advBank', async () => {
    const lcData = {
      ...lc,
      status: LC_STATE.ISSUED
    }
    const task = await instance.getTask(LC_TASK_TYPE.ReviewIssuedLC, lcData)

    expect(task.task.taskType).toBe(LC_TASK_TYPE.ReviewIssuedLC)
    expect(task.task.context.lcid).toBe(lc._id)
    expect(mockCompanyClient.getMember).toHaveBeenCalledWith(lcData.issuingBankId)

    expect(task.notification.message).toBe(`L/C issued by company-${lcData.issuingBankId} (${lcData.reference})`)
  })

  it('should return getManagePresentation', async () => {
    const lcData = {
      ...lc,
      status: LC_STATE.ACKNOWLEDGED
    }
    const task = await instance.getTask(LC_TASK_TYPE.ManagePresentation, lcData)

    expect(task.task.taskType).toBe(LC_TASK_TYPE.ManagePresentation)
    expect(task.task.context.lcid).toBe(lc._id)

    expect(task.notification.message).toBe(`Manage collection of documents for presentation`)
  })
})
