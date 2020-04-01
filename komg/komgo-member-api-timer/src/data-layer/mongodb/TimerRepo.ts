import { Document, Model, model } from 'mongoose'

import { ITimer } from '../models/ITimer'

import TimerSchema from './TimerSchema'

type TimerModel = ITimer & Document

export const TimerRepo: Model<TimerModel> = model<TimerModel>('timer', TimerSchema)
