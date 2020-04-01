import * as React from 'react'
import { Button } from 'semantic-ui-react'
import styled from 'styled-components'

interface IProps {
  readOnly: boolean
  callback(): void
}

const NoPresentationExists: React.FC<IProps> = (props: IProps) => {
  if (props.readOnly) {
    return (
      <StyledWrapper>
        <StyledText className="grey">There aren't any presentation.</StyledText>
      </StyledWrapper>
    )
  }
  return (
    <StyledWrapper>
      <StyledText className="grey">
        Add documents to the LC library to <br />
        begin the presentation process
      </StyledText>
      <Button primary={true} content="Add new" onClick={props.callback} />
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  padding: 30vh;
  text-align: center;
`

const StyledText = styled.div`
  margin: 15px 0;
`

export default NoPresentationExists
