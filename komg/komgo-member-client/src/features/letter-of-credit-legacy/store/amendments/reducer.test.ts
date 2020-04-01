import reducer from './reducer'
import { LetterOfCreditAmendmentActionType } from './types'
import { buildFakeAmendment } from '@komgo/types'

describe('amendments reducer', () => {
  it('starts empty', () => {
    const state = reducer(undefined as any, { type: 'other' })

    expect(state).toMatchSnapshot()
  })
  it(`adds amendments from ${LetterOfCreditAmendmentActionType.GET_AMENDMENT_SUCCESS}`, () => {
    const state = reducer(undefined as any, {
      type: LetterOfCreditAmendmentActionType.GET_AMENDMENT_SUCCESS,
      payload: buildFakeAmendment()
    })

    expect(state).toMatchSnapshot()
  })
  it('merges a new amendment with existing amendments successfully', () => {
    const state = reducer(undefined as any, {
      type: LetterOfCreditAmendmentActionType.GET_AMENDMENT_SUCCESS,
      payload: buildFakeAmendment()
    })

    const newState = reducer(state, {
      type: LetterOfCreditAmendmentActionType.GET_AMENDMENT_SUCCESS,
      payload: buildFakeAmendment({ staticId: 'other' })
    })

    expect(newState).toMatchSnapshot()
  })
})
