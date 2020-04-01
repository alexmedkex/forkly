import { ITimer } from '../models/ITimer'
import { TimerStatus } from '../models/TimerStatus'

export interface ITimerDataAgent {
  create(timer: ITimer): Promise<string>
  update(staticId: string, data: ITimer): Promise<void>
  delete(staticId: string): Promise<void>
  updateStatus(staticId: string, status: TimerStatus): Promise<void>
  get(staticId: string): Promise<ITimer>
  find(query: object, context: object, projection?: object, options?: object): Promise<ITimer[]>
  findOne(query: object)
  count(query?: object): Promise<number>
  updateField(staticId: string, field: string, value: any)
  updatePushArray(staticId: string, field: string, value: any)
}
