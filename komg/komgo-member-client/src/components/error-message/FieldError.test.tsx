import * as React from 'react'
import * as renderer from 'react-test-renderer'
import FieldError from './FieldError'

describe('FieldError', () => {
  it('should match snapshot', () => {
    expect(renderer.create(<FieldError show={true} fieldName="test-field" />).toJSON()).toMatchSnapshot()
  })
})
