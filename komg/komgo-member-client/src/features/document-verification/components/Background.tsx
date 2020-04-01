import * as React from 'react'
import styled from 'styled-components'
import { darkGrey, darkIndigo, indigo } from '../../../styles/colors'

const StyledBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
`

const StyledRectangle = styled.div`
  height: 100vh;
  width: 100vw;
  border: 1px solid ${darkGrey};
  background-color: ${darkIndigo};
`

const StyledPolygon = styled.div`
  height: 200vh;
  width: 200vh;
  transform: rotate(45deg);
  background-color: ${indigo};
  position: absolute;
  left: 65vw;
  top: -40vh;
`

const StyledRectangleDark = styled.div`
  height: 40vh;
  width: 100vw;
  opacity: 0.51;
  background-color: rgba(28, 41, 54, 0.75);
  top: 60vh;
  position: absolute;
`

const Background = () => {
  return (
    <StyledBackground>
      <StyledRectangle />
      <StyledPolygon />
      <StyledRectangleDark />
    </StyledBackground>
  )
}

export default Background
