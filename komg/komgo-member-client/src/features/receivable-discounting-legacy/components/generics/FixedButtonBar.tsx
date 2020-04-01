import styled from 'styled-components'
import { paleBlue } from '@komgo/ui-components'
import React from 'react'

const sideBarWidth = '220px'
const height = '68px'
export const FixedButtonBar = styled.div`
  &&& {
    position: fixed;
    left: 0px;
    bottom: 0px;
    height: ${height};
    display: flex;
    justify-content: flex-end;
    padding-top: calc((68px - 32px) / 2);
    padding-bottom: calc((68px - 32px) / 2);
    width: calc(100% - ${sideBarWidth});
    padding-right: 38px;
    border-top: 1px solid ${paleBlue};
    background: white;
    margin-left: ${sideBarWidth};
  }
`

export const Spacer = styled.div`
  width: calc(100% - ${sideBarWidth});
  margin-left: ${sideBarWidth};
  margin-top: ${height};
`

export const SpacedFixedButtonBar = (props: any) => (
  <>
    <Spacer />
    <FixedButtonBar {...props} />
  </>
)
