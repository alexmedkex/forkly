import { Document, Model, model } from 'mongoose'

import { IStandbyLetterOfCredit as ISBLC } from '@komgo/types'
import { SBLCSchema } from './SBLCSchema'

export type SBLCModel = ISBLC & Document

export type ISBLCRepo = Model<SBLCModel>

export const SBLCRepo: ISBLCRepo = model<SBLCModel>('SBLC', SBLCSchema)
