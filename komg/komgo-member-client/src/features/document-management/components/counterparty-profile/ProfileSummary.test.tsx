import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { ProfileSummary } from './ProfileSummary'

describe('CounterpartyDocumentListItem', () => {
  it('renders without children', () => {
    expect(renderer.create(<ProfileSummary />).toJSON()).toMatchSnapshot()
  })

  it('renders with children', () => {
    expect(
      renderer
        .create(
          <ProfileSummary>
            <div>
              <label>some data</label>
              <div>some value</div>
            </div>
          </ProfileSummary>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
