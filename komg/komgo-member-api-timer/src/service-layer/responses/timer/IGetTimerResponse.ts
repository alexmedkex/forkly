import { IDuration } from '../../../data-layer/models/IDuration'
import { ITImerData } from '../../../data-layer/models/ITimerData'
import { TimerStatus } from '../../../data-layer/models/TimerStatus'
import { TimerType } from '../../../data-layer/models/TimerType'

export interface IGetTimerResponse {
  staticId?: string
  status?: TimerStatus
  timerType?: TimerType
  submissionDateTime: Date
  duration: IDuration
  timerData: ITImerData[]
  context: any
}
