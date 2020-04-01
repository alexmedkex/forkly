import { IDuration } from './IDuration'
import { ITImerData } from './ITimerData'
import { TimerStatus } from './TimerStatus'
import { TimerType } from './TimerType'

/**
 * @tsoaModel
 */
export interface ITimer {
  readonly staticId?: string
  status?: TimerStatus
  timerType?: TimerType
  submissionDateTime: Date
  duration: IDuration
  timerData: ITImerData[]
  context: object
}
