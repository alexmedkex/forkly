import { Task } from './store/types'
import { User } from '../../store/common/types'

export interface TaskComponent {
  task: Task
  assignedUser: User | null | undefined
}
