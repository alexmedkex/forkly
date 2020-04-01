import { ICreateTimerRequest, ICreateTimerResponse, ITimerResponse } from './ITimer'

export interface ITimerServiceClient {
  saveTimer(timer: ICreateTimerRequest): Promise<ICreateTimerResponse>
  fetchTimer(staticId: string): Promise<ITimerResponse>
  deactivateTimer(staticId: string): Promise<void>
}
