import * as React from 'react'
import styled from 'styled-components'
import { Icon } from 'semantic-ui-react'

export interface Props {
  currentIndex: number
  maxIndex: number
  setIndex(newIndex: number): void
}

export const NoteIndexControl = (props: Props) => {
  const { currentIndex, maxIndex, setIndex } = props
  const displayIndex = currentIndex + 1
  return (
    <InlineFlex>
      <Icon
        name="chevron left"
        size="small"
        disabled={displayIndex === 1}
        onClick={e => (displayIndex > 1 ? setIndex(currentIndex - 1) : void 0)}
        data-test-id="incoming-note-btn-left"
      />
      <CurrentIndex data-test-id="incoming-note-current-index">{`${displayIndex}/${maxIndex}`}</CurrentIndex>
      <Icon
        name="chevron right"
        size="small"
        disabled={displayIndex === maxIndex}
        onClick={e => (displayIndex < maxIndex ? props.setIndex(currentIndex + 1) : void 0)}
        data-test-id="incoming-note-btn-right"
      />
    </InlineFlex>
  )
}

const InlineFlex = styled.div`
  display: inline-flex;
  align-items: center;
`

const CurrentIndex = styled.div`
  height: 21px;
  width: 33px;
  color: #5d768f;
  font-size: 11px;
  line-height: 21px;
  text-align: center;
`
