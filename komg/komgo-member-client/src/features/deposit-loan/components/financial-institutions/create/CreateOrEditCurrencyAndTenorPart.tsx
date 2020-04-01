import * as React from 'react'
import { connect, FormikProps, Field } from 'formik'
import { Form } from 'semantic-ui-react'
import styled from 'styled-components'

import CounterpartyBox from '../../../../credit-line/components/credit-appetite-shared-components/CounterpartyBox'
import { LightHeaderWrapper } from '../../../../../components/styled-components/HeaderWrapper'
import CurrencyAndTenorTextInfo from '../common/CurrencyAndTenorTextInfo'
import FieldDisplay from '../../../../credit-line/components/credit-appetite-shared-components/FieldDisplay'
import StyledBooleanRadio from '../../../../credit-line/components/credit-appetite-shared-components/StyledBooleanRadio'
import { SimpleRadioController } from '../../../../letter-of-credit-legacy/components/InputControllers/SimpleRadioController'
import {
  booleanToRadioOptions,
  FormattedInputController,
  GridDropdownController
} from '../../../../letter-of-credit-legacy/components'
import {
  formatToStringDecimalNumberWithDefaultNull,
  numberToValueWithDefaultNull
} from '../../../../credit-line/utils/formatters'
import { isErrorActive } from '../../../../trades/utils/isErrorActive'
import FieldError from '../../../../../components/error-message/FieldError'
import EditTimeWrapper from '../../../../credit-line/components/credit-appetite-shared-components/EditTimeWrapper'
import ActionTimeInfo from '../../../../credit-line/components/credit-appetite-shared-components/ActionTimeInfo'
import { getErrorForSpecificField } from '../../../../credit-line/utils/validation'
import {
  ICurrencyAndTenorOption,
  IDepositLoanForm,
  IExtendRequestDepositLoan,
  DepositLoanDetailsQuery
} from '../../../store/types'
import { getCurrencyWithTenor } from '../../../utils/selectors'
import SimpleIcon from '../../../../credit-line/components/credit-appetite-shared-components/SimpleIcon'
import { generateSharedDataFromRequests } from '../../../utils/formatters'

interface IOwnProps {
  currencyAndTenorOptions: ICurrencyAndTenorOption[]
  requests: { [currencyAndTenorStringValue: string]: IExtendRequestDepositLoan[] }
  requestParams?: DepositLoanDetailsQuery
}

interface WithFormik {
  formik: FormikProps<IDepositLoanForm>
}

interface IProps extends WithFormik, IOwnProps {}

const CUSTOM_STYLE = { width: '256px', marginBottom: 0 }
const FORM_FIELD_STYLE = { position: 'relative' }

export class CreateOrEditCurrencyAndTenorPart extends React.Component<IProps> {
  handleCurrencyAndTenorChanged = (_: React.SyntheticEvent, data: { name: string; value: string }) => {
    const { formik, requests } = this.props
    // value can be only string | number | boolean and because of that we have to parse string here
    const [currency, period, periodDuration] = data.value.split('/')
    formik.setFieldValue('currency', currency)
    formik.setFieldValue('period', period)
    formik.setFieldValue('periodDuration', periodDuration ? parseInt(periodDuration, 10) : undefined)
    if (requests && requests[data.value]) {
      formik.setFieldValue('sharedWith', generateSharedDataFromRequests(requests[data.value]))
    } else {
      formik.setFieldValue('sharedWith', generateSharedDataFromRequests([]))
    }
  }

  render() {
    const { formik, currencyAndTenorOptions, requestParams } = this.props

    return (
      <CounterpartyBox>
        <LightHeaderWrapper>
          <CurrencyAndTenorTextInfo />
        </LightHeaderWrapper>

        <FieldDisplay label="Currency and tenor">
          {formik.values.staticId || requestParams ? (
            <DepositAndLoanTitle data-test-id="currency-and-tenor-readonly">
              {getCurrencyWithTenor(formik.values)}
            </DepositAndLoanTitle>
          ) : (
            <Field
              name="currencyAndTenor"
              search={true}
              options={currencyAndTenorOptions}
              component={GridDropdownController}
              customStyle={CUSTOM_STYLE}
              placeholder="Select currency and ternor"
              customOnChange={this.handleCurrencyAndTenorChanged}
              data-test-id="currency-and-tenor"
            />
          )}
        </FieldDisplay>

        <FieldDisplay label="Appetite">
          <StyledBooleanRadio>
            <Field
              name="appetite"
              disabled={!formik.values.currency}
              fieldName="appetite"
              component={SimpleRadioController}
              options={booleanToRadioOptions}
            />
          </StyledBooleanRadio>
        </FieldDisplay>

        <FieldDisplay label="Pricing per annum" isOptional={true}>
          <Form.Field style={FORM_FIELD_STYLE}>
            <Field
              name="pricing"
              type="text"
              formatAsString={formatToStringDecimalNumberWithDefaultNull}
              toValue={numberToValueWithDefaultNull}
              component={FormattedInputController}
              disabled={!formik.values.currency}
              error={isErrorActive('pricing', formik.errors, formik.touched)}
              style={CUSTOM_STYLE}
              defaultValue={null}
              icon={<SimpleIcon>%</SimpleIcon>}
              data-test-id="pricing"
            />
            {formik.values.pricingUpdatedAt && (
              <EditTimeWrapper>
                <ActionTimeInfo time={formik.values.pricingUpdatedAt} fieldName="pricing" prefix="Last updated" />
              </EditTimeWrapper>
            )}
            <FieldError show={isErrorActive('pricing', formik.errors, formik.touched)} fieldName={'pricing'}>
              {getErrorForSpecificField('pricing', formik)}
            </FieldError>
          </Form.Field>
        </FieldDisplay>
      </CounterpartyBox>
    )
  }
}

const DepositAndLoanTitle = styled.p`
  font-weight: bold;
`

export default connect<IOwnProps, IDepositLoanForm>(CreateOrEditCurrencyAndTenorPart)
