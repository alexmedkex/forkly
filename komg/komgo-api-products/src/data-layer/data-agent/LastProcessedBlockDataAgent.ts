import { injectable } from 'inversify'

import ILastProcessedBlockDocument from '../models/ILastProcessedBlockDocument'
import { LastProcessedBlock } from '../models/LastProcessedBlock'

import BlockNumberNotFoundError from './errors/BlockNumberNotFoundError'

export interface ILastProcessedBlockDataAgent {
  getLastProcessedBlock(): Promise<ILastProcessedBlockDocument>
  setLastProcessedBlock(block: number): Promise<ILastProcessedBlockDocument>
}

@injectable()
export default class LastProcessedBlockDataAgent implements ILastProcessedBlockDataAgent {
  async getLastProcessedBlock(): Promise<ILastProcessedBlockDocument> {
    const result = await LastProcessedBlock.findOne().exec()
    if (!result) {
      throw new BlockNumberNotFoundError('Last processed block not found')
    }
    return result
  }

  async setLastProcessedBlock(block: number): Promise<ILastProcessedBlockDocument> {
    const result = await LastProcessedBlock.findOneAndUpdate(
      {},
      { $set: { lastProcessedBlock: block } },
      { new: true }
    ).exec()
    if (!result) {
      throw new BlockNumberNotFoundError('Last processed block not found')
    }
    return result
  }
}
