import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { Warning } from '.'

describe('Warning', () => {
  it('matches snapshot when visible', () => {
    expect(
      renderer.create(<Warning visible={true}>Please complete all required fields</Warning>).toJSON()
    ).toMatchSnapshot()
  })
  it('matches snapshot when invisible', () => {
    expect(
      renderer.create(<Warning visible={false}>Please complete all required fields</Warning>).toJSON()
    ).toMatchSnapshot()
  })
})
