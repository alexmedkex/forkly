import { Document, Model, model } from 'mongoose'

import { LetterOfCreditSchema } from './LetterOfCreditSchema'
import { ILetterOfCredit } from '@komgo/types'

export type LetterOfCreditModel = ILetterOfCredit<{}> & Document

export const LetterOfCreditRepo: Model<LetterOfCreditModel> = model<LetterOfCreditModel>(
  'LetterOfCredit',
  LetterOfCreditSchema
)
