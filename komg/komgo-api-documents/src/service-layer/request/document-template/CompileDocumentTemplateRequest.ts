import { IsDefined, IsString } from 'class-validator'

export class CompileDocumentTemplateRequest {
  @IsDefined()
  @IsString()
  templateId: string

  @IsDefined()
  fields: any
}
