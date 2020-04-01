import * as React from 'react'
import styled from 'styled-components'
import { greyblue, paleBlue, green } from '../../styles/colors'
import { displayDateAndTime } from '../../utils/date'
import { Popup } from 'semantic-ui-react'

export interface Step {
  title: string
  subtitle?: string
  date?: string
  description?: string
  finished?: boolean
}

interface IProps {
  steps: Step[]
}

class VerticalSteps extends React.Component<IProps> {
  render() {
    return (
      <div>
        {this.props.steps.map(step => (
          <Step key={step.title}>
            <Circle finished={step.finished ? true : false} />
            <StepContent>
              <Title>{step.title}</Title>
              {step.subtitle && <p>{step.subtitle}</p>}
              {step.date && <Date>Received {displayDateAndTime(step.date)}</Date>}
              {step.description &&
                (step.description.length < 50 ? (
                  <p>{step.description}</p>
                ) : (
                  <Popup trigger={<p>{step.description.substring(0, 50)}...</p>} content={step.description} />
                ))}
            </StepContent>
          </Step>
        ))}
      </div>
    )
  }
}

const StepContent = styled.div`
  cursor: pointer;
`

export const Step = styled.div`
  position: relative;
  padding: 5px 30px;
  p {
    margin-bottom: 0.5rem;
  }
`
interface CircleProps {
  finished: boolean
}

const Circle: any = styled.div`
  position: absolute;
  border-radius: 100%;
  border: 1px solid;
  border-color: ${(props: CircleProps) => (props.finished ? green : paleBlue)};
  width: 9px;
  height: 9px;
  left: 11px;
  z-index: 2;
  background-color: ${(props: CircleProps) => (props.finished ? green : paleBlue)};
  top: 8px;
  &:before {
    content: '';
    border-top: 1px solid ${paleBlue};
    width: 12px;
    height: 1px;
    position: absolute;
    top: 3px;
    left: -13px;
  }
`

const Title = styled.p`
  font-weight: bold;
`

const Date = styled.p`
  color: ${greyblue};
  font-size: 12px;
`

export default VerticalSteps
