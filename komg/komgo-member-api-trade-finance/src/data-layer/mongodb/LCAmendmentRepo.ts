import { Document, Model, model } from 'mongoose'
import { ILCAmendment } from '@komgo/types'

import { LCAmendmentSchema } from './LCAmendmentSchema'

export type LCAmendmentModel = ILCAmendment & Document

export const LCAmendmentRepo: Model<LCAmendmentModel> = model<LCAmendmentModel>('LCAmendment', LCAmendmentSchema)
