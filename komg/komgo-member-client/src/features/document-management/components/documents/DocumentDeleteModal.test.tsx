import * as React from 'react'
import { shallow } from 'enzyme'
import DocumentDeleteModal from './DocumentDeleteModal'

describe('DocumentDeleteModal component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      open: true,
      userId: 'userId',
      document: {
        externallyShared: [{ userId: 'userId' }]
      },
      onConfirmDelete: jest.fn(),
      onToggleVisible: jest.fn()
    }
  })

  it('Should render DocumentDeleteModal', () => {
    const wrapper = shallow(<DocumentDeleteModal {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call onConfirmDelete', () => {
    const wrapper = shallow(<DocumentDeleteModal {...defaultProps} />)
    const instance: any = wrapper.instance()
    instance.handleConfirm()
    expect(defaultProps.onConfirmDelete).toHaveBeenCalled()
  })
})
