import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { render, fireEvent } from '@testing-library/react'

import DocumentSimpleHeader from './DocumentSimpleHeader'
import { fakeDocument } from '../../utils/faker'

describe('DocumentSimpleHeader', () => {
  const defaultProps = {
    document: fakeDocument(),
    actions: {
      close: jest.fn()
    }
  }

  it('should match default snapshot', () => {
    expect(renderer.create(<DocumentSimpleHeader {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should call close function when button is clicked', () => {
    const { getByText } = render(<DocumentSimpleHeader {...defaultProps} />)

    fireEvent.click(getByText('Close'))

    expect(defaultProps.actions.close).toHaveBeenCalled()
  })
})
