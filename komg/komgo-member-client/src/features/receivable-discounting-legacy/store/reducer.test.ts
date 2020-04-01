import { ParticipantRFPStatus, ITradeSnapshot, IHistory } from '@komgo/types'
import { fakeRFPReply, fakeITradeSnapshotHistory } from '../utils/faker'
import reducer from './reducer'
import { ReceivableDiscountingAction, ReceivableDiscountingActionType } from './types'

describe('Receivable discounting reducer', () => {
  describe('defaults', () => {
    it('returns the initial state', () => {
      expect(reducer(undefined as any, { type: 'NONE' })).toMatchSnapshot()
    })
  })

  describe(ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_SUCCESS, () => {
    it('adds quotes to the existing rd', () => {
      const fakeRFPRequestSummary = {
        status: ParticipantRFPStatus.QuoteAccepted,
        participantStaticId: 'x',
        replies: [fakeRFPReply()]
      }
      const action: ReceivableDiscountingAction = {
        type: ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_SUCCESS,
        payload: { summaries: [fakeRFPRequestSummary] },
        rdId: '123'
      }

      const state = reducer(undefined as any, action) as any

      expect(state.get('rfpSummariesByRdId').toJS()).toEqual({
        '123': [fakeRFPRequestSummary]
      })
    })
  })

  describe(ReceivableDiscountingActionType.FETCH_TRADE_HISTORY_SUCCESS, () => {
    it('fetches the trade history', () => {
      const fakeTradeHistory = fakeITradeSnapshotHistory()
      const action: ReceivableDiscountingAction = {
        type: ReceivableDiscountingActionType.FETCH_TRADE_HISTORY_SUCCESS,
        payload: fakeTradeHistory as IHistory<ITradeSnapshot>,
        sourceId: '123'
      }

      const state = reducer(undefined as any, action) as any

      expect(state.get('tradeSnapshotHistoryById').toJS()).toEqual({
        '123': fakeTradeHistory
      })
    })
  })
})
