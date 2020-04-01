import { Task, TaskStatus } from '../../tasks/store/types'

export const findTaskStatusByLetterOfCreditId = (tasks: Task[] = [], staticId: string) => {
  const results: Task[] = tasks.filter((t: Task) => t.context.staticId === staticId && t.status !== TaskStatus.Done)
  return results.length > 0 ? TaskStatus.ToDo : TaskStatus.Done
}

export const findTasksByLetterOfCreditStaticId = (tasks: Task[] = [], staticId: string): Task[] => {
  return tasks.filter((t: Task) => t.context.staticId === staticId && t.status !== TaskStatus.Done)
}
