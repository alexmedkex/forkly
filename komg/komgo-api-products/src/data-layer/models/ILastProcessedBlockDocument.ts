import * as mongoose from 'mongoose'

import ILastProcessedBlock from './ILastProcessedBlock'

export default interface ILastProcessedBlockDocument extends mongoose.Document, ILastProcessedBlock {}
