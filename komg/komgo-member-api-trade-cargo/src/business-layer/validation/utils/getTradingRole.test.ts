import { getTradingRole } from './getTradingRole'
import { TradingRole } from '@komgo/types'
import { TradingRoleError } from '../errors'

const SELLER = 'SELLER'
const BUYER = 'BUYER'

describe('getTradingRole', () => {
  it('should return TradingRole.Purchase', () => {
    const result = getTradingRole(BUYER, SELLER, SELLER)

    expect(result).toEqual(TradingRole.Sale)
  })

  it('should return TradingRole.Sale', () => {
    const result = getTradingRole(BUYER, SELLER, BUYER)

    expect(result).toEqual(TradingRole.Purchase)
  })

  it('should return an error', () => {
    expect(() => {
      getTradingRole(BUYER, SELLER, undefined)
    }).toThrowError(TradingRoleError)
  })
})
