import {
  ITaskCreateRequest,
  ITask,
  ITaskUpdateStatusRequest,
  ITaskUpdateAssigneeRequest
} from '../../../service-layer/request/task'

export interface ITaskDataAgent {
  createTask(data: ITaskCreateRequest): Promise<ITask>
  getTask(id: string): Promise<ITask>
  getTasks(query: object): Promise<ITask[]>
  updateTaskAssignee(id: string, req: ITaskUpdateAssigneeRequest): Promise<ITask>
  updateTaskStatus(data: ITaskUpdateStatusRequest): Promise<ITask>
}
