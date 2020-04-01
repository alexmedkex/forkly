import * as React from 'react'
import styled from 'styled-components'
import { Button, Icon, Grid } from 'semantic-ui-react'
import { SPACES } from '@komgo/ui-components'

interface IProps {
  name: string
  index: number
  total: number
  counter?: boolean
  backward(e: React.MouseEvent): void
  forward(e: React.MouseEvent): void
}

const NavigatePanel: React.FC<IProps> = (props: IProps) => {
  const { total, index, backward, forward, name, counter } = props
  return (
    <Grid>
      <Grid.Row columns={2}>
        <Grid.Column floated="left">
          <h2>{name}</h2>
        </Grid.Column>
        <Grid.Column floated="right">
          <RightWrapper>
            {counter && (
              <Counter>
                {index + 1} / {total}
              </Counter>
            )}
            <StyledButton icon={true} onClick={backward} disabled={index === 0} primary={true}>
              <Icon name="angle left" />
            </StyledButton>
            <StyledButton icon={true} onClick={forward} disabled={total && index === total - 1} primary={true}>
              <Icon name="angle right" />
            </StyledButton>
          </RightWrapper>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

const Counter = styled.span`
  font-size: 16px;
  margin-right: ${SPACES.DEFAULT};
`

const RightWrapper = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
`
// Fix this in komgo theme
const StyledButton = styled(Button)`
  &&& {
    margin-right: 3px;
    &:not(.disabled) {
      .icon {
        color: white;
      }
    }
  }
`

export default NavigatePanel
