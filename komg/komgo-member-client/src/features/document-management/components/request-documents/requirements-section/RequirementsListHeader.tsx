import * as React from 'react'
import styled from 'styled-components'

export const RequirementsListHeader = () => {
  return (
    <HeaderContainer data-test-id="requirements-section-header">
      <p>Document Type</p>
      <p>Requirements</p>
      <p>Attachment</p>
    </HeaderContainer>
  )
}

const HeaderContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 1px solid #c0cfde;
  text-transform: uppercase;
  line-height: 21px;
  font-size: 11px;
  font-weight: 600;
  color: #5d768f;
  margin: 16px 0;
`
