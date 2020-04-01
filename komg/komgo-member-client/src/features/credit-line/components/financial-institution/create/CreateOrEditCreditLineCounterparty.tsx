import * as React from 'react'
import { connect, FormikProps, Field } from 'formik'
import { ICreateOrEditCreditLineForm, IExtendedCreditLineRequest, CreditLineType } from '../../../store/types'
import { Form, Popup } from 'semantic-ui-react'
import styled from 'styled-components'
import { Currency } from '@komgo/types'

import {
  GridDropdownController,
  booleanToRadioOptions,
  FormattedInputController,
  enumToDropdownOptions,
  GridTextController
} from '../../../../letter-of-credit-legacy/components'
import { SimpleRadioController } from '../../../../letter-of-credit-legacy/components/InputControllers/SimpleRadioController'
import { isErrorActive } from '../../../../trades/utils/isErrorActive'
import FieldError from '../../../../../components/error-message/FieldError'
import FieldDisplay from '../../credit-appetite-shared-components/FieldDisplay'
import {
  CREDIT_LIMIT_AMOUNT_FIELD,
  AVAILABILITY_AMOUNT_FIELD,
  FEE_FIELD,
  MAXIMUM_TENOR_FIELD,
  AVAILABILITY_RESERVED_AMOUNT_FIELD
} from '../../../constants'
import {
  numberToValueWithDefaultNull,
  formatToStringDayInputWithDefaultNull,
  formatToStringDecimalNumberWithDefaultNull,
  generateSharedDataFromRequests
} from '../../../utils/formatters'
import _ from 'lodash'
import { getErrorForSpecificField } from '../../../utils/validation'
import ActionTimeInfo from '../../credit-appetite-shared-components/ActionTimeInfo'
import { Action } from '../../../containers/financial-institution/CreateOrEditCreditLine'
import { IMember } from '../../../../members/store/types'
import { getCompanyName } from '../../../../counterparties/utils/selectors'
import { dictionary } from '../../../dictionary'
import { truncate } from '../../../../../utils/casings'
import EditTimeWrapper from '../../credit-appetite-shared-components/EditTimeWrapper'
import StyledBooleanRadio from '../../credit-appetite-shared-components/StyledBooleanRadio'
import SimpleIcon from '../../credit-appetite-shared-components/SimpleIcon'
import { LightHeaderWrapper } from '../../../../../components/styled-components'

interface IOwnProps {
  members: IMember[]
  currentAction: Action
  buyer?: IMember
  allRequests: {
    [buyerId: string]: IExtendedCreditLineRequest[]
  }
  feature: CreditLineType
}

interface WithFormik {
  formik: FormikProps<ICreateOrEditCreditLineForm>
}

interface IProps extends WithFormik, IOwnProps {}

const CUSTOM_STYLE = { width: '256px', marginBottom: 0 }
const FORM_FIELD_STYLE = { position: 'relative' }

export class CreateOrEditCreditLineCounterparty extends React.Component<IProps> {
  attachSellersFromRequest = (e: React.SyntheticEvent, data: { name: string; value: string }) => {
    const { formik, allRequests } = this.props
    const sellersFromRequest = allRequests[data.value]
    if (sellersFromRequest) {
      formik.setFieldValue('sharedCreditLines', generateSharedDataFromRequests(sellersFromRequest as any))
    } else {
      formik.setFieldValue('sharedCreditLines', generateSharedDataFromRequests([]))
    }
  }

  renderCounterpartyField = () => {
    const { formik, members } = this.props
    const selected = members.find(m => m.staticId === formik.values.counterpartyStaticId)
    // We are going to implement change button here next sprint
    return <BuyerName data-test-id="counterparty-name">{getCompanyName(selected)}</BuyerName>
  }

