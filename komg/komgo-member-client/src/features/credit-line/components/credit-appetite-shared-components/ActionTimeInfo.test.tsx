import * as React from 'react'
import * as renderer from 'react-test-renderer'
import moment from 'moment-timezone'
import ActionTimeInfo from './ActionTimeInfo'

describe('ActionTimeInfo', () => {
  let defaultProps

  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')
    Date.now = jest.fn(() => 1487076708000)

    defaultProps = {
      time: '2019-05-23T15:00:28.320Z',
      fieldName: 'test-field-name',
      prefix: 'Last updated'
    }
  })

  afterEach(() => {
    moment.tz.setDefault()
  })

  it('should match default snapshot', () => {
    expect(renderer.create(<ActionTimeInfo {...defaultProps} />).toJSON()).toMatchSnapshot()
  })
})
