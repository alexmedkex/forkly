import { errorReducer } from './errors'
import { ErrorsState, ServerError } from '../types'
import { ApiAction } from '../../../utils/http'
import { fromJS, Map } from 'immutable'
import { buildFakeError } from '../faker'

describe('errorReducer', () => {
  let subject: ErrorsState

  describe('defaults', () => {
    it('returns initialState', () => {
      const actionMock: ApiAction = { type: 'type' }
      subject = errorReducer(undefined, actionMock)
      expect(subject).toEqual(
        fromJS({
          byAction: Map()
        })
      )
    })
  })

  describe('*_FAILURE', () => {
    describe('register an error of a given action', () => {
      it('not initialized state', () => {
        const action = 'DO_SOMETHING'
        const error: ServerError = buildFakeError()
        const actionMock: ApiAction = {
          type: `${action}_FAILURE`,
          error
        }
        subject = errorReducer(undefined, actionMock)
        expect(subject).toEqual(
          fromJS({
            byAction: { [action]: error }
          })
        )
      })
      it('initialized state', () => {
        const action = 'DO_SOMETHING'
        const error: ServerError = {
          message: 'message',
          errorCode: 'E001',
          requestId: 'abc-123',
          origin: 'test'
        }
        const actionMock: ApiAction = {
          type: `${action}_FAILURE`,
          error
        }
        const initialState: ErrorsState = fromJS({
          byAction: {
            DO_SOMETHING_ELSE: buildFakeError({ message: 'something else' })
          }
        })
        subject = errorReducer(initialState, actionMock)
        expect(subject).toEqual(
          initialState.mergeDeep(
            fromJS({
              byAction: { [action]: error }
            })
          )
        )
      })
    })
  })

  describe('*_SUCCESS', () => {
    describe('clear errors of a given action', () => {
      it('not initialized state', () => {
        const action = 'DO_SOMETHING'
        const error: ServerError = buildFakeError()
        const actionMock: ApiAction = {
          type: `${action}_SUCCESS`,
          error
        }
        subject = errorReducer(undefined, actionMock)
        expect(subject).toEqual(
          fromJS({
            byAction: {}
          })
        )
      })

      it('initialized state', () => {
        const action = 'DO_SOMETHING'
        const error: ServerError = {
          message: 'message',
          errorCode: 'E001',
          requestId: 'abc-123',
          origin: 'test'
        }
        const actionMock: ApiAction = {
          type: `${action}_SUCCESS`,
          error
        }
        const initialState: ErrorsState = fromJS({
          byAction: {
            [action]: buildFakeError({ message: 'something else' })
          }
        })
        subject = errorReducer(initialState, actionMock)
        expect(subject).toEqual(
          fromJS({
            byAction: {}
          })
        )
      })
    })
  })

  describe('*_CLEAR_ERROR', () => {
    describe('clear errors of a given action', () => {
      it('not initialized state', () => {
        const action = 'DO_SOMETHING'
        const error: ServerError = buildFakeError()
        const actionMock: ApiAction = {
          type: `${action}_CLEAR_ERROR`,
          error
        }
        subject = errorReducer(undefined, actionMock)
        expect(subject).toEqual(
          fromJS({
            byAction: {}
          })
        )
      })

      it('initialized state', () => {
        const action = 'DO_SOMETHING'
        const error: ServerError = {
          message: 'message',
          errorCode: 'E001',
          requestId: 'abc-123',
          origin: 'test'
        }
        const actionMock: ApiAction = {
          type: `${action}_CLEAR_ERROR`,
          error
        }
        const initialState: ErrorsState = fromJS({
          byAction: {
            [action]: buildFakeError({ message: 'something else' })
          }
        })
        subject = errorReducer(initialState, actionMock)
        expect(subject).toEqual(
          fromJS({
            byAction: {}
          })
        )
      })
    })
  })
})
