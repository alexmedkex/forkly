import React from 'react'
import { History, IHistoryProps } from './History'
import { render } from '@testing-library/react'
import { fakeRdApplicationHistory } from '../../utils/faker'

const fakeFormat = entry => ({
  updatedAt: entry.updatedAt,
  values: [entry.value.toString()]
})

const fakeHistory = (fieldName: string) => ({
  fieldName,
  history: fakeRdApplicationHistory().historyEntry[fieldName].map(fakeFormat)
})

describe('History', () => {
  let testProps: IHistoryProps

  it('renders invoiceAmount correctly correct markup for tooltip contents', () => {
    testProps = fakeHistory('invoiceAmount')

    expect(render(<History {...testProps} />).asFragment()).toMatchSnapshot()
  })

  it('renders dateOfPerformance correctly correct markup for tooltip contents', () => {
    testProps = fakeHistory('dateOfPerformance')

    expect(render(<History {...testProps} />).asFragment()).toMatchSnapshot()
  })

  it('renders titleTransfer correctly correct markup for tooltip contents', () => {
    testProps = fakeHistory('titleTransfer')

    expect(render(<History {...testProps} />).asFragment()).toMatchSnapshot()
  })

  it('renders discountingDate correctly correct markup for tooltip contents', () => {
    testProps = fakeHistory('discountingDate')

    expect(render(<History {...testProps} />).asFragment()).toMatchSnapshot()
  })

  it('renders invoiceType correctly correct markup for tooltip contents', () => {
    testProps = fakeHistory('invoiceType')

    expect(render(<History {...testProps} />).asFragment()).toMatchSnapshot()
  })
})
