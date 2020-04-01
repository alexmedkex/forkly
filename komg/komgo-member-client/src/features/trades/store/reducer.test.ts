import reducer from './reducer'
import { TradeActionType, TradesReceivedAction, SortTrades, FilterTradingRole } from './types'
import { ASC, DESC, TradingRole } from '../constants'
import { fakeTrade, fakeLetterOfCredit, fakeTradeAndCargoSnapshot } from '../../letter-of-credit-legacy/utils/faker'
import {
  LetterOfCreditActionType,
  LetterOfCreditsReceivedAction,
  LetterOfCreditAction
} from '../../letter-of-credit-legacy/store/types'
import { ILetterOfCreditStatus } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { buildFakeStandByLetterOfCredit, StandbyLetterOfCreditStatus, TradeSource, ITrade } from '@komgo/types'
import { StandbyLetterOfCreditActionType } from '../../standby-letter-of-credit-legacy/store/types'

const exampleTrades: ITrade[] = [
  {
    ...fakeTrade(),
    source: TradeSource.Vakt,
    status: 'OK',
    sourceId: '100',
    buyer: 'bp',
    seller: 'field',
    _id: '123'
  },
  {
    ...fakeTrade(),
    source: TradeSource.Komgo,
    status: 'LOST',
    sourceId: '200',
    buyer: 'hp',
    seller: 'bp',
    _id: '234'
  },
  {
    ...fakeTrade(),
    source: TradeSource.Komgo,
    status: 'BURNT',
    sourceId: '50',
    buyer: 'fp',
    seller: 'garden',
    _id: '345'
  }
]

const exampleBasicMeta = {
  params: {
    filter: {
      projection: {},
      options: { sort: { dealDate: -1 } },
      query: { buyer: '00000000-000c-00da-00b0-000000000000' }
    }
  }
}

const exampleAction: TradesReceivedAction = {
  type: TradeActionType.TRADES_SUCCESS,
  payload: {
    limit: 5,
    skip: 1,
    total: exampleTrades.length,
    items: exampleTrades
  },
  meta: exampleBasicMeta
}

