import { Document, Model, model } from 'mongoose'

import { ICargo } from '@komgo/types'

import CargoSchema from './CargoSchema'

type CargoModel = ICargo & Document

export const CargoRepo: Model<CargoModel> = model<CargoModel>('cargo', CargoSchema)
