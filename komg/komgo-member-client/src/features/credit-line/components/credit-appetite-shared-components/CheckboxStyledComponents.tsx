import * as React from 'react'
import styled from 'styled-components'

export const CheckboxWrapper = styled.div`
  &&& {
    margin-bottom: 5px;
    position: relative;
    .inline.field {
      display: inline-flex;
      margin-bottom: 0;
    }
  }
`

export const CheckboxGrid = styled.div`
  display: flex;
  flex-flow: row wrap;
`

export const CheckboxColumn = styled.div`
  flex: 1 1 33.33%;
  flex-grow: 1;
  @media (max-width: 1200px) {
    flex: 1 1 50%;
    margin-bottom: 10px;
    label {
      min-width: 140px;
    }
  }
  @media (max-width: 768px) {
    flex: 1 1 100%;
  }
`
