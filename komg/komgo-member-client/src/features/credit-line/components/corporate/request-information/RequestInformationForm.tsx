import * as React from 'react'
import styled from 'styled-components'
import { Formik, FormikProps, Field } from 'formik'
import { Form, Button, Popup, Icon } from 'semantic-ui-react'

import SearchCheckboxes from '../../../../../components/form/search-checkboxes/SearchCheckboxes'
import { Counterparty } from '../../../../counterparties/store/types'
import { GridDropdownController, CheckboxController } from '../../../../letter-of-credit-legacy/components'
import InputController from '../../../../../components/form/input/InputController'
import BottomFixedActions from '../../../../../components/bottom-fixed-actions/BottomFixedActions'
import { IRequestInformationForm } from '../../../store/types'
import { displayDate } from '../../../../../utils/date'
import { getCompanyName } from '../../../../counterparties/utils/selectors'
import { IMember } from '../../../../members/store/types'
import { SPACES } from '@komgo/ui-components'

interface IDisclosedInforamtion {
  ownerStaticId?: string
  updatedAt: string
}

interface IProps {
  requestingIdOptions: any[]
  updatingItemName?: string
  dictionary: any
  counterparties: Counterparty[]
  disclosedItems: IDisclosedInforamtion[]
  initialValues: IRequestInformationForm
  predefinedRequestFor?: IMember
  handleGoBack(): void
  handleSubmit(values: IRequestInformationForm): void
}

const SelectedCounterparty = styled.div`
  margin: ${SPACES.DEFAULT} 0;
  p {
    font-weight: 700;
  }
`

class RequestInformationForm extends React.Component<IProps> {
  getBanksDropdownItems = (counterpartyStaticId: string) => {
    if (!this.props.updatingItemName) {
      const options = this.props.counterparties
        .filter(counterparty => counterparty.isFinancialInstitution && counterparty.staticId !== counterpartyStaticId)
        .map(counterparty => ({
          name: getCompanyName(counterparty),
          value: counterparty.staticId
        }))
      return options
    }
  }

  getBanksDropdownGroupItems = (counterpartyStaticId: string) => {
    const { updatingItemName, disclosedItems, counterparties } = this.props
    if (updatingItemName) {
      const bankIdsThatAlreadyDisclosedInfo = disclosedItems.map(line => line.ownerStaticId)
      const banks = counterparties.filter(
        counterparty => counterparty.isFinancialInstitution && counterpartyStaticId !== counterparty.staticId
      )

      const banksThatAlreadyDisclosedInfo = banks
        .filter(bank => bankIdsThatAlreadyDisclosedInfo.includes(bank.staticId))
        .map(bank => ({
          name: getCompanyName(bank),
          value: bank.staticId,
          info: `Updated information on ${displayDate(
            disclosedItems.find(line => line.ownerStaticId === bank.staticId).updatedAt
          )}`
        }))

      const banksThathaveNotDisclosedInfo = banks
        .filter(bank => !bankIdsThatAlreadyDisclosedInfo.includes(bank.staticId))
        .map(bank => ({
          name: getCompanyName(bank),
          value: bank.staticId
        }))

      return [
        {
          label: `Banks which disclosed information ${updatingItemName ? `on ${updatingItemName}` : ''}`,
          options: banksThatAlreadyDisclosedInfo
        },
        {
          label: `Banks which have not disclosed information ${updatingItemName ? `on ${updatingItemName}` : ''}`,
          options: banksThathaveNotDisclosedInfo
        }
      ]
    }
  }

  render() {
    const {
      handleSubmit,
      handleGoBack,
      updatingItemName,
      initialValues,
      requestingIdOptions,
      dictionary,
      predefinedRequestFor
    } = this.props
    return (
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={() => undefined}
        validateOnBlur={false}
        validateOnChange={true}
        render={(formik: FormikProps<IRequestInformationForm>) => (
          <FormWrapper>
            <Form onSubmit={formik.handleSubmit}>
              {!updatingItemName &&
                !predefinedRequestFor && (
                  <FieldWrapper>
                    <Field
                      name="requestForId"
                      fieldName={dictionary.counterpartyFieldLabel}
                      search={true}
                      options={requestingIdOptions}
                      component={GridDropdownController}
                      customStyle={{ width: '100%' }}
                      placeholder={dictionary.counterpartyFieldPlaceholder}
                    />
                  </FieldWrapper>
                )}
              {predefinedRequestFor ? (
                <SelectedCounterparty>
                  <p data-test-id="counterparty-name">{getCompanyName(predefinedRequestFor)}</p>
                </SelectedCounterparty>
              ) : null}
              <FieldWrapper>
                <SearchCheckboxes
                  options={this.getBanksDropdownItems(formik.values.requestForId)}
                  optionsGroups={this.getBanksDropdownGroupItems(formik.values.requestForId)}
                  itemsToShow={6}
                  name="companyIds"
                  onChange={formik.setFieldValue}
                  onTouched={formik.setFieldTouched}
                  label="Select banks to send the request to"
                />
              </FieldWrapper>
              <MailToWrapper>
                <Field
                  data-test-id="select-mailto-option"
                  name="mailTo"
                  component={CheckboxController}
                  fieldName="Send to financial institutions which are not in the list above"
                />
                <Popup
                  content="By selecting this option, when you send your request an email will be automatically generated allowing you to send the request to financial institutions that are not in the list above."
                  trigger={<Icon name="question circle" style={{ marginLeft: '5px' }} />}
                  on="hover"
                  inverted={true}
                  position="right center"
                />
              </MailToWrapper>
              <FieldTextareaWrapper>
                <Field
                  type="textarea"
                  name="comment"
                  label="Comment"
                  value={formik.values.comment}
                  component={InputController}
                  error={false}
                  disabled={false}
                  info="Add any additional information you feel necessary to disclose with the selected banks."
                  rows={8}
                  placeholder={dictionary.commentPlaceholder}
                />
              </FieldTextareaWrapper>
              <BottomFixedActions>
                <Button
                  primary={true}
                  type="submit"
                  floated="right"
                  data-test-id="submit"
                  disabled={
                    formik.values.requestForId === '' ||
                    formik.values.companyIds.length === 0 ||
                    formik.values.comment === ''
                  }
                >
                  Send request
                </Button>
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

export const FieldWrapper = styled.div`
  width: 460px;
  margin-bottom: 30px;
  @media (max-width: 768px) {
    width: 100%;
  }
`

export const MailToWrapper = styled(FieldWrapper)`
  label {
    font-weight: bold;
  }
  .inline.field {
    display: inline-block;
  }
`

const FieldTextareaWrapper = styled.div`
  width: 600px;
  @media (max-width: 900px) {
    width: 100%;
  }
`

const FormWrapper = styled.section`
  padding-bottom: 64px;
`

export default RequestInformationForm
