import * as jestMock from 'jest-mock'
import mockingoose from 'mockingoose'
import 'reflect-metadata'

import LastProcessedBlockDataAgent from './LastProcessedBlockDataAgent'
import BlockNumberNotFoundError from './errors/BlockNumberNotFoundError'

describe('LastProcessedBlockDataAgent', () => {
  let lastProcessedBlockDataAgent

  beforeEach(() => {
    lastProcessedBlockDataAgent = new LastProcessedBlockDataAgent()
  })

  it('should return empty array', async () => {
    mockingoose['last-processed-block'].toReturn([], 'findOne')

    const result = await lastProcessedBlockDataAgent.getLastProcessedBlock()
    expect(result).toEqual([])
  })

  it('should return BlockNumberNotFoundError', async () => {
    mockingoose['last-processed-block'].toReturn(null, 'findOne')

    const call = lastProcessedBlockDataAgent.getLastProcessedBlock()
    await expect(call).rejects.toThrowError(BlockNumberNotFoundError)
  })

  it('should set value', async () => {
    mockingoose['last-processed-block'].toReturn({ lastProcessedBlock: 2 }, 'findOneAndUpdate')

    const result = await lastProcessedBlockDataAgent.setLastProcessedBlock(2)
    expect(result.toJSON()).toEqual({ lastProcessedBlock: 2 })
  })
  it('should return BlockNumberNotFoundError', async () => {
    mockingoose['last-processed-block'].toReturn(null, 'findOneAndUpdate')

    const call = lastProcessedBlockDataAgent.setLastProcessedBlock(2)
    await expect(call).rejects.toThrowError(BlockNumberNotFoundError)
  })
})
