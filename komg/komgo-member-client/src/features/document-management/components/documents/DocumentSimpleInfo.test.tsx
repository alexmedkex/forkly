import * as React from 'react'
import * as renderer from 'react-test-renderer'

import DocumentSimpleInfo from './DocumentSimpleInfo'
import { fakeDocument } from '../../utils/faker'

describe('DocumentSimpleInfo', () => {
  const defaultProps = {
    document: fakeDocument()
  }

  it('should match default snapshot', () => {
    expect(renderer.create(<DocumentSimpleInfo {...defaultProps} />).toJSON()).toMatchSnapshot()
  })
})
