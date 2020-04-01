import reducer, { initialState } from './reducer'
import { DocumentVerificationActionType } from './types'

describe('Document Verification Reducer', () => {
  it('saves "metadataHash" on GET_SESSION_SUCCESS', () => {
    const state = reducer(initialState, {
      type: DocumentVerificationActionType.GET_SESSION_SUCCESS,
      payload: { metadataHash: 'metadataHash' }
    })

    expect(state.get('metadataHash')).toEqual('metadataHash')
  })

  it('saves "registeredAt" on VERIFY_DOCUMENT_SUCCESS', () => {
    const state = reducer(initialState, {
      type: DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS,
      payload: { registeredAt: 1000 }
    })

    expect(state.get('registeredAt')).toEqual(1000)
  })

  it('saves "companyName" on GET_SESSION_SUCCESS', () => {
    const state = reducer(initialState, {
      type: DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS,
      payload: { companyName: 'companyName' }
    })

    expect(state.get('companyName')).toEqual('companyName')
  })
})
