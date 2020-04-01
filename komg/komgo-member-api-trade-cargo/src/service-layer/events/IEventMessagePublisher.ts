import { ITrade, ICargo } from '@komgo/types'

export interface IEventMessagePublisher {
  publishTradeUpdated(trade: ITrade): Promise<string>
  publishCargoUpdated(cargo: ICargo): Promise<string>
}
