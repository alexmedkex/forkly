import * as React from 'react'
import { Link } from 'react-router-dom'
import { Accordion, Header, Icon, Segment } from 'semantic-ui-react'
import styled from 'styled-components'
import { blueGrey, dark, grey, paleBlue, violetBlue, white } from '../../styles/colors'
import { toKebabCase } from '../../utils/casings'
import { StatusText } from '../../features/receivable-discounting-legacy/components/generics/StatusText'

interface IMinimalAccordionWrapperProps {
  title: string
  active: boolean
  index: any
  children: any
  buttons?: any
  status?: string
  action?: string
  path?: string
  highlight?: boolean
  handleClick?: (e: React.SyntheticEvent, titleProps: any) => void
}

export const MinimalAccordionWrapper: React.FC<IMinimalAccordionWrapperProps> = (
  props: IMinimalAccordionWrapperProps
) => (
  <>
    {props.highlight ? <AlertCircle /> : null}
    <StyledAccordion fluid={true} bordercolor={props.highlight ? violetBlue : grey}>
      <Accordion.Title
        active={props.active}
        index={props.index}
        onClick={props.handleClick}
        className={props.handleClick ? '' : 'disabled'}
        data-test-id={`${toKebabCase(props.title)}-accordion-title`}
      >
        <Header block={true} className="komgo-accordion-header">
          <div className="accordion-title-wrapper">
            {props.handleClick ? <Icon name="chevron right" className="accordion-icon" /> : null}
            <div className="accordion-title" style={{ marginLeft: props.handleClick ? '0px' : '5px' }}>
              {props.title}
            </div>
          </div>
          <div className="accordion-status-wrapper">
            {props.status &&
              props.action &&
              props.path && (
                <React.Fragment>
                  <StatusText>{props.status}:</StatusText>{' '}
                  <Link to={props.path}>
                    <ActionText>{props.action}</ActionText>
                  </Link>
                </React.Fragment>
              )}
          </div>
          <div className="accordion-button-wrapper">{props.buttons}</div>
        </Header>
      </Accordion.Title>
      <Accordion.Content active={props.active} data-test-id={`${toKebabCase(props.title)}-accordion-content`}>
        <div className="lively-divider" />
        <Segment className="komgo-accordion-content">{props.children}</Segment>
      </Accordion.Content>
    </StyledAccordion>
  </>
)

const AlertCircle: React.FC = () => (
  <OuterCircle>
    <InnerCircle />
  </OuterCircle>
)

const OuterCircle = styled.div`
  width: 18px;
  height: 18px;
  padding: 4px;
  border-radius: 50%;
  background-color: white;
  position: absolute;
  margin: -4px -12px -16px -8px;
`

const InnerCircle = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${violetBlue};
`

export const ActionText = styled.span`
  &&& {
    color: ${violetBlue};
    font-size: 12px;
    line-height: 21px;
  }
`

export const StyledAccordion = styled(Accordion)`
  &&& {
    .komgo-accordion-header {
      height: 53px;
      padding: 15px;
      background-color: ${white};
      border: 1px solid ${({ bordercolor }) => bordercolor};
      border-radius: 4px;
      box-shadow: 0 1px 4px 0 rgba(192, 207, 222, 0.5);
      color: ${dark};
      font-size: 14px;
      font-weight: 600;
      line-height: 21px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .accordion-title-wrapper {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      min-width: 40%;
    }

    .accordion-title {
      margin-top: 1px;
    }

    .accordion-icon {
      color: #62768d;
      margin: -8px 5px 0px 5px;
      transform: rotate(0deg);
      transition: all 0.2s linear;
    }

    .accordion-status-wrapper {
      margin-top: 1px;
    }

    .accordion-button-wrapper {
      margin-top: 1px;
      display: flex;
      justify-content: flex-end;
      min-width: 20%;
    }

    .disabled {
      pointer-events: none;
    }

    .lively-divider {
      display: none;
      position: relative;
      top: 14px;
      border-bottom: 1px solid ${paleBlue};
      text-align: center;
      left: 50%;
      width: 0%;
      animation: open-line 0.4s forwards;
    }

    .active {
      .komgo-accordion-header {
        border-radius: 4px 4px 0px 0px;
        border-bottom: 0;
      }

      .accordion-title {
        margin-top: 0px;
      }

      .accordion-status-wrapper {
        margin-top: 0px;
      }

      .accordion-button-wrapper {
        margin-top: 0px;
      }

      .komgo-accordion-content {
        border-radius: 0px 0px 4px 4px;
        border-top: none;
        border-color: ${({ bordercolor }) => bordercolor};
        margin: -15px 0px 8px 0px;
      }

      .accordion-icon {
        transform: rotate(90deg);
        margin: 0px 5px 0px 5px;
      }

      .lively-divider {
        display: block;
        left: 1rem
        width: calc(100% - 2rem);
        top: -15px;
      }
    }

    @keyframes open-line {
      from {
        left: 50%;
        width: 0%;
      }
      to {
        left: 1rem
        width: calc(100% - 2rem);
      }
    }
  }
`
