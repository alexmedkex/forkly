import * as React from 'react'
import styled from 'styled-components'
import { generateBottomsheetTitle } from '../utils'
import { Button } from 'semantic-ui-react'
import { BottomSheetItem } from '../store/types'

interface Props {
  items: BottomSheetItem[]
  minimizeOrMaximize: boolean
  minimizeMaximizeHandler(): void
}

const BottomSheetHeader = (props: Props) => {
  return (
    <StyledHeader className="bottom-sheet-header" onClick={props.minimizeMaximizeHandler}>
      <div className="registration-activity" style={{ flex: 1, fontSize: '16px' }}>
        {`Registration activity: `}
        <b>{generateBottomsheetTitle(props.items)}</b>
      </div>
      <Button
        className="header-btn"
        style={{ padding: '0px', background: '#dbe5ec', border: 'none' }}
        onClick={props.minimizeMaximizeHandler}
        floated="right"
        icon={props.minimizeOrMaximize ? 'chevron down' : 'chevron up'}
      />
    </StyledHeader>
  )
}

const StyledHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 15px;
  height: 50px;
  width: 442px;
  background-color: #dbe5ec;
  color: #5d768f;
  box-shadow: 0 1px 2px 0 #dbe5ec;
  cursos: default;
`
export default BottomSheetHeader
