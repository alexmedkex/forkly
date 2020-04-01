import { IDuration } from './IDuration'
import { ITimer } from './ITimer'
import { ITImerData } from './ITimerData'
import { TimerStatus } from './TimerStatus'
import { TimerType } from './TimerType'

export class Timer implements ITimer {
  readonly staticId?: string
  submissionDateTime: Date
  timerType: TimerType
  duration: IDuration
  timerData: ITImerData[]
  context: object
  status: TimerStatus

  constructor(
    submissionDateTime: Date,
    timerData: ITImerData[],
    context: object,
    duration: IDuration,
    timerType: TimerType
  ) {
    this.submissionDateTime = submissionDateTime
    this.timerData = timerData
    this.context = context
    this.status = TimerStatus.InProgress
    this.duration = duration
    this.timerType = timerType
  }
}
