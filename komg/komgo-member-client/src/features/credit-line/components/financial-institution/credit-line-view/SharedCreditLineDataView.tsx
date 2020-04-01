import React, { Fragment } from 'react'
import { IExtendedSharedCreditLine, CreditLineType } from '../../../store/types'
import SharedProperty from '../../credit-appetite-shared-components/SharedProperty'
import { Grid } from 'semantic-ui-react'
import { percentFormat, daysFormat } from '../../../utils/formatters'
import { dictionary } from '../../../dictionary'
import styled from 'styled-components'

export interface ISharedCreditLineDataViewProps {
  sharedCreditLine: IExtendedSharedCreditLine
  feature: CreditLineType
}

export class SharedCreditLineDataView extends React.Component<ISharedCreditLineDataViewProps> {
  renderSharedValues(data) {
    return (
      <>
        <Grid.Column>
          <SharedProperty
            shared={data.fee && data.fee.shared}
            label={dictionary[this.props.feature].financialInstitution.createOrEdit.companyFeeFieldLabel}
            value={data.fee && data.fee.fee !== undefined ? percentFormat(data.fee.fee, '') : null}
          />
        </Grid.Column>

        <Grid.Column>
          <SharedProperty
            shared={data.margin.shared}
            label="Margin"
            value={data.margin && data.margin.margin !== undefined ? percentFormat(data.margin.margin, '') : null}
          />
        </Grid.Column>

        <Grid.Column>
          <SharedProperty
            shared={data.maximumTenor.shared}
            label="Max. tenor"
            value={
              data.maximumTenor && data.maximumTenor.maximumTenor !== undefined
                ? daysFormat(data.maximumTenor.maximumTenor, '')
                : null
            }
          />
        </Grid.Column>
      </>
    )
  }
  render() {
    const sharedData: IExtendedSharedCreditLine = { ...this.props.sharedCreditLine }
    if (!sharedData && !sharedData.data) {
      return null
    }

    const data = sharedData.data

    return (
      <Grid stackable={true}>
        <Grid.Row columns={3}>
          <Grid.Column>
            <SharedProperty shared={data.appetite && data.appetite.shared} label="Appetite" />
          </Grid.Column>

          <Grid.Column>
            <SharedProperty shared={data.availability && data.availability.shared} label="Availability (Y/N)" />
          </Grid.Column>

          <Grid.Column>
            <SharedProperty shared={data.creditLimit && data.creditLimit.shared} label="Credit limit" />
          </Grid.Column>

          {this.renderSharedValues(data)}
        </Grid.Row>
      </Grid>
    )
  }
}
