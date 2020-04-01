import { Allow } from 'class-validator'

export class LCRequest {
  @Allow()
  _id?: string | object

  @Allow()
  tradeAndCargoSnapshot?: {
    trade?: {
      _id?: string | number | object
    }
  }

  @Allow()
  sourceId?: string | number | object

  @Allow()
  companyStaticId?: string

  @Allow()
  reference?: string
}
