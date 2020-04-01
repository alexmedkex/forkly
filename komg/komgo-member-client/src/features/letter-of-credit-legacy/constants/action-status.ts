import { green, grey, violetBlue } from '../../../styles/colors'
import { TaskStatus } from '../../tasks/store/types'

export const ACTION_STATUS_TO_COLOR = {
  [TaskStatus.ToDo]: grey,
  [TaskStatus.InProgress]: violetBlue,
  [TaskStatus.Done]: green
}
