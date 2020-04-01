import 'reflect-metadata'

const mockRepo = {
  findOneAndUpdate: jest.fn()
}

jest.mock('../../mongodb/counter/CounterRepo', () => ({
  CounterRepo: mockRepo
}))

import { CounterDataAgent } from './CounterDataAgent'
import { ICounter } from '../../models/ICounter'

const sampleCounter: ICounter = {
  type: 'lc',
  context: {},
  value: 2
}

describe('CounterDataAgent', () => {
  let dataAgent: CounterDataAgent

  beforeEach(() => {
    dataAgent = new CounterDataAgent()
    jest.resetAllMocks()
  })

  it('is defined', () => {
    expect(dataAgent).toBeDefined()
  })

  describe('getCounterAndUpdate', () => {
    it('should get and update the counter correctly', async () => {
      mockRepo.findOneAndUpdate.mockImplementation(() => {
        return sampleCounter
      })

      const result = await dataAgent.getCounterAndUpdate('lc', {})

      expect(result).toEqual(sampleCounter.value)
      expect(mockRepo.findOneAndUpdate).toHaveBeenCalledTimes(1)
      // expect(mockRepo.findOneAndUpdate).toHaveBeenCalledWith()
    })

    it('shouldn"t create an SBLC', async () => {
      const errorMessage = `invalid operation`
      const type = 'lc'
      const context = {}
      const expectedMessage = `Failed to get counter and update it ${type} ${context} ${errorMessage}`
      mockRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      await expect(dataAgent.getCounterAndUpdate('lc', {})).rejects.toThrowError(new Error(expectedMessage))
    })
  })
})
