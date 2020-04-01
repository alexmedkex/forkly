import * as React from 'react'
import { ButtonLink } from './ButtonLink'
import { render } from '@testing-library/react'
import { MemoryRouter as Router } from 'react-router-dom'

describe('ButtonLink', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(
      <Router>
        <ButtonLink to="nowhere" />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
