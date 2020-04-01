import { loadingSelector } from './selectors'
import { Map } from 'immutable'
import { CounterpartiesActionType } from '../../features/counterparties/store/types'
import { TradeActionType } from '../../features/trades/store/types'
import { MemberActionType } from '../../features/members/store/types'
import { TaskManagementActionType } from '../../features/tasks/store/types'
import { LetterOfCreditActionType } from '../../features/letter-of-credit-legacy/store/types'

let requests: Map<string, boolean>

describe('loadingSelector', () => {
  beforeAll(() => {
    requests = Map()
  })
  describe('initially', () => {
    it('returns true (so it says things are loading)', () => {
      const result = loadingSelector(requests, [CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST])

      expect(result).toEqual(true)
    })
  })
  describe('during a relevant API call', () => {
    beforeAll(() => {
      requests = Map({
        ['@@counterparties/FETCH_CONNECTED_COUNTERPARTIES']: true
      })
    })
    it('returns true', () => {
      const result = loadingSelector(requests, [CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST])

      expect(result).toEqual(true)
    })
  })
  describe('after all relevant API calls have completed', () => {
    beforeAll(() => {
      requests = Map({
        ['@@counterparties/FETCH_CONNECTED_COUNTERPARTIES']: false
      })
    })
    it('returns false', () => {
      const result = loadingSelector(requests, [CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST])

      expect(result).toEqual(false)
    })
    it('returns false with the alternate action', () => {
      const result = loadingSelector(requests, [CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_SUCCESS])

      expect(result).toEqual(false)
    })
  })
  describe('with no API calls specified in selector', () => {
    beforeAll(() => {
      requests = Map({
        ['@@counterparties/FETCH_CONNECTED_COUNTERPARTIES']: true,
        ['@@trades/TRADE']: true
      })
    })
    it('returns false (nothing is loading)', () => {
      const result = loadingSelector(requests, [])

      expect(result).toEqual(false)
    })
  })
  describe('with more than one API call', () => {
    beforeAll(() => {
      requests = Map({
        ['@@counterparties/FETCH_CONNECTED_COUNTERPARTIES']: false,
        ['@@trades/TRADE']: false
      })
    })
    it('returns false if nothing is loading', () => {
      const result = loadingSelector(requests, [
        CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
        TradeActionType.TRADE_REQUEST
      ])

      expect(result).toEqual(false)
    })
    it('returns true if something is loading', () => {
      const result = loadingSelector(requests.set('@@trades/TRADE', true), [
        CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
        TradeActionType.TRADE_REQUEST
      ])

      expect(result).toEqual(true)
    })
    it('returns true if everything is loading', () => {
      const result = loadingSelector(
        requests.set('@@trades/TRADE', true).set('CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES', true),
        [CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST, TradeActionType.TRADE_REQUEST]
      )

      expect(result).toEqual(true)
    })

    it('returns false if something irrelevant is loading', () => {
      const result = loadingSelector(requests.set('@@trades/TRADE', true), [
        CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST
      ])

      expect(result).toEqual(false)
    })
  })
  it(`matches ${TradeActionType.TRADE_MOVEMENTS_REQUEST}`, () => {
    const result = loadingSelector(requests.set('@@trades/TRADE_MOVEMENTS', true), [
      TradeActionType.TRADE_MOVEMENTS_REQUEST
    ])

    expect(result).toEqual(true)
  })
  it('returns false when all letter of credit application functions have loaded', () => {
    requests = Map({
      ['@@members/FETCH_MEMBERS']: false,
      ['@@counterparties/FETCH_CONNECTED_COUNTERPARTIES']: false,
      ['@@trades/TRADE']: false,
      ['@@trades/TRADE_MOVEMENTS']: false
    })
    const result = loadingSelector(requests, [
      TradeActionType.TRADE_REQUEST,
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
      MemberActionType.FetchMembersRequest,
      TradeActionType.TRADE_MOVEMENTS_REQUEST
    ])

    expect(result).toEqual(false)
  })
  it('returns false when all letter of credit view functions have loaded', () => {
    requests = Map({
      ['@@members/FETCH_MEMBERS']: false,
      ['@@counterparties/FETCH_CONNECTED_COUNTERPARTIES']: false,
      ['@@tasks/TASKS']: false,
      ['@@letters-of-credit/LETTER_OF_CREDIT']: false
    })
    const result = loadingSelector(requests, [
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
      TaskManagementActionType.TASKS_REQUEST,
      LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST,
      MemberActionType.FetchMembersRequest
    ])
    expect(result).toEqual(false)
  })
})
