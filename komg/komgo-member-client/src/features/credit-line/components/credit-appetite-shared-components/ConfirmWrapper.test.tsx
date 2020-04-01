import * as React from 'react'
import { shallow } from 'enzyme'

import ConfirmWrapper, { ConfirmAction } from './ConfirmWrapper'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import { ServerError } from '../../../../store/common/types'

describe('SubmitConfirm', () => {
  const defaultProps = {
    header: 'Test header',
    isSubmitting: false,
    submittingErrors: [],
    handleConfirm: jest.fn(),
    handleClose: jest.fn(),
    children: <div>Test content</div>
  }

  it('should render successfully', () => {
    const wrapper = shallow(<ConfirmWrapper {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render header which commes from props', () => {
    const wrapper = shallow(<ConfirmWrapper {...defaultProps} />)

    expect(wrapper.prop('header')).toBe('Test header')
  })

  it('should render print loading component', () => {
    const wrapper = shallow(<ConfirmWrapper {...defaultProps} isSubmitting={true} />)

    expect(wrapper.prop('content')).toEqual(
      <div className="content">
        <LoadingTransition title="Submitting" marginTop="15px" />
      </div>
    )
  })

  it('should render print loading component', () => {
    const wrapper = shallow(<ConfirmWrapper {...defaultProps} isSubmitting={true} action={ConfirmAction.Remove} />)

    expect(wrapper.prop('content')).toEqual(
      <div className="content">
        <LoadingTransition title="Removing" marginTop="15px" />
      </div>
    )
  })

  it('should render error component', () => {
    const wrapper = shallow(
      <ConfirmWrapper {...defaultProps} submittingErrors={[{ message: 'Test' } as ServerError]} />
    )

    expect(wrapper.prop('content')).toEqual(
      <div className="content">
        <ErrorMessage title="Error" error="Test" />
      </div>
    )
  })

  it('should print text which gets from parent', () => {
    const wrapper = shallow(<ConfirmWrapper {...defaultProps} />)

    const content = shallow(wrapper.prop('content'))

    expect(content.text()).toBe('Test content')
  })
})
