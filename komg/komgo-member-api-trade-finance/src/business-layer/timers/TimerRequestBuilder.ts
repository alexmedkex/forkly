import { ILC } from '../../data-layer/models/ILC'
import { injectable } from 'inversify'
import { TIMER_PRODUCT, TIMER_SUB_PRODUCT } from './timerTypes'

export interface ITimerRequestBuilder {
  createLCTimerContext(lc: ILC)
}

@injectable()
export class TimerRequestBuilder implements ITimerRequestBuilder {
  createLCTimerContext(lc: ILC) {
    return {
      productId: TIMER_PRODUCT.TradeFinance,
      subProductId: TIMER_SUB_PRODUCT.LC,
      lcId: lc._id
    }
  }
}
