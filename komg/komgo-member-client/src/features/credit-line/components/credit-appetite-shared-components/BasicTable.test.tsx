import * as React from 'react'
import * as renderer from 'react-test-renderer'

import BasicTable from './BasicTable'

describe('BasicTable', () => {
  it('should match default snaptshout', () => {
    expect(renderer.create(<BasicTable />).toJSON()).toMatchSnapshot()
  })
})
