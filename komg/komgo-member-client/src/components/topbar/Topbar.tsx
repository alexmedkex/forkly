import React, { ReactElement } from 'react'
import { Header, Grid, Button, Icon } from 'semantic-ui-react'
import styled from 'styled-components'
import { SPACES, dark, white } from '@komgo/ui-components'
import SimpleButton from '../buttons/SimpleButton'

export interface TopbarProps {
  title: string
  actions?: ReactElement[]
  infos?: ReactElement[]
  infoAlign?: InfoAlign
  infoPosition?: InfoPosition
  sidePanelButtonProps?: ISidePanelButtonProps
}

export interface ISidePanelButtonProps {
  title: string
  onClick: () => void
}

export enum InfoAlign {
  Center = 'center'
}

export enum InfoPosition {
  Start = 'start',
  SpaceBetween = 'space-between'
}

const FlexHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-family: LotaGrotesque;
  background-color: ${white};
`

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${SPACES.DEFAULT};
  margin: 0;
`

const ActionsContainer = styled.div`
  display: flex;
`

const ActionWrapper = styled.div`
  display: flex;
`

const InfosContainer = styled(Grid.Row)`
  border-top: 1px solid rgba(192, 207, 222, 0.5);
  border-bottom: 1px solid rgba(192, 207, 222, 0.5);
  display: flex;
  flex-direction: row;
  flex-grow: 2;
  flex-wrap: wrap;
  padding-left: ${SPACES.DEFAULT};
  justify-content: ${props => (props.position ? props.position : InfoPosition.Start)};
  align-items: ${props => (props.align ? props.align : InfoAlign.Center)};
`

const InfoWrapper = styled.div`
  display: flex;
  margin-right: 15px;
  padding: ${SPACES.SMALL} ${SPACES.SMALL} ${SPACES.SMALL} 0;
  & > p {
    color: ${dark};
    font-size: 11px;
    font-weight: bold;
    line-height: 21px;
    margin: 0 0.35rem 0 0;
    text-transform: uppercase;
  }

  & > span {
    padding-top: 4px !important;
  }

  &:last-child {
    margin-right: 0;
  }
`

const StyledSidePanelButton = styled(SimpleButton)`
  margin-left: auto;
  border-left: 1px solid #e0e6ed;
  border-bottom: none;
  padding: ${SPACES.SMALL} ${SPACES.SMALL} ${SPACES.SMALL} ${SPACES.DEFAULT};
  font-weight: 600;
  font-size: 11px;
`

const Topbar: React.FC<TopbarProps> = ({ title, actions, infos, infoPosition, infoAlign, sidePanelButtonProps }) => (
  <>
    <FlexHeader data-test-id="topbar-container">
      <HeaderContainer>
        <Header data-test-id="topbar-header-container" as="h1" style={{ margin: 0 }}>
          {title}
        </Header>
        {actions && (
          <ActionsContainer data-test-id="topbar-actions-container">
            {actions.map((segment: ReactElement, idx) => <ActionWrapper key={idx}>{segment}</ActionWrapper>)}
          </ActionsContainer>
        )}
      </HeaderContainer>
      {(infos || sidePanelButtonProps) && (
        <InfosContainer data-test-id="topbar-infos-container" position={infoPosition} align={infoAlign}>
          {infos.map((segment: ReactElement, idx) => <InfoWrapper key={idx}>{segment}</InfoWrapper>)}

          {sidePanelButtonProps && (
            <StyledSidePanelButton onClick={sidePanelButtonProps.onClick} data-test-id="side-panel-button">
              <Icon name="chevron left" /> {sidePanelButtonProps.title.toUpperCase()}
            </StyledSidePanelButton>
          )}
        </InfosContainer>
      )}
    </FlexHeader>
  </>
)

export default Topbar
