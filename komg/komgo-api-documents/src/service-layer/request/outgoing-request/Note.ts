import { IsDefined, IsOptional } from 'class-validator'

export class Note {
  @IsDefined()
  date: Date

  @IsOptional()
  sender?: string

  @IsDefined()
  content: string
}
