import { IsDefined, IsString } from 'class-validator'
import 'reflect-metadata'

export class FeatureEntity {
  @IsDefined()
  @IsString()
  productName: string

  @IsDefined()
  @IsString()
  productId: string
}
