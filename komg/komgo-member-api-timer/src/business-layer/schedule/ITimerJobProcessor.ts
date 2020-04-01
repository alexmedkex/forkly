import { TIMER_JOB_TYPE } from './TimerJobType'

export interface ITimerJobProcessorBase {
  timerJobType: TIMER_JOB_TYPE
  executeJob(payload: any)
}

export interface ITimerJobProcessor<T> extends ITimerJobProcessorBase {
  executeJob(payload: T): Promise<boolean>
}
