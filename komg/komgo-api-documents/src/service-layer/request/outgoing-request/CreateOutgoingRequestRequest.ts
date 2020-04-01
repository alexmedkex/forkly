import { IsArray, IsDefined, IsOptional, IsDate } from 'class-validator'

import { Note } from './Note'

export class CreateOutgoingRequestRequest {
  @IsDefined()
  companyId: string

  @IsArray()
  types: string[]

  @IsOptional()
  @IsArray()
  forms?: string[]

  @IsOptional()
  @IsArray()
  notes?: Note[]

  @IsOptional()
  @IsDate()
  deadline?: Date
}
