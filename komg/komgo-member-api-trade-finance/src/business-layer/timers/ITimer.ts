import { TimerDurationUnit, TimerType } from '@komgo/types'

export interface ICreateTimerRequest {
  timerType: string
  context?: object
  duration: IDurationRequest
  timerData: ITimerDataRequest[]
}

export interface IDurationRequest {
  duration: number
  unit: TimerDurationUnit
}
export interface ITimerRequest {
  timerType: TimerType
  duration: number
  unit: string
  context?: object
}

export interface ICreateTimerResponse {
  staticId: string
}

export interface ITimerDataRequest {
  time: Date
  payload?: any
}

export interface ITimerDataResponse {
  id?: string
  timerId?: string
  time: Date
  status?: string
  retry?: number
}

export interface ITimerResponse {
  submissionDateTime: Date
  status?: string
  timerData: ITimerDataResponse[]
}
