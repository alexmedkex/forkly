import { IsAlphanumeric, IsOptional, ArrayNotEmpty, Validate, IsMongoId } from 'class-validator'
import { IsObject } from '../../validation/IsObject'

export class PostRawPrivateTransactionRequest {
  // Optional id field. If not specified an id will be generated
  // Reuse the same id to ensure idempotent transactions execution
  @IsMongoId()
  @IsOptional()
  id?: string

  data: string

  @ArrayNotEmpty()
  privateFor: string[]

  @IsAlphanumeric()
  @IsOptional()
  requestOrigin?: string

  @Validate(IsObject)
  context?: any

  // "to" field can be empty when deploying a new private smart contract
  to?: string
  gas?: number
}
