import * as React from 'react'
import styled from 'styled-components'
import { Header, Label, Grid } from 'semantic-ui-react'
import { paleBlue } from '../../../../styles/colors'
import { Document } from '../../../document-management/store/types'
import { ILCPresentation } from '../../types/ILCPresentation'
import { capitalize } from '../../../../utils/casings'
import { displayDateAndTime, displayDate } from '../../../../utils/date'
import { IMember } from '../../../members/store/types'
import { findMemberName, findCommentForLCPresentationStatus, findRoleForStaticId } from '../../utils/selectors'
import DocumentsList from './DocumentsList'
import { IStateTransition } from '../../store/types'
import { LCPresentationStatus } from '../../store/presentation/types'
import Presentation from './Presentation'

interface IProps {
  presentation: ILCPresentation
  documents: Document[]
  members: IMember[]
  viewClickHandler(document: Document): void
}

const HistoryPresentation: React.FC<IProps> = (props: IProps) => {
  const { presentation, documents, members, viewClickHandler } = props

  const renderPresentationHistory = (stateTransition: IStateTransition) => {
    const comment = findCommentForLCPresentationStatus(presentation, stateTransition.toState as LCPresentationStatus)
    if (stateTransition.toState === LCPresentationStatus.Draft) {
      return null
    }
    return (
      <PresentationState key={`${stateTransition.performer}-${stateTransition.date}`}>
        <PerformerName>{findRoleForStaticId(stateTransition.performer, presentation)}</PerformerName>
        <PresentationDateAndStatus>
          {findMemberName(stateTransition.performer, members)} on {displayDate(stateTransition.date)} -{' '}
          <span className="grey">{capitalize(stateTransition.toState)}</span>
        </PresentationDateAndStatus>
        {comment && <Comment>{comment}</Comment>}
        <div className="ui divider" />
      </PresentationState>
    )
  }

  return (
    <React.Fragment>
      <StyledWrapper>
        <Grid>
          <Grid.Column floated="left" width={8}>
            <Header as="h3" style={{ display: 'inline-block' }}>
              Presentation #{presentation.reference}
            </Header>
          </Grid.Column>
          <Grid.Column floated="right" textAlign="right" width={8}>
            <Label color={Presentation.getPresentationStatusColor(presentation.status)}>
              {capitalize(presentation.status)}
            </Label>
            {presentation.stateHistory &&
              presentation.stateHistory.length > 0 && (
                <LastStatusDate>
                  {displayDateAndTime(presentation.stateHistory[presentation.stateHistory.length - 1].date)}
                </LastStatusDate>
              )}
          </Grid.Column>
        </Grid>
        {documents &&
          documents.length > 0 && (
            <DocumentsList
              documents={documents}
              presentation={presentation}
              showActions={true}
              removeDeleteButton={true}
              viewClickHandler={viewClickHandler}
            />
          )}
        <div className="ui divider" />
        <Header as="h4">
          <b>History</b>
        </Header>
        {presentation.stateHistory.map((stateTransition: IStateTransition) =>
          renderPresentationHistory(stateTransition)
        )}
      </StyledWrapper>
    </React.Fragment>
  )
}

const StyledWrapper = styled.div`
  margin: 20px 0;
  border: 1px solid ${paleBlue};
  padding: 15px;
  position: relative;
`

const PresentationDateAndStatus = styled.p`
  font-size: 12px;
  margin-bottom: 5px;
`

const PerformerName = styled.p`
  margin-bottom: 0;
  font-weight: bold;
`

const Comment = styled.p`
  font-size: 12px;
  margin-top: 20px;
`

const PresentationState = styled.div`
  margin-bottom: 5px;
`

const LastStatusDate = styled.div`
  margin-top: 10px;
`

export default HistoryPresentation
