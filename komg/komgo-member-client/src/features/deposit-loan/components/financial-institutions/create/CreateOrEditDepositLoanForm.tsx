import * as React from 'react'
import { Formik, FormikProps } from 'formik'
import { Form, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { IDepositLoanResponse, SAVE_DEPOSIT_LOAN_SCHEMA } from '@komgo/types'
import Ajv from 'ajv'

import BottomFixedActions from '../../../../../components/bottom-fixed-actions/BottomFixedActions'
import CreateOrEditCurrencyAndTenorPart from './CreateOrEditCurrencyAndTenorPart'
import {
  IExtendedDepositLoanResponse,
  ICurrencyAndTenorOption,
  IDepositLoanForm,
  IExtendRequestDepositLoan,
  DepositLoanDetailsQuery
} from '../../../store/types'
import { createDefaultCurrencyAndPeriodDropdownOptions } from '../../../utils/factories'
import { filterOutAlredayExistsCurrencyAndTenor, removeUnnecessaryData } from '../../../utils/filters'
import CreateOrEditSharedWithPart from './CreateOrEditSharedWithPart'
import { Counterparty } from '../../../../counterparties/store/types'
import { toFormikErrors } from '../../../../../utils/validator'

const validator = new Ajv({ allErrors: true, $data: true })
validator.addSchema(SAVE_DEPOSIT_LOAN_SCHEMA)

const validate = (values: IDepositLoanForm) => {
  let errors = {}
  const formattedValues: IDepositLoanForm = removeUnnecessaryData(values)
  if (!validator.validate((SAVE_DEPOSIT_LOAN_SCHEMA as any).$id, formattedValues)) {
    errors = toFormikErrors(validator.errors)
  }
  return errors
}

interface IProps {
  depositLoan?: IExtendedDepositLoanResponse
  depositsLoans: IDepositLoanResponse[]
  initialValues: IDepositLoanForm
  isEdit: boolean
  counterparties: Counterparty[]
  requests: { [currencyAndTenorStringValue: string]: IExtendRequestDepositLoan[] }
  requestParams?: DepositLoanDetailsQuery
  handleSubmit(data: IDepositLoanForm): void
  handleGoBack(): void
  handleDeclineRequests(currencyAndTenorString: string): void
}

class CreateOrEditDepositLoanForm extends React.Component<IProps> {
  private defaultCurrencyAndTenorOptions: ICurrencyAndTenorOption[]

  constructor(props: IProps) {
    super(props)
    this.defaultCurrencyAndTenorOptions = filterOutAlredayExistsCurrencyAndTenor(
      createDefaultCurrencyAndPeriodDropdownOptions(),
      props.depositsLoans
    )

    this.submit = this.submit.bind(this)
  }

  submit(values: IDepositLoanForm) {
    this.props.handleSubmit(removeUnnecessaryData(values))
  }

  render() {
    const { initialValues, isEdit, handleGoBack, counterparties, requests, requestParams } = this.props
    return (
      <Formik
        initialValues={initialValues}
        onSubmit={this.submit}
        validate={validate}
        validateOnBlur={false}
        validateOnChange={true}
        render={(formik: FormikProps<IDepositLoanForm>) => (
          <FormWrapper>
            <Form onSubmit={formik.handleSubmit}>
              <CreateOrEditCurrencyAndTenorPart
                currencyAndTenorOptions={this.defaultCurrencyAndTenorOptions}
                requests={requests}
                requestParams={requestParams}
              />

              {requests &&
                requests[formik.values.currencyAndTenor] && (
                  <CreateOrEditSharedWithPart
                    counterparties={counterparties}
                    requested={true}
                    requests={requests[formik.values.currencyAndTenor] || []}
                  />
                )}

              <CreateOrEditSharedWithPart counterparties={counterparties} requested={false} />

              <BottomFixedActions>
                <Button
                  primary={true}
                  type="submit"
                  floated="right"
                  disabled={!formik.values.currency}
                  data-test-id="submit"
                >
                  {isEdit ? 'Update' : 'Add currency and tenor'}
                </Button>
                {requests &&
                  requests[formik.values.currencyAndTenor] &&
                  !isEdit && (
                    <Button
                      data-test-id="decline-all-requests"
                      onClick={() => this.props.handleDeclineRequests(formik.values.currencyAndTenor)}
                      type="button"
                      floated="right"
                      negative={true}
                    >
                      {' '}
                      Cancel all requests
                    </Button>
                  )}
                <Button onClick={handleGoBack} data-test-id="cancel" type="button" floated="right">
                  Cancel
                </Button>
              </BottomFixedActions>
            </Form>
          </FormWrapper>
        )}
      />
    )
  }
}

const FormWrapper = styled.section`
  padding-bottom: 64px;
`

export default CreateOrEditDepositLoanForm
