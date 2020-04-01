import * as React from 'react'
import styled from 'styled-components'
import { Button, Icon, Dimmer } from 'semantic-ui-react'
import { VerticalSteps } from '../../../components/vertical-steps'
import { transformStateTransitionToStepData } from '../utils/selectors'
import { IStateTransitionEnriched } from '../store/types'
import { paleBlue } from '../../../styles/colors'

interface IProps {
  stateHistory: IStateTransitionEnriched[]
}

interface IState {
  open: boolean
}

class StateTransitionSteps extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      open: false
    }
  }

  toggleHistory = () => {
    this.setState({
      open: !this.state.open
    })
  }

  render() {
    const { stateHistory } = this.props
    const { open } = this.state
    return (
      <React.Fragment>
        {!open ? (
          <StyledButton size="small" onClick={this.toggleHistory}>
            History
          </StyledButton>
        ) : (
          <StyledDimmer active={true} onClickOutside={this.toggleHistory} />
        )}
        <Steps open={this.state.open}>
          <RelativeWrapper>
            {stateHistory && <VerticalSteps steps={transformStateTransitionToStepData(stateHistory)} />}
            {open && <StyledIcon name="close" onClick={this.toggleHistory} />}
          </RelativeWrapper>
        </Steps>
      </React.Fragment>
    )
  }
}

interface StepsProps {
  open: boolean
}

const Steps = styled.aside`
  padding-bottom: 64px;
  overflow-y: auto;
  transition: all 0.5s ease-in-out;
  background: white;
  position: fixed;
  width: 200px;
  right: 0;
  top: 0;
  bottom: 0;
  padding-top: 38px;
  border-left: 1px solid ${paleBlue};
  @media (max-width: 1250px) {
    z-index: 13;
    right: ${(props: StepsProps) => (props.open ? '0' : '-200px')};
  }
`

const RelativeWrapper = styled.div`
  position: relative;
`

const StyledButton = styled(Button)`
  &&& {
    @media (min-width: 1251px) {
      display: none;
    }
    @media (max-width: 1250px) {
      position: absolute;
      right: 30px;
      top: 40px;
    }
  }
`

const StyledIcon = styled(Icon)`
  @media (min-width: 1251px) {
    display: none;
  }
  @media (max-width: 1250px) {
    position: absolute;
    right: 30px;
    top: -20px;
  }
`

const StyledDimmer = styled(Dimmer)`
  &&&&&&& {
    position: fixed;
    z-index: 12;
  }
`

export default StateTransitionSteps
