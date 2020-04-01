import { ILC } from '../../data-layer/models/ILC'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { ITimerResponse } from '../../business-layer/timers/ITimer'

export interface ILCResponse extends ILC {
  presentations?: ILCPresentation[]
  timer?: ITimerResponse
}
