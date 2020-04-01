import * as React from 'react'
import { Grid, Header, List, Divider } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { ILCPresentation } from '../../types/ILCPresentation'
import { Document } from '../../../document-management/store/types'
import GreyHeader from '../GreyHeader'
import styled from 'styled-components'
import { paleBlue } from '../../../../styles/colors'
import { capitalize } from '../../../../utils/casings'
import { displayDate } from '../../../../utils/date'
import { LCPresentationStatus, LCPresentationDocumentStatus } from '../../store/presentation/types'
import { pluckRenderableFields } from '../documents/HeadedList'

interface IProps {
  lcId: string
  presentations: ILCPresentation[]
  documents: Document[]
  itemToListItemContent(item: any): { [index: string]: JSX.Element | string }
}

class DocumentTabPresentations extends React.Component<IProps> {
  findDocumentsForPresentation(presentation: ILCPresentation) {
    return this.props.documents.filter(
      document => document.context && document.context.lcPresentationStaticId === presentation.staticId
    )
  }

  printPresentation(presentation: ILCPresentation, lcId: string) {
    if (
      presentation.status === LCPresentationStatus.DocumentReleasedToApplicant ||
      presentation.status === LCPresentationStatus.DocumentsCompliantByNominatedBank ||
      presentation.status === LCPresentationStatus.DocumentsAcceptedByApplicant
    ) {
      const documents = this.findDocumentsForPresentation(presentation)
      if (documents.length > 0) {
        return (
          <StyledPresentation key={presentation.staticId}>
            <Grid>
              <Grid.Column floated="left" width={8}>
                <HeaderWithoutMargin as="h3">Presentation #{presentation.reference}</HeaderWithoutMargin>
              </Grid.Column>
              <Grid.Column floated="right" width={8} textAlign="right">
                <HeaderWithoutMargin as="h4">Status: {capitalize(presentation.status)}</HeaderWithoutMargin>
                <p>
                  {presentation.stateHistory && (
                    <React.Fragment>
                      <span>{displayDate(presentation.stateHistory[presentation.stateHistory.length - 1].date)}</span>{' '}
                      <Link
                        to={`/financial-instruments/letters-of-credit/${lcId}/presentations/${
                          presentation.staticId
                        }/history`}
                      >
                        View History
                      </Link>
                    </React.Fragment>
                  )}
                </p>
              </Grid.Column>
            </Grid>
            {documents.length > 0 && (
              <React.Fragment>
                <Divider />
                <StyledList>
                  {documents.map(document => (
                    <StyledListItem
                      key={`${document.id}_${presentation.reference}`}
                      content={pluckRenderableFields(this.props.itemToListItemContent(document))}
                    />
                  ))}
                </StyledList>
              </React.Fragment>
            )}
          </StyledPresentation>
        )
      }
    }
    return null
  }

  render() {
    const { presentations, lcId } = this.props
    return (
      <StyledPresentations>
        <GreyHeader block={true}>Trade documents</GreyHeader>
        {presentations.map(presentation => this.printPresentation(presentation, lcId))}
      </StyledPresentations>
    )
  }
}

const StyledPresentations = styled.div`
  padding: 0 15px;
  margin: 30px 0;
`

export const StyledPresentation = styled.div`
  border-top: 1px solid ${paleBlue};
  border-bottom: 1px solid ${paleBlue};
  margin-bottom: 15px;
  padding-top: 15px;
`

const HeaderWithoutMargin = styled(Header)`
  &&& {
    margin-bottom: 0;
  }
`

export const StyledList = styled(List)`
  &&& {
    padding: 0;
  }
`

export const StyledListItem = styled(List.Item)`
  &&& {
    padding-bottom: 0;
    padding-top: 0;
    height: 30px;
  }
`

export default DocumentTabPresentations
