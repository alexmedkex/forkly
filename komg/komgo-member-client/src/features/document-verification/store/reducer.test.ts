import reducer, { initialState } from './reducer'
import { DocumentVerificationActionType, IVerifiedFile, IStatus } from './types'
import { grey, lightBlue, lightRed } from '../../../styles/colors'

const file: IVerifiedFile = {
  status: IStatus.pending,
  hash: 'hash',
  key: 0,
  type: 'pdf',
  fileName: '001.pdf'
}

describe('Document Verification Reducer', () => {
  it('should saves file on VERIFY_DOCUMENT_ADD_FILE', () => {
    const expectFile = { ...file }
    expectFile.iconColor = grey

    const state = reducer(initialState, {
      type: DocumentVerificationActionType.VERIFY_DOCUMENT_ADD_FILE,
      payload: { file }
    })

    expect(state.get('files').toJS()[0]).toEqual(file)
  })

  it('should saves registered file on VERIFY_DOCUMENT_SUCCESS', () => {
    const response = {
      registered: true,
      deactivated: false,
      documentInfo: {
        registeredAt: '1565619089528',
        registeredBy: 'Company 001'
      }
    }
    const expectFile = { ...file }
    expectFile.status = IStatus.success
    expectFile.iconColor = lightBlue
    expectFile.registeredAt = '1565619089528'
    expectFile.registeredBy = 'Company 001'

    const state = reducer(initialState, {
      type: DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS,
      payload: { file, response }
    })

    expect(state.get('files').toJS()[0]).toEqual(expectFile)
  })

  it('should saves unregistered file on VERIFY_DOCUMENT_SUCCESS', () => {
    const response = {
      registered: false,
      deactivated: false
    }
    const expectFile = { ...file }
    expectFile.status = IStatus.error
    expectFile.iconColor = lightRed

    const state = reducer(initialState, {
      type: DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS,
      payload: { file, response }
    })

    expect(state.get('files').toJS()[0]).toEqual(expectFile)
  })

  it('should saves deactivated file on VERIFY_DOCUMENT_SUCCESS', () => {
    const response = {
      registered: true,
      deactivated: true
    }
    const expectFile = { ...file }
    expectFile.status = IStatus.error
    expectFile.iconColor = lightRed

    const state = reducer(initialState, {
      type: DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS,
      payload: { file, response }
    })

    expect(state.get('files').toJS()[0]).toEqual(expectFile)
  })

  it('should saves unregistered file on VERIFY_DOCUMENT_FAILURE', () => {
    const response = 'Some error'
    const expectFile = { ...file }
    expectFile.status = IStatus.error
    expectFile.iconColor = lightRed

    const state = reducer(initialState, {
      type: DocumentVerificationActionType.VERIFY_DOCUMENT_FAILURE,
      payload: { file, response }
    })

    expect(state.get('files').toJS()[0]).toEqual(expectFile)
  })
})
