import { TaskWithUser, TaskStatus, Task } from '../../tasks/store/types'
import { findTaskByCounterpartyStaticId, getCompanyName } from './selectors'
import { LetterOfCreditTaskType } from '../../letter-of-credit-legacy/constants/taskType'
import { fakeMember } from '../../letter-of-credit-legacy/utils/faker'

describe('findTaskByCounterpartyStaticId', () => {
  const context = {
    type: 'LC',
    id: '123',
    lcid: '123'
  }
  const task: Task = {
    _id: '123',
    summary: 'fake task',
    status: TaskStatus.ToDo,
    taskType: LetterOfCreditTaskType.REVIEW_APPLICATION,
    actions: [] as string[],
    context: {},
    assignee: '',
    counterpartyName: '(counterpartyName) remove it',
    requiredPermission: {
      productId: 'tradeFinance',
      actionId: 'read'
    },
    outcome: undefined,
    counterpartyStaticId: '12345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  const taskWithUser: TaskWithUser = {
    task,
    user: undefined
  }

  it('returns tasks of a given counterpartyStaticId', () => {
    expect(findTaskByCounterpartyStaticId([taskWithUser], '12345678')).toEqual(taskWithUser)
  })

  it('returns undefined of a given counterpartyStaticId', () => {
    expect(findTaskByCounterpartyStaticId([taskWithUser], '6543212')).toEqual(undefined)
  })
})

describe('getCompanyName', () => {
  const fakeCompany = fakeMember()

  it('should return appropriate company name', () => {
    expect(getCompanyName(fakeCompany)).toBe('Applicant Name')
  })

  it('should return default company name', () => {
    const company = { ...fakeCompany }
    delete company.x500Name
    expect(getCompanyName(company)).toBe('-')
  })

  it('should return default company name', () => {
    const company = { ...fakeCompany }
    delete company.x500Name
    expect(getCompanyName(company, 'No name')).toBe('No name')
  })

  it('should return default name when company does not exists', () => {
    expect(getCompanyName(undefined)).toBe('-')
  })
})
