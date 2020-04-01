import React from 'react'
import ViewCommentModal, { IViewCommentModalProps } from './ViewCommentModal'
import { shallow } from 'enzyme'
import { render } from '@testing-library/react'

describe('ViewCommentModal', () => {
  let defaultProps: IViewCommentModalProps
  beforeEach(() => {
    defaultProps = {
      open: true,
      commentText: 'This is a test comment',
      date: '2015/03/19',
      bankName: 'Mercuria',
      handleClosed: jest.fn()
    }
  })

  it('should match snapshot', () => {
    expect(render(<ViewCommentModal {...defaultProps} />).asFragment()).toMatchSnapshot()
  })

  it('should call handleClosed when closed is clicked', () => {
    const wrapper = shallow(<ViewCommentModal {...defaultProps} />)

    const close = wrapper.find('[data-test-id="close-comments"]')
    close.simulate('click')

    expect(defaultProps.handleClosed).toHaveBeenCalled()
  })
})
