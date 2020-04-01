import * as React from 'react'
import * as renderer from 'react-test-renderer'

import SharedInfoRowWrapper from './SharedInfoRowWrapper'

describe('SharedInfoRowWrapper', () => {
  it('should match snapshot', () => {
    expect(
      renderer
        .create(
          <SharedInfoRowWrapper>
            <div>ok</div>
          </SharedInfoRowWrapper>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
