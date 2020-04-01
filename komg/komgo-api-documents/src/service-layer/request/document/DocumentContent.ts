import { IsString, IsDefined } from 'class-validator'

export class DocumentContent {
  @IsString()
  @IsDefined()
  signature: string
  data: string
  fileId: string
  size: number
}
