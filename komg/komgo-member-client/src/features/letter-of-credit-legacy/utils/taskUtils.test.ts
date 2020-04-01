import { shouldBeHandle, resolveTaskTitle, resolveTaskTitleForLCPresentation } from './taskUtils'
import { LetterOfCreditTaskType } from '../constants/taskType'
import { Task, TaskContextType, TaskStatus } from '../../tasks/store/types'

describe('resolveTaskTitle', () => {
  it('returns a title based on task summary', () => {
    const str = LetterOfCreditTaskType.REVIEW_APPLICATION
    expect(resolveTaskTitle(str)).toEqual('Review LC application')
  })
  it('returns a title based on task summary', () => {
    const str = LetterOfCreditTaskType.REVIEW_APPLICATION_REFUSAL
    expect(resolveTaskTitle(str)).toEqual('Review LC application refusal')
  })
  it('returns a title based on task summary', () => {
    const str = LetterOfCreditTaskType.REVIEW_ISSUED
    expect(resolveTaskTitle(str)).toEqual('Review issued LC')
  })
  it('returns a title based on task summary', () => {
    const str = LetterOfCreditTaskType.REVIEW_ISSUED_REFUSAL
    expect(resolveTaskTitle(str)).toEqual('Review issued LC refusal')
  })
  it('returns a title based on task summary', () => {
    const str = LetterOfCreditTaskType.REVIEW_TRADE_DOCS
    expect(shouldBeHandle(str)).toBeUndefined()
  })
})

describe('resolveTaskTitleForLCPresentation', () => {
  it('returns a title', () => {
    const fakeTask1: Task = {
      _id: '123',
      summary: 'fake task',
      status: TaskStatus.ToDo,
      taskType: LetterOfCreditTaskType.REVIEW_PRESENTATION,
      actions: [] as string[],
      context: {
        type: TaskContextType.LCPresentation
      },
      assignee: '',
      createdAt: '',
      updatedAt: '',
      requiredPermission: {
        productId: 'tradeFinance',
        actionId: 'managePresentation'
      }
    }
    const fakeTask2 = {
      ...fakeTask1,
      _id: '124',
      context: {
        type: TaskContextType.LC
      }
    }
    const fakeTask3 = {
      ...fakeTask2,
      _id: '125',
      context: {
        type: TaskContextType.LCPresentation
      }
    }
    expect(resolveTaskTitleForLCPresentation([fakeTask1, fakeTask2, fakeTask3], fakeTask1)).toEqual(
      'Review presentation'
    )
  })
})
