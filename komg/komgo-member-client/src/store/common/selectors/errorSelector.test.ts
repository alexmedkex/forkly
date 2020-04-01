import { findErrors } from './errorSelector'
import { buildFakeError } from '../faker'
import { fromJS } from 'immutable'

describe('errorSelector', () => {
  describe('defaults', () => {
    it('returns an empty list of errors', () => {
      const errors = fromJS({
        DO_SOMETHING_ELSE: buildFakeError()
      })
      expect(findErrors(errors, [])).toEqual([])
    })

    it('returns an error', () => {
      const DO_SOMETHING = 'DO_SOMETHING'
      const error = buildFakeError()
      const ACTIONS = [`${DO_SOMETHING}_REQUEST`]
      const errors = fromJS({
        [DO_SOMETHING]: error
      })
      expect(findErrors(errors, ACTIONS)).toEqual([error])
    })

    it('returns a list of errors', () => {
      const DO_SOMETHING = 'DO_SOMETHING'
      const DO_SOMETHING_ELSE = 'DO_SOMETHING_ELSE'
      const DO_SOMETHING_BAD = 'DO_SOMETHING_BAD'

      const doSomethingError = buildFakeError({ message: 'doSomething' })
      const doSomethingElseError = buildFakeError({ message: 'doSomethingElse' })
      const doSomethingBadError = buildFakeError({ message: 'doSomethingBad' })

      const ACTIONS = [`${DO_SOMETHING}_REQUEST`, `${DO_SOMETHING_ELSE}_REQUEST`]

      const errors = fromJS({
        [DO_SOMETHING]: doSomethingError,
        [DO_SOMETHING_ELSE]: doSomethingElseError,
        [DO_SOMETHING_BAD]: doSomethingBadError
      })

      expect(findErrors(errors, ACTIONS)).toEqual([doSomethingError, doSomethingElseError])
    })
  })
})