  render() {
    const { formik, buyer, feature } = this.props
    return (
      <React.Fragment>
        <LightHeaderWrapper>
          <h3>{dictionary[feature].financialInstitution.createOrEdit.counterpartyTitle}</h3>
          <ItalicText data-test-id="create-counterparty-text-info">
            {dictionary[feature].financialInstitution.createOrEdit.counterpartyText}
          </ItalicText>
        </LightHeaderWrapper>
        <FieldDisplay label={dictionary[feature].financialInstitution.createOrEdit.counterpartyFieldLabel}>
          {buyer ? (
            <BuyerName data-test-id="counterparty-name">{getCompanyName(buyer)}</BuyerName>
          ) : (
            this.renderCounterpartyField()
          )}
        </FieldDisplay>

        <FieldDisplay label="Appetite">
          <StyledBooleanRadio>
            <Field
              name="appetite"
              disabled={formik.values.counterpartyStaticId === ''}
              fieldName="appetite"
              component={SimpleRadioController}
              options={booleanToRadioOptions}
            />
          </StyledBooleanRadio>
        </FieldDisplay>

        <FieldDisplay label="Currency">
          <Field
            name="currency"
            search={true}
            options={enumToDropdownOptions(Currency, true)}
            component={GridDropdownController}
            disabled={formik.values.counterpartyStaticId === ''}
            customStyle={CUSTOM_STYLE}
          />
        </FieldDisplay>

        <FieldDisplay label="Credit limit" isOptional={true}>
          <Form.Field style={FORM_FIELD_STYLE}>
            <Field
              name={CREDIT_LIMIT_AMOUNT_FIELD}
              type="text"
              formatAsString={formatToStringDecimalNumberWithDefaultNull}
              toValue={numberToValueWithDefaultNull}
              component={FormattedInputController}
              disabled={formik.values.counterpartyStaticId === ''}
              error={isErrorActive(CREDIT_LIMIT_AMOUNT_FIELD, formik.errors, formik.touched)}
              style={CUSTOM_STYLE}
              defaultValue={null}
            />
            <FieldError
              show={isErrorActive(CREDIT_LIMIT_AMOUNT_FIELD, formik.errors, formik.touched)}
              fieldName={CREDIT_LIMIT_AMOUNT_FIELD}
            >
              {getErrorForSpecificField(CREDIT_LIMIT_AMOUNT_FIELD, formik)}
            </FieldError>
          </Form.Field>
        </FieldDisplay>

        <FieldDisplay label="Credit expiry date" isOptional={true}>
          <Field
            name="creditExpiryDate"
            fieldName="creditExpiryDate"
            hideLabel={true}
            type="date"
            fieldStyle={{ width: '100%' }}
            component={GridTextController}
            value={formik.values.creditExpiryDate}
            customStyle={CUSTOM_STYLE}
            disabled={formik.values.counterpartyStaticId === ''}
          />
        </FieldDisplay>

        <FieldDisplay label="Availability" isOptional={true}>
          <StyledBooleanRadio>
            <Field
              name="availability"
              fieldName="availability"
              component={SimpleRadioController}
              options={booleanToRadioOptions}
              disabled={formik.values.counterpartyStaticId === ''}
            />
          </StyledBooleanRadio>
        </FieldDisplay>

        <FieldDisplay label="Amount availability" isOptional={true}>
          <Form.Field style={FORM_FIELD_STYLE}>
            <Field
              name={AVAILABILITY_AMOUNT_FIELD}
              type="text"
              formatAsString={formatToStringDecimalNumberWithDefaultNull}
              toValue={numberToValueWithDefaultNull}
              component={FormattedInputController}
              disabled={formik.values.counterpartyStaticId === ''}
              error={isErrorActive(AVAILABILITY_AMOUNT_FIELD, formik.errors, formik.touched)}
              style={CUSTOM_STYLE}
              defaultValue={null}
            />
            {formik.values.availabilityAmountUpdatedAt && (
              <EditTimeWrapper>
                <ActionTimeInfo
                  time={formik.values.availabilityAmountUpdatedAt}
                  fieldName="amountAvailable"
                  prefix="Last updated"
                />
              </EditTimeWrapper>
            )}
            <FieldError
              show={isErrorActive(AVAILABILITY_AMOUNT_FIELD, formik.errors, formik.touched)}
              fieldName={AVAILABILITY_AMOUNT_FIELD}
            >
              {getErrorForSpecificField(AVAILABILITY_AMOUNT_FIELD, formik)}
            </FieldError>
          </Form.Field>
        </FieldDisplay>

        <FieldDisplay label="Availability reserved" isOptional={true}>
          <Form.Field style={FORM_FIELD_STYLE}>
            <Field
              name={AVAILABILITY_RESERVED_AMOUNT_FIELD}
              type="text"
              formatAsString={formatToStringDecimalNumberWithDefaultNull}
              toValue={numberToValueWithDefaultNull}
              component={FormattedInputController}
              disabled={formik.values.counterpartyStaticId === ''}
              error={isErrorActive(AVAILABILITY_RESERVED_AMOUNT_FIELD, formik.errors, formik.touched)}
              style={CUSTOM_STYLE}
              defaultValue={null}
            />
            {formik.values.data.availabilityReservedUpdatedAt && (
              <EditTimeWrapper>
                <ActionTimeInfo
                  time={formik.values.data.availabilityReservedUpdatedAt}
                  fieldName="availabilityReserved"
                  prefix="Last updated"
                />
              </EditTimeWrapper>
            )}
            <FieldError
              show={isErrorActive(AVAILABILITY_RESERVED_AMOUNT_FIELD, formik.errors, formik.touched)}
              fieldName="availabilityReserved"
            >
              {getErrorForSpecificField(AVAILABILITY_RESERVED_AMOUNT_FIELD, formik)}
            </FieldError>
          </Form.Field>
        </FieldDisplay>

        <FieldDisplay label={dictionary[feature].financialInstitution.createOrEdit.feeFieldLabel} isOptional={true}>
          <Form.Field style={FORM_FIELD_STYLE}>
            <Field
              type="text"
              name={FEE_FIELD}
              value={formik.values.data.fee}
              formatAsString={formatToStringDecimalNumberWithDefaultNull}
              toValue={numberToValueWithDefaultNull}
              component={FormattedInputController}
              disabled={formik.values.counterpartyStaticId === ''}
              error={isErrorActive(FEE_FIELD, formik.errors, formik.touched)}
              icon={<SimpleIcon>%</SimpleIcon>}
              style={CUSTOM_STYLE}
              defaultValue={null}
            />
            <FieldError show={isErrorActive(FEE_FIELD, formik.errors, formik.touched)} fieldName="fee">
              {getErrorForSpecificField(FEE_FIELD, formik)}
            </FieldError>
          </Form.Field>
        </FieldDisplay>

        <FieldDisplay label="Maximum tenor" isOptional={true}>
          <Form.Field style={FORM_FIELD_STYLE}>
            <Field
              name={MAXIMUM_TENOR_FIELD}
              type="text"
              icon={<SimpleIcon>days</SimpleIcon>}
              formatAsString={formatToStringDayInputWithDefaultNull}
              toValue={numberToValueWithDefaultNull}
              component={FormattedInputController}
              disabled={formik.values.counterpartyStaticId === ''}
              error={isErrorActive(MAXIMUM_TENOR_FIELD, formik.errors, formik.touched)}
              style={CUSTOM_STYLE}
              defaultValue={null}
            />
            <FieldError
              show={isErrorActive(MAXIMUM_TENOR_FIELD, formik.errors, formik.touched)}
              fieldName="maximumTenor"
            >
              {getErrorForSpecificField(MAXIMUM_TENOR_FIELD, formik)}
            </FieldError>
          </Form.Field>
        </FieldDisplay>
      </React.Fragment>
    )
  }
}

const ItalicText = styled.p`
  font-style: italic;
  width: 80%;
`

const BuyerName = styled.p`
  font-weight: bold;
`

export default connect<IOwnProps, ICreateOrEditCreditLineForm>(CreateOrEditCreditLineCounterparty)
