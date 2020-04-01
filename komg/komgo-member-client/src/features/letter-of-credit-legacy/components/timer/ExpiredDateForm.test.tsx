import * as React from 'react'
import * as renderer from 'react-test-renderer'
import moment from 'moment'
import { TIME_UNIT_DUE_DATE } from '../../constants'
import ExpiredDateForm from './ExpiredDateForm'

describe('ExpiredDateForm component', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => 1487076708000)
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')
  })

  afterEach(() => {
    moment.tz.setDefault()
  })

  it('should match snapshot when default props is presented (1 day)', () => {
    const tree = renderer.create(<ExpiredDateForm time={1} timeUnit={TIME_UNIT_DUE_DATE.DAYS} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match snapshot when props are 5 days', () => {
    const tree = renderer.create(<ExpiredDateForm time={5} timeUnit={TIME_UNIT_DUE_DATE.DAYS} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match snapshot when props are 1 week', () => {
    const tree = renderer.create(<ExpiredDateForm time={1} timeUnit={TIME_UNIT_DUE_DATE.WEEKS} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match snapshot when props are 5 hours', () => {
    const tree = renderer.create(<ExpiredDateForm time={5} timeUnit={TIME_UNIT_DUE_DATE.HOURS} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
