import { IAction } from '@komgo/types'
import Mongoose from 'mongoose'

export default interface IActionDocument extends Mongoose.Document, IAction {}
