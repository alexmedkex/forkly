import Mongoose from 'mongoose'

import { IReply } from './IReply'

export interface IReplyDocument extends Mongoose.Document, IReply {}
