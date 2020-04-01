import { ITimerExecutionLog } from './ITimerExecutionLog'
import { TimerDataStatus } from './TimerDataStatus'

/**
 * @tsoaModel
 */
export interface ITImerData {
  id?: string
  timerId?: string
  time: Date
  status?: TimerDataStatus
  retry?: number
  payload?: any
  executionLog?: ITimerExecutionLog[]
}
