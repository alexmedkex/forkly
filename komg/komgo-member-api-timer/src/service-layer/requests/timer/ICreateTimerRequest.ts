import { IDurationRequest } from './IDurationRequest'
import { ITimerDataRequest } from './ITimerDataRequest'

export interface ICreateTimerRequest {
  duration: IDurationRequest
  timerData: ITimerDataRequest[]
  context: any
}
