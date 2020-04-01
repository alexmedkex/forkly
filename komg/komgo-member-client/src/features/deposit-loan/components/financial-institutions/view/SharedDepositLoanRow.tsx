import React from 'react'
import { Grid } from 'semantic-ui-react'

import SharedInfoRowWrapper from './SharedInfoRowWrapper'
import SharedProperty from '../../../../credit-line/components/credit-appetite-shared-components/SharedProperty'
import { percentFormat } from '../../../../credit-line/utils/formatters'
import { displayDate } from '../../../../../utils/date'
import { IExtendedSharedWith } from '../../../store/types'

export interface IProps {
  sharedDepositLoan: IExtendedSharedWith
}

const SharedDepositLoanRow: React.FC<IProps> = (props: IProps) => {
  const { sharedDepositLoan } = props

  return (
    <SharedInfoRowWrapper>
      <Grid stackable={true} colums={2}>
        <Grid.Column width={3}>
          <p>
            <b data-test-id={`counterparty-name-${sharedDepositLoan.sharedWithStaticId}`}>
              {sharedDepositLoan.sharedWithCompanyName}
            </b>
          </p>
          <p>
            <small className="grey" data-test-id={`last-updated-${sharedDepositLoan.sharedWithStaticId}`}>
              Updated on {displayDate(sharedDepositLoan.updatedAt)}
            </small>
          </p>
        </Grid.Column>

        <Grid.Column width={13}>
          <Grid stackable={true}>
            <Grid.Row columns={3}>
              <Grid.Column data-test-id={`appetite-${sharedDepositLoan.sharedWithStaticId}`}>
                <SharedProperty
                  shared={sharedDepositLoan.appetite && sharedDepositLoan.appetite.shared}
                  label="Appetite"
                />
              </Grid.Column>
              <Grid.Column data-test-id={`appetite-${sharedDepositLoan.sharedWithStaticId}`}>
                <SharedProperty
                  shared={sharedDepositLoan.pricing && sharedDepositLoan.pricing.shared}
                  label="Pricing per annum"
                  value={
                    sharedDepositLoan.pricing && sharedDepositLoan.pricing.pricing !== undefined
                      ? percentFormat(sharedDepositLoan.pricing.pricing, '')
                      : null
                  }
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
      </Grid>
    </SharedInfoRowWrapper>
  )
}

export default SharedDepositLoanRow
