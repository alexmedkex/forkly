import 'jest'
import 'reflect-metadata'

import { AddrIndex } from '../models/addr-index'

import AddrIndexDataAgent from './AddrIndexDataAgent'

describe('AddrIndexDataAgent', () => {
  describe('findAndUpdateIndex()', () => {
    it('return addrIndex', async () => {
      const addrIndexDataAgent = new AddrIndexDataAgent()
      AddrIndex.findOneAndUpdate = jest.fn()
      await addrIndexDataAgent.findAndUpdateIndex('test')
      expect(AddrIndex.findOneAndUpdate).toHaveBeenCalledWith(
        { mnemonicHash: 'test' },
        { $inc: { addrIndex: 1 } },
        { new: true, upsert: true }
      )
    })
  })
})
