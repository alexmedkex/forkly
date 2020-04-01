import * as React from 'react'
import { Grid, Header } from 'semantic-ui-react'
import { ILCPresentation } from '../../types/ILCPresentation'
import { capitalize } from '../../../../utils/casings'
import { findMemberName } from '../../utils/selectors'
import { displayDate } from '../../../../utils/date'
import { IMember } from '../../../members/store/types'

interface IProps {
  presentation: ILCPresentation
  members: IMember[]
}

const LCPresentationDetailsHeader: React.FC<IProps> = (props: IProps) => {
  const { presentation, members } = props
  return (
    <Grid>
      <Grid.Column floated="left" width={8}>
        <Header as="h1">{presentation.LCReference}</Header>
        <Header as="h3" style={{ marginTop: 0 }}>
          Presentation #{presentation.reference}
        </Header>
      </Grid.Column>
      <Grid.Column floated="right" width={8} textAlign="right">
        <Header as="h3">Status: {capitalize(presentation.status)}</Header>
        <p>
          Received from {findMemberName(presentation.beneficiaryId, members)}{' '}
          {presentation.stateHistory && presentation.stateHistory.length > 0
            ? `on ${displayDate(presentation.stateHistory[presentation.stateHistory.length - 1].date)}`
            : null}
        </p>
      </Grid.Column>
    </Grid>
  )
}

export default LCPresentationDetailsHeader
