import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router-dom'

import PageHeader from './PageHeader'

describe('PageHeader', () => {
  it('should match snapshot with button', () => {
    expect(
      renderer
        .create(
          <Router>
            <PageHeader
              canCrudCreditAppetite={true}
              headerContent="Deposits"
              buttonProps={{
                redirectUrl: '/deposits/new',
                content: 'Add',
                testId: 'test-id'
              }}
            />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
  it('should match snapshot without button', () => {
    expect(
      renderer
        .create(
          <Router>
            <PageHeader canCrudCreditAppetite={true} headerContent="Deposits" buttonProps={null} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
  it('should match snapshot without button when user do not have permission', () => {
    expect(
      renderer
        .create(
          <Router>
            <PageHeader
              canCrudCreditAppetite={false}
              headerContent="Deposits"
              buttonProps={{
                redirectUrl: '/deposits/new',
                content: 'Add',
                testId: 'test-id'
              }}
            />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
