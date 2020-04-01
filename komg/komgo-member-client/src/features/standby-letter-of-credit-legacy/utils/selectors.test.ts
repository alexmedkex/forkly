import { findTasksByStandByLetterOfCreditAndStatuses } from './selectors'
import { fakeTask } from '../../letter-of-credit-legacy/utils/faker'
import { TaskStatus } from '../../tasks/store/types'

describe('findTasksByStandByLetterOfCredit()', () => {
  it('should return one task with sblcStaticId=123', () => {
    const tasks = [
      fakeTask({ context: { sblcStaticId: '123' } }),
      fakeTask({ context: { sblcStaticId: '1234' } }),
      fakeTask()
    ]
    expect(findTasksByStandByLetterOfCreditAndStatuses('123', tasks, [TaskStatus.ToDo, TaskStatus.InProgress])).toEqual(
      [tasks[0]]
    )
  })

  it('should return empty array when no task statuses are send', () => {
    const tasks = [
      fakeTask({ context: { sblcStaticId: '123' } }),
      fakeTask({ context: { sblcStaticId: '1234' } }),
      fakeTask()
    ]
    expect(findTasksByStandByLetterOfCreditAndStatuses('123', tasks, [])).toEqual([])
  })

  it('should return empty array when task with sblcStaticId=123 is done', () => {
    const tasks = [
      fakeTask({ context: { sblcStaticId: '123' }, status: TaskStatus.Done }),
      fakeTask({ context: { sblcStaticId: '1234' } }),
      fakeTask()
    ]
    expect(findTasksByStandByLetterOfCreditAndStatuses('123', tasks, [TaskStatus.ToDo, TaskStatus.InProgress])).toEqual(
      []
    )
  })

  it('should return empty array when there are not tasks with sblcStaticId=123', () => {
    const tasks = [
      fakeTask({ context: { sblcStaticId: '1234' } }),
      fakeTask({ context: { sblcStaticId: '1234' } }),
      fakeTask()
    ]
    expect(findTasksByStandByLetterOfCreditAndStatuses('123', tasks, [TaskStatus.ToDo, TaskStatus.InProgress])).toEqual(
      []
    )
  })
})
