import { IsAlphanumeric, IsOptional, Validate, IsMongoId } from 'class-validator'
import { IsObject } from '../../validation/IsObject'

export class PostRawTransactionRequest {
  // Optional id field. If not specified an id will be generated
  // Reuse the same id to ensure idempotent transactions execution
  @IsMongoId()
  @IsOptional()
  id?: string

  to: string
  value: string
  data: string

  @IsAlphanumeric()
  @IsOptional()
  requestOrigin?: string

  @Validate(IsObject)
  context?: any

  gas?: number
}
