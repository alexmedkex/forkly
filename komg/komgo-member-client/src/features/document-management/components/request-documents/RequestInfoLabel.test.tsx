import * as React from 'react'
import * as renderer from 'react-test-renderer'

import RequestInfoLabel from './RequestInfoLabel'

describe('RequestInfoLabel', () => {
  it('should match snapshot', () => {
    expect(
      renderer
        .create(
          <RequestInfoLabel label="Test">
            <div>test</div>
          </RequestInfoLabel>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