describe('trades reducer', () => {
  describe('TRADES_SUCCESS', () => {
    it('should have initial state of empty trades', () => {
      const action = { type: 'otherType' }

      const state = reducer(undefined as any, action)

      expect(state.get('tradeIds').size).toEqual(0)
      expect(state.get('trades').size).toEqual(0)
    })
    it('should update the trades list when a new trade comes in', () => {
      const state = reducer(undefined as any, exampleAction)

      expect(state.get('tradeIds').size).toEqual(exampleTrades.length)
      expect(state.get('tradeIds').get(0)).toEqual(exampleTrades[0]._id)
    })
    it('should update the trades map when a new trade comes in', () => {
      const state = reducer(undefined as any, exampleAction)

      expect(state.get('trades').size).toEqual(exampleTrades.length)
      expect(state.get('trades').toJS()['123']).toEqual(exampleTrades[0])
    })
    it('should not lose the existing trades from map when a new trade comes in', () => {
      const action1: TradesReceivedAction = {
        type: TradeActionType.TRADES_SUCCESS,
        payload: {
          limit: 5,
          skip: 1,
          total: 2,
          items: [
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'SHIPPED',
              sourceId: '303340',
              _id: '300'
            }
          ]
        },
        meta: exampleBasicMeta
      }

      const initialState = reducer(undefined as any, action1)

      const newState = reducer(initialState, exampleAction)

      expect(newState.get('trades').get('300')).not.toBeUndefined()
    })
    it('should only contain the list coming from the server in tradeIds', () => {
      const action1: TradesReceivedAction = {
        type: TradeActionType.TRADES_SUCCESS,
        payload: {
          limit: 5,
          skip: 1,
          total: 2,
          items: [
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'SHIPPED',
              sourceId: '300',
              _id: '345'
            }
          ]
        },
        meta: exampleBasicMeta
      }

      const initialState = reducer(undefined as any, action1)

      const newState = reducer(initialState, exampleAction)

      expect(newState.get('tradeIds').size).toBe(exampleTrades.length)
      expect(newState.get('tradeIds').get(0)).toBe('123')
      expect(newState.get('tradeIds').get(1)).toBe('234')
    })
    it('should not add the same trade twice to the reducer', () => {
      const action1: TradesReceivedAction = {
        type: TradeActionType.TRADES_SUCCESS,
        payload: {
          limit: 5,
          skip: 1,
          total: 2,
          items: [
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'SHIPPED',
              sourceId: '3',
              _id: '456'
            }
          ]
        },
        meta: exampleBasicMeta
      }

      const initialState = reducer(undefined as any, action1)

      const newState = reducer(initialState, action1)

      expect(newState.get('trades').size).toEqual(1)
    })
    it('should overwrite the old object with key A with the new object with key A', () => {
      const action1: TradesReceivedAction = {
        type: TradeActionType.TRADES_SUCCESS,
        payload: {
          limit: 5,
          skip: 1,
          total: 2,
          items: [
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'SHIPPED',
              sourceId: '3',
              _id: '456'
            }
          ]
        },
        meta: exampleBasicMeta
      }
      const action2: TradesReceivedAction = {
        type: TradeActionType.TRADES_SUCCESS,
        payload: {
          limit: 5,
          skip: 1,
          total: 2,
          items: [
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'RECEIVED',
              sourceId: '3',
              _id: '456'
            }
          ]
        },
        meta: exampleBasicMeta
      }

      const initialState = reducer(undefined as any, action1)

      const newState = reducer(initialState, action2)
      expect(newState.get('trades').toJS()[456].status).toEqual('RECEIVED')
    })
    it('should take ordering from action payload', () => {
      const newAction: TradesReceivedAction = {
        type: TradeActionType.TRADES_SUCCESS,
        payload: {
          limit: 5,
          skip: 1,
          total: 2,
          items: [
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'COMPLETE',
              sourceId: '12315',
              _id: '100'
            },
            exampleTrades[0],
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'COMPLETE',
              sourceId: '123151',
              _id: '200'
            },
            exampleTrades[1],
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'COMPLETE',
              sourceId: '3342',
              _id: '300'
            }
          ]
        },
        meta: exampleBasicMeta
      }

      const initialState = reducer(undefined as any, exampleAction)

      const newState = reducer(initialState, newAction)

      expect(newState.get('tradeIds').size).toBe(5)
      expect(newState.get('tradeIds').get(0)).toEqual('100')
      expect(newState.get('tradeIds').get(1)).toEqual(exampleTrades[0]._id)
      expect(newState.get('tradeIds').get(2)).toEqual('200')
      expect(newState.get('tradeIds').get(3)).toEqual(exampleTrades[1]._id)
      expect(newState.get('tradeIds').get(4)).toEqual('300')
    })

    it('unsets error', () => {
      const myError = new Error('some sort of error')
      const action = { type: TradeActionType.TRADE_FAILURE, payload: myError }

      const state = reducer(undefined as any, action)

      const newState = reducer(state, exampleAction)

      expect(newState.get('error')).toBeNull()
    })

    it('sets the total to the length of the "buyer" trades list ', () => {
      const state = reducer(undefined as any, exampleAction)
      expect(state.get('totals').toJS().buyer).toEqual(exampleTrades.length)
      expect(state.get('totals').toJS().seller).toBe(0)
    })

    it('sets the total to the length of the "buyer" trades list and still set the trades', () => {
      const state = reducer(undefined as any, exampleAction)

      expect(state.get('totals').toJS().buyer).toEqual(exampleTrades.length)
      expect(state.get('trades').size).toEqual(exampleTrades.length)
      expect(state.get('totals').toJS().seller).toBe(0)
    })

    it('sets the total to the length of the "seller" trades list and not change the trade state', () => {
      const newAction: TradesReceivedAction = {
        type: TradeActionType.TRADES_SUCCESS,
        payload: {
          limit: 5,
          skip: 1,
          total: 3,
          items: [
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'COMPLETE',
              sourceId: '12315',
              _id: '100'
            },
            exampleTrades[0],
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'COMPLETE',
              sourceId: '123151',
              _id: '200'
            },
            exampleTrades[1],
            {
              ...fakeTrade(),
              source: TradeSource.Vakt,
              status: 'COMPLETE',
              sourceId: '3342',
              _id: '300'
            }
          ]
        },
        meta: {
          params: {
            filter: {
              projection: { _id: 1 },
              options: { sort: { dealDate: -1 } },
              query: { seller: '00000000-000c-00da-00b0-000000000000' }
            }
          }
        }
      }

      const initialState = reducer(undefined as any, exampleAction)
      const newState = reducer(initialState, newAction)

      expect(newState.get('totals').toJS().buyer).toEqual(exampleAction.payload.items.length)
      expect(newState.get('totals').toJS().seller).toEqual(newAction.payload.total)
      expect(newState.get('trades').size).toEqual(exampleTrades.length)
    })
    it('can handle the case where there is no projection supplied', () => {
      const newAction: TradesReceivedAction = {
        type: TradeActionType.TRADES_SUCCESS,
        payload: {
          limit: 1,
          skip: 0,
          total: 0,
          items: []
        },
        meta: {
          params: {
            filter: {
              options: { sort: { dealDate: -1 } },
              query: { seller: '00000000-000c-00da-00b0-000000000000' }
            }
          }
        }
      }

      expect(() => reducer(undefined as any, newAction)).not.toThrow()
    })
  })
  describe('ERROR', () => {
    it('is initially null', () => {
      const action = { type: 'otherType' }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toBeNull()
    })
    it('sets the error on the state', () => {
      const myError = new Error('some sort of error')
      const action = { type: TradeActionType.TRADE_FAILURE, payload: myError }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toEqual(myError)
    })
    it(`sets error on ${TradeActionType.TRADES_FAILURE}`, () => {
      const myError = new Error('some sort of trades error')
      const action = { type: TradeActionType.TRADES_FAILURE, payload: myError }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toEqual(myError)
    })
    it(`sets error on ${TradeActionType.TRADE_MOVEMENTS_FAILURE}`, () => {
      const myError = new Error('some sort of movements error')
      const action = { type: TradeActionType.TRADE_MOVEMENTS_FAILURE, payload: myError }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toEqual(myError)
    })
    it('ignores an error from another feature', () => {
      const myError = new Error('some sort of other error')
      const action = { type: LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_FAILURE, payload: myError }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toBeNull()
    })
  })
  describe('SORT_TRADES', () => {
    it('sorts the etrmId in ascending order correctly', () => {
      const initialState = reducer(undefined as any, exampleAction)

      const sortAction: SortTrades = {
        type: TradeActionType.SORT_TRADES,
        payload: {
          column: 'sourceId',
          direction: ASC
        }
      }
      const state = reducer(initialState, sortAction)

      const sortedTradeIds = state.get('tradeIds')

      expect(sortedTradeIds.get(0)).toBe('345')
      expect(sortedTradeIds.get(1)).toBe('123')
      expect(sortedTradeIds.get(2)).toBe('234')
    })
    it('sorts the etrmId in descending order correctly', () => {
      const initialState = reducer(undefined as any, exampleAction)

      const sortAction: SortTrades = {
        type: TradeActionType.SORT_TRADES,
        payload: {
          column: 'sourceId',
          direction: DESC
        }
      }
      const state = reducer(initialState, sortAction)

      const sortedTradeIds = state.get('tradeIds')

      expect(sortedTradeIds.get(0)).toBe('234')
      expect(sortedTradeIds.get(1)).toBe('123')
      expect(sortedTradeIds.get(2)).toBe('345')
    })
    it('sorts the etrmId in descending order correctly', () => {
      const initialState = reducer(undefined as any, exampleAction)

      const sortAction: SortTrades = {
        type: TradeActionType.SORT_TRADES,
        payload: {
          column: 'sourceId',
          direction: DESC
        }
      }
      const state = reducer(initialState, sortAction)

      const sortedTradeIds = state.get('tradeIds')

      expect(sortedTradeIds.get(0)).toBe('234')
      expect(sortedTradeIds.get(1)).toBe('123')
      expect(sortedTradeIds.get(2)).toBe('345')
    })
    it('sorts the status in ascending order correctly', () => {
      const initialState = reducer(undefined as any, exampleAction)

      const sortAction: SortTrades = {
        type: TradeActionType.SORT_TRADES,
        payload: {
          column: 'status',
          direction: ASC
        }
      }
      const state = reducer(initialState, sortAction)

      const sortedTradeIds = state.get('tradeIds')

      expect(sortedTradeIds.get(0)).toBe('345')
      expect(sortedTradeIds.get(1)).toBe('234')
      expect(sortedTradeIds.get(2)).toBe('123')
    })
    it('sorts the status in descending order correctly', () => {
      const initialState = reducer(undefined as any, exampleAction)

      const sortAction: SortTrades = {
        type: TradeActionType.SORT_TRADES,
        payload: {
          column: 'status',
          direction: DESC
        }
      }
      const state = reducer(initialState, sortAction)

      const sortedTradeIds = state.get('tradeIds')

      expect(sortedTradeIds.get(0)).toBe('123')
      expect(sortedTradeIds.get(1)).toBe('234')
      expect(sortedTradeIds.get(2)).toBe('345')
    })
    it('sorts sellers in ascending order correctly', () => {
      const initialState = reducer(undefined as any, exampleAction)

      const sortAction: SortTrades = {
        type: TradeActionType.SORT_TRADES,
        payload: {
          column: 'seller',
          direction: ASC
        }
      }
      const state = reducer(initialState, sortAction)

      const sortedTradeIds = state.get('tradeIds')

      expect(sortedTradeIds.get(0)).toBe('234')
      expect(sortedTradeIds.get(1)).toBe('123')
      expect(sortedTradeIds.get(2)).toBe('345')
    })
    it('sorts buyers in descending order correctly', () => {
      const initialState = reducer(undefined as any, exampleAction)

      const sortAction: SortTrades = {
        type: TradeActionType.SORT_TRADES,
        payload: {
          column: 'buyer',
          direction: DESC
        }
      }

      const state = reducer(initialState, sortAction)

      const sortedTradeIds = state.get('tradeIds')

      expect(sortedTradeIds.get(0)).toBe('234')
      expect(sortedTradeIds.get(1)).toBe('345')
      expect(sortedTradeIds.get(2)).toBe('123')
    })
  })
  describe('FILTER_TRADING_ROLE', () => {
    it('filters for seller', () => {
      const initialState = reducer(undefined as any, exampleAction)

      // Filter trades where field is equal to value given
      const filterAction: FilterTradingRole = {
        type: TradeActionType.FILTER_TRADING_ROLE,
        payload: {
          role: TradingRole.SELLER,
          company: 'bp'
        }
      }

      const tradeIds = reducer(initialState, filterAction).get('tradeIds')

      expect(tradeIds.size).toEqual(1)
      expect(tradeIds.get(0)).toEqual('234')
    })
    it('filters for buyer', () => {
      const initialState = reducer(undefined as any, exampleAction)

      // Filter trades where field is equal to value given
      const filterAction: FilterTradingRole = {
        type: TradeActionType.FILTER_TRADING_ROLE,
        payload: {
          role: TradingRole.BUYER,
          company: 'bp'
        }
      }

      const tradeIds = reducer(initialState, filterAction).get('tradeIds')

      expect(tradeIds.size).toEqual(1)
      expect(tradeIds.get(0)).toEqual('123')
    })
  })
  it('adds status to trade from relevant LETTERS_OF_CREDIT_SUCCESS', () => {
    const initialState = reducer(undefined as any, exampleAction)

    const lettersFetchedAction: LetterOfCreditsReceivedAction = {
      type: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
      payload: [
        fakeLetterOfCredit({
          tradeAndCargoSnapshot: fakeTradeAndCargoSnapshot({ sourceId: '100' })
        })
      ]
    }

    const state = reducer(initialState, lettersFetchedAction)

    const tradeStatus = state.get('trades').toJS()['123'].status

    expect(tradeStatus).toEqual(ILetterOfCreditStatus.REQUESTED)
  })
  it('adds status to trade from latest matching LETTERS_OF_CREDIT_SUCCESS', () => {
    const initialState = reducer(undefined as any, exampleAction)

    const lettersFetchedAction: LetterOfCreditsReceivedAction = {
      type: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
      payload: [
        fakeLetterOfCredit({
          tradeAndCargoSnapshot: fakeTradeAndCargoSnapshot({ sourceId: '100' }),
          updatedAt: '2019-11-13T00:00:00.000Z',
          status: ILetterOfCreditStatus.ISSUED
        }),
        fakeLetterOfCredit({
          tradeAndCargoSnapshot: fakeTradeAndCargoSnapshot({ sourceId: '100' })
        })
      ]
    }

    const state = reducer(initialState, lettersFetchedAction)

    const tradeStatus = state.get('trades').toJS()['123'].status

    expect(tradeStatus).toEqual(ILetterOfCreditStatus.ISSUED)
  })
  it('does not add LC entries to the trades reducer when there is not already an associated trade', () => {
    const lettersFetchedAction: LetterOfCreditsReceivedAction = {
      type: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
      payload: [
        fakeLetterOfCredit({
          tradeAndCargoSnapshot: fakeTradeAndCargoSnapshot({ sourceId: '100', trade: fakeTrade({ _id: '123' }) })
        })
      ]
    }

    const state = reducer(undefined as any, lettersFetchedAction)

    const tradeStatus = state.get('trades').toJS()['123']

    expect(tradeStatus).toBeUndefined()
  })

  it('should update TradeState from LC', () => {
    const initialState = reducer(undefined as any, exampleAction)
    const tradeId = '123'
    const newState = reducer(initialState, {
      type: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
      payload: [
        fakeLetterOfCredit({
          status: ILetterOfCreditStatus.ISSUED,
          tradeAndCargoSnapshot: fakeTradeAndCargoSnapshot({ sourceId: '100', trade: fakeTrade({ _id: tradeId }) })
        })
      ]
    })

    const tradeStatus = newState.get('trades').toJS()[tradeId].status

    expect(tradeStatus).toBe(ILetterOfCreditStatus.ISSUED)
  })

  it('should update TradeState from SBLC', () => {
    const initialState = reducer(undefined as any, exampleAction)
    const tradeId = '123'
    const newState = reducer(initialState, {
      type: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS,
      payload: [
        buildFakeStandByLetterOfCredit({
          status: StandbyLetterOfCreditStatus.Issued,
          tradeId: { sourceId: tradeId, source: TradeSource.Komgo }
        })
      ]
    })

    const tradeStatus = newState.get('trades').toJS()[tradeId].status

    expect(tradeStatus).toBe(StandbyLetterOfCreditStatus.Issued)
  })

  it('should update TradeState with newer data', () => {
    const initialState = reducer(undefined as any, exampleAction)
    const tradeId = '123'
    const state1 = reducer(initialState, {
      type: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS,
      payload: [
        buildFakeStandByLetterOfCredit({
          status: StandbyLetterOfCreditStatus.Issued,
          updatedAt: new Date(2002, 1, 1).toISOString(),
          tradeId: { sourceId: tradeId, source: TradeSource.Komgo }
        })
      ]
    })

    const state2 = reducer(state1, {
      type: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
      payload: [
        fakeLetterOfCredit({
          status: ILetterOfCreditStatus.REQUEST_REJECTED,
          updatedAt: new Date(2001, 1, 1).toISOString(),
          tradeAndCargoSnapshot: fakeTradeAndCargoSnapshot({ sourceId: '100', trade: fakeTrade({ _id: tradeId }) })
        })
      ]
    })

    const tradeStatus = state2.get('trades').toJS()[tradeId].status

    expect(tradeStatus).toBe(StandbyLetterOfCreditStatus.Issued)
  })
})
