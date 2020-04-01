import * as React from 'react'
import renderer from 'react-test-renderer'
import FieldLabel from './FieldLabel'

describe('FieldLabel', () => {
  it('should match snapshot when it is not optional field', () => {
    expect(renderer.create(<FieldLabel label="Test field" />)).toMatchSnapshot()
  })
  it('should match snapshot when it is optional field', () => {
    expect(renderer.create(<FieldLabel label="Test field" isOptional={true} />)).toMatchSnapshot()
  })
})
