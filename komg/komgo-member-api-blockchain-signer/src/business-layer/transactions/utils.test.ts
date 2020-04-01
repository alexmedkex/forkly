import 'jest'
import 'reflect-metadata'

import { TransactionType } from '../../utils/Metrics'

import { IRawPrivateTx, IRawTx } from './models'
import { isPrivateTx, transactionTypeFor } from './utils'

const publicTx: IRawTx = {
  from: '0x0',
  value: '0x0',
  gas: 314159,
  gasPrice: '0x0',
  data: 'txData'
}

const privateTx: IRawPrivateTx = {
  ...publicTx,
  privateFor: ['0x0']
}

describe('utils.ts', () => {
  describe('isPrivateTx', () => {
    it('private transaction', () => {
      expect(isPrivateTx(privateTx)).toBe(true)
    })

    it('public transaction', () => {
      expect(isPrivateTx(publicTx)).toBe(false)
    })
  })

  describe('transactionTypeFor', () => {
    it('returns correct type for a public transaction', () => {
      expect(transactionTypeFor(privateTx)).toBe(TransactionType.Private)
    })

    it('returns correct type for a private transaction', () => {
      expect(transactionTypeFor(publicTx)).toBe(TransactionType.Public)
    })
  })
})
