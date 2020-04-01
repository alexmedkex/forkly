import reducer, { initialReceivableDiscountingApplicationState } from './reducer'
import { ReceivableDiscountingApplicationActionType, ReceivableDiscountingApplicationAction } from './types'
import { IReceivablesDiscounting, InvoiceType } from '@komgo/types'
import { fakeRdInfo } from '../../utils/faker'
import { fromJS } from 'immutable'

describe('Receivable discounting reducer', () => {
  describe('defaults', () => {
    it('returns the initial state', () => {
      expect(reducer(undefined as any, { type: 'NONE' })).toMatchSnapshot()
    })
  })

  describe(ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_FAILURE, () => {
    it(`sets error on ${ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_FAILURE}`, () => {
      const action = {
        type: ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_FAILURE,
        payload: 'hi'
      }
      const state = reducer(undefined as any, action)
      expect(state.get('error')).toEqual('hi')
    })
  })

  describe(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_SUCCESS, () => {
    it('adds the response payload to the state by ID', () => {
      const payload = { rd: { staticId: 'rdStaticId' } } as any
      const action: ReceivableDiscountingApplicationAction = {
        type: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_SUCCESS,
        payload
      }
      const state = reducer(undefined as any, action)
      expect(state.get('byId').toJS()).toEqual(
        expect.objectContaining({
          [payload.rd.staticId]: payload
        })
      )
    })
  })

  describe(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_SUCCESS, () => {
    it('adds rd data history', () => {
      const action: ReceivableDiscountingApplicationAction = {
        type: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_SUCCESS,
        payload: {
          id: 'rdId',
          historyEntry: {
            invoiceAmount: [
              { updatedAt: '2019-05-19T13:00:00Z', value: 1000 },
              { updatedAt: '2019-05-20T14:00:00Z', value: 1100 }
            ],
            invoiceType: [
              { updatedAt: '2019-05-19T13:00:00Z', value: InvoiceType.Final },
              { updatedAt: '2019-05-20T14:00:00Z', value: InvoiceType.Indicative }
            ]
          }
        },
        rdId: '123'
      }

      const state = reducer(undefined as any, action) as any

      expect(state.get('historyById').toJS()).toEqual({
        [action.rdId]: action.payload
      })
    })
  })

  describe('errors', () => {
    it(`sets error on ${ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_FAILURE}`, () => {
      const action = {
        type: ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_FAILURE,
        payload: 'hi'
      }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toEqual('hi')
    })
  })
})
