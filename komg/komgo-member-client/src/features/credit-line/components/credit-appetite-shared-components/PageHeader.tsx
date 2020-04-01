import * as React from 'react'
import { Header, Button } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import CounterpartyModalPicker, { WithModalProps } from '../common/CounterpartyModalPicker'

interface ButtonProperties {
  redirectUrl: string
  content: string
  testId: string
}

interface IProps {
  buttonProps?: ButtonProperties
  canCrudCreditAppetite: boolean
  headerContent: string
  subTitleContent?: string
  withModalProps?: WithModalProps
}

const PageHeader: React.FC<IProps> = (props: IProps) => {
  const { canCrudCreditAppetite, headerContent, buttonProps, subTitleContent, withModalProps } = props

  const printButton = () => {
    if (canCrudCreditAppetite && buttonProps) {
      if (withModalProps) {
        return (
          <CounterpartyModalPicker
            {...withModalProps}
            renderButton={openModal => (
              <Button data-test-id={buttonProps.testId} primary={true} onClick={openModal}>
                {buttonProps.content}
              </Button>
            )}
          />
        )
      }
      return (
        <StyledLink to={buttonProps.redirectUrl} className="ui primary button" data-test-id={buttonProps.testId}>
          {buttonProps.content}
        </StyledLink>
      )
    }
    return null
  }

  return (
    <StyledGrid>
      <Header as="h1" content={headerContent} />
      {printButton()}
      {subTitleContent ? (
        <StyledSubtitle>
          <i>{subTitleContent}</i>
        </StyledSubtitle>
      ) : null}
    </StyledGrid>
  )
}

const StyledGrid = styled.div`
  margin-bottom: 45px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: baseline;
`

const StyledSubtitle = styled.div`
  padding-top: 0;
  padding-bottom: 0;
  width: 100%;
`

const StyledLink = styled(Link)`
  &&& {
    height: 32px;
    margin-bottom: 1rem;
  }
`

export default PageHeader
