import { Image, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { violetBlue, darkBlueGrey, indigo, blueGrey } from '../../../styles/colors'

export const StyledMainContainer = styled.div`
  position: relative;
`

export const StyledLogo = styled(Image)`
  width: 218px;
  height: 101px;

  &&& {
    left: 0;
    right: 0;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }
`

export const StyledRoot = styled.div`
  position: absolute;
  height: 600px;
  left: 0;
  right: 0;
  margin-top: calc(50vh - 320px);
  text-align: center;
  margin-bottom: 40px;
`

export const StyledUpload = styled.label`
  &&& {
    pointer-events: all;
    cursor: pointer;
    height: 32px;
    width: 142px;
    display: inline-block;
    margin-top: -20px;
    border-radius: 3px;
  }
`

export const StyledButton = styled(Button)`
  height: 32px;
  width: 141px;
  border: 1px solid ${indigo};
  border-radius: 3px;
  color: white;
  text-transform: uppercase;
  border-radius: 3px;

  &&& {
    margin: 0;
    background-color: ${violetBlue};
    border: none;
  }
`

export const StyledProcessedFiles = styled.ul`
  margin: 10px;
  padding: 0;
  flex-grow: 1;
`
