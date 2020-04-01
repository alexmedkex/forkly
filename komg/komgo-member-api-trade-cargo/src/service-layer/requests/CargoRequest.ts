import { Allow } from 'class-validator'

export class CargoRequest {
  @Allow()
  _id?: string | object

  @Allow()
  source?: string

  @Allow()
  sourceId?: string | object

  @Allow()
  status?: string

  @Allow()
  grade?: string
}
