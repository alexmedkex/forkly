import { buildFakeStandByLetterOfCredit } from '@komgo/types'
import reducer, { initialState } from './reducer'
import { StandbyLetterOfCreditActionType } from './types'
import { fromJS } from 'immutable'

describe('StandByLetterOfCredit Reducer', () => {
  const standByLettersOfCredits = [
    buildFakeStandByLetterOfCredit({ staticId: '123' }),
    buildFakeStandByLetterOfCredit({ staticId: '1234' })
  ]

  it('should return default state', () => {
    const expected = initialState
    const invalidAction = { type: 'FOO', payload: ['bar'] }
    const actual = reducer(initialState, invalidAction)
    expect(actual).toEqual(expected)
  })

  describe('FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS', () => {
    it('should store sblc in state when previous state was default', () => {
      const action = {
        type: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS,
        payload: { total: 2, items: standByLettersOfCredits, limit: 200, skip: 0 }
      }

      const expectedState = fromJS({
        byId: fromJS({
          [standByLettersOfCredits[0].staticId]: standByLettersOfCredits[0],
          [standByLettersOfCredits[1].staticId]: standByLettersOfCredits[1]
        }),
        ids: fromJS([standByLettersOfCredits[0].staticId, standByLettersOfCredits[1].staticId]),
        total: 2
      })

      const receivedState = reducer(initialState, action)

      expect(receivedState).toEqual(expectedState)
    })
    it('should match snapshot', () => {
      const action = {
        type: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS,
        payload: { total: 2, items: standByLettersOfCredits, limit: 200, skip: 0 }
      }
      const receivedState = reducer(initialState, action)
      expect(receivedState).toMatchSnapshot()
    })
  })

  describe('GET_STANDBY_LETTER_OF_CREDIT_SUCCESS', () => {
    it('should store sblc in state when previous state was default', () => {
      const action = {
        type: StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_SUCCESS,
        payload: standByLettersOfCredits[0]
      }

      const expectedState = fromJS({
        byId: fromJS({
          [standByLettersOfCredits[0].staticId]: standByLettersOfCredits[0]
        }),
        ids: [],
        total: 0
      })

      const receivedState = reducer(initialState, action)

      expect(receivedState).toEqual(expectedState)
    })
    it('should match snapshot', () => {
      const action = {
        type: StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_SUCCESS,
        payload: standByLettersOfCredits[0]
      }
      const receivedState = reducer(initialState, action)
      expect(receivedState).toMatchSnapshot()
    })
  })
})
