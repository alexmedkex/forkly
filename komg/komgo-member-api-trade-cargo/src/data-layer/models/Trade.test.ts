import { buildFakeTrade } from '@komgo/types'
import { Trade } from './Trade'

const BUYER = 'BUYER'
const SELLER = 'SELLER'

const testTrade = buildFakeTrade({ buyer: BUYER, seller: SELLER })

describe('Trade', () => {
  it('is defined', () => {
    expect(Trade).toBeDefined()
  })

  it('build a trade', () => {
    const { source, sourceId, ...data } = testTrade
    expect(new Trade(source, sourceId, BUYER, data)).toMatchObject(testTrade)
  })

  it('build a trade with source, buyer/seller and sourceId', () => {
    const { source, sourceId } = testTrade
    expect(new Trade(source, sourceId, BUYER, { buyer: BUYER, seller: SELLER })).toMatchObject({ source, sourceId })
  })
})
