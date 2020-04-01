import React, { Fragment } from 'react'
import { IExtendedSharedCreditLine, CreditLineType } from '../../../store/types'
import { grey } from '../../../../../styles/colors'
import styled from 'styled-components'
import { Grid } from 'semantic-ui-react'
import { displayDate } from '../../../../../utils/date'
import { SharedCreditLineDataView } from './SharedCreditLineDataView'

export interface IProps {
  sharedCreditLine: IExtendedSharedCreditLine
  feature: CreditLineType
}

class CompanyRow extends React.Component<IProps> {
  render() {
    const sharedData: IExtendedSharedCreditLine = { ...this.props.sharedCreditLine }
    if (!sharedData && !sharedData.data) {
      return null
    }

    return (
      <Wrapper>
        <Grid stackable={true} colums={2}>
          <Grid.Column width={3}>
            <p>
              <SellerName>{sharedData.counterpartyName}</SellerName>
            </p>
            <p>
              <small className="grey">Updated on {displayDate(sharedData.updatedAt)}</small>
            </p>
          </Grid.Column>
          <Grid.Column width={13}>
            <SharedCreditLineDataView {...this.props} />
          </Grid.Column>
        </Grid>
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  border-top: 1px solid ${grey};
  padding: 20px 0;
  :last-child {
    border-bottom: 1px solid ${grey};
  }

  && {
    .column:not(.grid) {
      padding-bottom: 10px;
    }
  }
`

const SellerName = styled.span`
  font-weight: bold;
`

export default CompanyRow
