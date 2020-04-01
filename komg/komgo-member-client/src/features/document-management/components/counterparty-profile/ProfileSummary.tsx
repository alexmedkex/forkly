import * as React from 'react'
import styled from 'styled-components'

export const ProfileSummary = (props: React.PropsWithChildren<{}>) => {
  return <SummaryGrid data-test-id="cp-profile-summary">{props.children}</SummaryGrid>
}

const SummaryGrid = styled.div`
  display: flex;
  flex-direction: column;
  margin: 23px 28px;
`
