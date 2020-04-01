import { ITask } from '../../request/task'
import { IUser } from '@komgo/types'

export interface ITaskResponse {
  task: ITask
  user?: IUser
}
