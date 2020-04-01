import React from 'react'
import { Page } from './Page'
import { render } from '@testing-library/react'

describe('Page', () => {
  it('should render correctly', () => {
    expect(render(<Page title={'Example Page'} />).asFragment()).toMatchSnapshot()
  })
})
