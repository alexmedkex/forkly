import * as renderer from 'react-test-renderer'
import * as React from 'react'

import SharedWithRow from './SharedWithRow'

describe('SharedWithRow', () => {
  it('should match default snapshot', () => {
    const tree = renderer.create(<SharedWithRow requested={false} index={1} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
  it('should match snapshot when requested is true', () => {
    const tree = renderer.create(<SharedWithRow requested={true} index={1} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match snapshot when is first element', () => {
    const tree = renderer.create(<SharedWithRow requested={false} index={0} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
