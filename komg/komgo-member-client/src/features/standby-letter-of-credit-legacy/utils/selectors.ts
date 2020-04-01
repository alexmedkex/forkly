import { Task, TaskStatus } from '../../tasks/store/types'

export const findTasksByStandByLetterOfCreditAndStatuses = (
  letterId: string,
  tasks: Task[],
  statuses: TaskStatus[]
) => {
  return tasks.filter(task => task.context && task.context.sblcStaticId === letterId && statuses.includes(task.status))
}
