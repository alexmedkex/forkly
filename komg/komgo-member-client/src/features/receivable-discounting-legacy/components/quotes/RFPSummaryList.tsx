import React from 'react'
import RFPSummary, { IRFPSummaryProps } from './RFPSummary'
import styled from 'styled-components'

interface IRFPSummaryListProps {
  summaries: IRFPSummaryProps[]
}

const RFPSummaryList: React.FC<IRFPSummaryListProps> = (props: IRFPSummaryListProps) => (
  <RFPSummaryWrapper>
    {props.summaries.map((summary: IRFPSummaryProps) => <RFPSummary {...summary} key={summary.company} />)}
  </RFPSummaryWrapper>
)

const RFPSummaryWrapper = styled.div`
  margin: 20px 0px;
  display: block;
`

export default RFPSummaryList
