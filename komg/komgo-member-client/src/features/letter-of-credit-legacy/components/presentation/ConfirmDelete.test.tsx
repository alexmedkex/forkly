import * as React from 'react'
import { shallow } from 'enzyme'
import ConfirmDelete from './ConfirmDelete'
import { fakePresentation } from '../../utils/faker'
import { LoadingTransition, ErrorMessage } from '../../../../components'

describe('AddDocumentButton component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      presentation: fakePresentation({ staticId: '123' }),
      open: false,
      isDeleting: false,
      deletingError: [],
      removePresenation: jest.fn(),
      close: jest.fn(),
      deleteDocument: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<ConfirmDelete {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })
  it('should render component successfully when confirm is open', () => {
    const wrapper = shallow(<ConfirmDelete {...defaultProps} open={true} />)

    expect(wrapper.exists()).toBe(true)
  })
  it('should find loader when isDeliting is true', () => {
    const wrapper = shallow(<ConfirmDelete {...defaultProps} open={true} isDeleting={true} />)

    const loader = wrapper.shallow().find(LoadingTransition)

    expect(loader.length).toBe(1)
  })
  it('should find error when deletingError has error', () => {
    const wrapper = shallow(<ConfirmDelete {...defaultProps} open={true} deletingError={[{ message: 'Error' }]} />)

    const error = wrapper.shallow().find(ErrorMessage)

    expect(error.length).toBe(1)
  })
})
