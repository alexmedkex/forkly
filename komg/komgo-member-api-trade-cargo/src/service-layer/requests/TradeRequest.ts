import { Allow } from 'class-validator'

export class TradeRequest {
  @Allow()
  _id?: string | object

  @Allow()
  sourceId?: string | object

  @Allow()
  status?: string

  @Allow()
  source?: string

  @Allow()
  commodity?: string

  @Allow()
  seller?: string

  @Allow()
  sellerEtrmId?: string

  @Allow()
  buyer?: string

  @Allow()
  buyerEtrmId?: string

  @Allow()
  creditRequirement?: string

  @Allow()
  price?: string | object
}
