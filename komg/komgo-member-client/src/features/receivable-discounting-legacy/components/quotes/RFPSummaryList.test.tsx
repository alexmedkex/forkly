import React from 'react'
import { shallow } from 'enzyme'
import RFPSummaryList from './RFPSummaryList'
import RFPSummary from './RFPSummary'

describe('<RFPSummaryList />', () => {
  it('should render an RFPSummary for each summary', () => {
    const fakeSummary = {} as any
    const wrapper = shallow(<RFPSummaryList summaries={[fakeSummary, fakeSummary, fakeSummary]} />)

    const summaries = wrapper.find(RFPSummary)

    expect(summaries).toHaveLength(3)
  })
})
