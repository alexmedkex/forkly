import { toggleModalVisible, setModalStep } from './actions'
import { ModalName, ModalActionType } from '../types'

describe('Modals actions', () => {
  it('toggleModalVisible creates a TOGGLE_MODAL_VISIBLE action given a valid ModalName', () => {
    const validModalName: ModalName = 'addDocument'
    const expected = {
      type: ModalActionType.TOGGLE_MODAL_VISIBLE,
      modal: validModalName
    }
    const actual = toggleModalVisible(validModalName)
    expect(actual).toEqual(expected)
  })

  it('setModalStep creates a SET_MODAL_STEP action given a numeric step', () => {
    const validModalName: ModalName = 'shareDocument'
    const expected = {
      type: ModalActionType.SET_MODAL_STEP,
      modal: validModalName,
      step: 999
    }
    const actual = setModalStep(validModalName, 999)
    expect(actual).toEqual(expected)
  })
})
