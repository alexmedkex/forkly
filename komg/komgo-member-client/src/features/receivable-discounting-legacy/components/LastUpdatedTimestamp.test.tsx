import React from 'react'
import { render } from '@testing-library/react'
import { LastUpdatedTimestamp } from './LastUpdatedTimestamp'
import moment from 'moment-timezone'

describe('LastUpdatedTimestamp', () => {
  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')
  })

  it('should render correctly', () => {
    expect(
      render(<LastUpdatedTimestamp date={'Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)'} />).asFragment()
    ).toMatchSnapshot()
  })
})
