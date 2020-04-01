import * as React from 'react'
import { Formik, FormikProps } from 'formik'
import { Form, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import * as H from 'history'
import { RISK_COVER_REQUEST_SCHEMA } from '@komgo/types'
import Ajv from 'ajv'
import _ from 'lodash'

import BottomFixedActions from '../../../../../components/bottom-fixed-actions/BottomFixedActions'
import { Counterparty } from '../../../../counterparties/store/types'
import { ICreateOrEditCreditLineForm, IExtendedCreditLineRequest, CreditLineType } from '../../../store/types'
import { toFormikErrors } from '../../../../../utils/validator'
import CounterpartyBox from '../../credit-appetite-shared-components/CounterpartyBox'
import { IMember } from '../../../../members/store/types'
import CreateOrEditCreditLineSharedWithCompany from './CreateOrEditCreditLineSharedWithCompany'
import { formatCreditLineFormValues } from '../../../utils/formatters'
import { Action } from '../../../containers/financial-institution/CreateOrEditCreditLine'
import CreateOrEditCreditLineCounterparty from './CreateOrEditCreditLineCounterparty'
import { dictionary } from '../../../dictionary'

const validatorRiskCover = new Ajv({ allErrors: true, $data: true })
validatorRiskCover.addSchema(RISK_COVER_REQUEST_SCHEMA)

const validate = (values: ICreateOrEditCreditLineForm) => {
  let errors = {}
  const formattedValues: ICreateOrEditCreditLineForm = formatCreditLineFormValues(values)
  if (!validatorRiskCover.validate((RISK_COVER_REQUEST_SCHEMA as any).$id, formattedValues)) {
    errors = toFormikErrors(validatorRiskCover.errors)
  }
  return errors
}

interface IProps {
  initialValues: ICreateOrEditCreditLineForm
  handleSubmit: any
  history: H.History
  counterparties: Counterparty[]
  currentAction: Action
  buyer?: IMember
  requests: {
    [buyerId: string]: IExtendedCreditLineRequest[]
  }
  feature: CreditLineType
  members: IMember[]
  handleDeclineAllRequests(requests: IExtendedCreditLineRequest[]): void
}

class CreateOrEditCreditLineForm extends React.Component<IProps> {
  submit = (values: ICreateOrEditCreditLineForm) => {
    this.props.handleSubmit(formatCreditLineFormValues(values))
  }

  handleDeclineRequests = (buyerId: string) => {
    this.props.handleDeclineAllRequests(this.props.requests[buyerId])
  }

  render() {
    const { initialValues, history, counterparties, currentAction, buyer, requests, feature, members } = this.props
    const isEdit =
      this.props.currentAction === Action.EditRiskCover || this.props.currentAction === Action.EditRiskCoverFromRequest
    return (
      <Formik
        initialValues={initialValues}
        onSubmit={this.submit}
        validate={validate}
        validateOnBlur={false}
        validateOnChange={true}
        render={(formik: FormikProps<ICreateOrEditCreditLineForm>) => (
          <FormWrapper>
            <Form onSubmit={formik.handleSubmit}>
              <CounterpartyBox>
                <CreateOrEditCreditLineCounterparty
                  members={members}
                  currentAction={currentAction}
                  buyer={buyer}
                  allRequests={requests}
                  feature={feature}
                />
              </CounterpartyBox>

              {requests[formik.values.counterpartyStaticId] && (
                <CreateOrEditCreditLineSharedWithCompany
                  counterparties={counterparties}
                  currentAction={currentAction}
                  requested={true}
                  requests={requests[formik.values.counterpartyStaticId]}
                  feature={feature}
                  members={members}
                />
              )}

              <CreateOrEditCreditLineSharedWithCompany
                counterparties={counterparties}
                currentAction={currentAction}
                requested={false}
                requests={requests[formik.values.counterpartyStaticId]}
                feature={feature}
                members={members}
              />

              <BottomFixedActions>
                <Button
                  primary={true}
                  type="submit"
                  floated="right"
                  disabled={formik.values.counterpartyStaticId === ''}
                  data-test-id="submit"
                >
                  {isEdit ? 'Update' : `Add ${dictionary[feature].financialInstitution.createOrEdit.counterpartyRole}`}
                </Button>
                {requests[formik.values.counterpartyStaticId] &&
                  !isEdit && (
                    <Button
                      data-test-id="decline-all-requests"
                      onClick={() => this.handleDeclineRequests(formik.values.counterpartyStaticId)}
                      type="button"
                      floated="right"
                      negative={true}
                    >
                      {' '}
                      Cancel all requests
                    </Button>
                  )}
                <Button onClick={history.goBack} data-test-id="cancel" type="button" floated="right">
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

export default CreateOrEditCreditLineForm
