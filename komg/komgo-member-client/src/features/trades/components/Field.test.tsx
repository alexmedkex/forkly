import * as React from 'react'
import { Field, FieldWithLabel } from './Field'
import * as renderer from 'react-test-renderer'

it('should match snapshot', () => {
  const tree = renderer.create(<Field>OK</Field>).toJSON()

  expect(tree).toMatchSnapshot()
})

it('should match snapshot', () => {
  const tree = renderer.create(<FieldWithLabel>OK</FieldWithLabel>).toJSON()

  expect(tree).toMatchSnapshot()
})
