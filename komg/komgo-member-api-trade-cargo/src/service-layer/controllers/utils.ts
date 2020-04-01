import { v4 as uuid4 } from 'uuid'
import { ITradeBase, ITrade } from '@komgo/types'

// TODO:  ignore Source and force to KOMGO
export const createTradeFromRequest = (trade: ITradeBase): ITradeBase & { sourceId: string } => ({
  ...trade,
  sourceId: uuid4()
})
