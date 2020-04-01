import * as React from 'react'
import { connect, FormikProps, Field, FieldArray, ArrayHelpers } from 'formik'
import { Grid, Popup, Modal, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import _ from 'lodash'

import { LightHeaderWrapper } from '../../../../../components/styled-components/HeaderWrapper'
import {
  FormattedInputController,
  GridDropdownController,
  CheckboxController
} from '../../../../letter-of-credit-legacy/components'
import {
  numberToValueWithDefaultNull,
  formatToStringDecimalNumberWithDefaultNull
} from '../../../../credit-line/utils/formatters'
import { isErrorActive } from '../../../../trades/utils/isErrorActive'
import FieldError from '../../../../../components/error-message/FieldError'
import { getErrorForSpecificField } from '../../../../credit-line/utils/validation'
import { IDepositLoanForm, IExtendRequestDepositLoan } from '../../../store/types'
import SimpleButton from '../../../../../components/buttons/SimpleButton'
import SharedWithRow from '../../../../credit-line/components/credit-appetite-shared-components/SharedWithRow'
import ColumnWithRemoveButton from '../../../../credit-line/components/credit-appetite-shared-components/ColumnWithRemoveButton'
import {
  CheckboxGrid,
  CheckboxColumn,
  CheckboxWrapper
} from '../../../../credit-line/components/credit-appetite-shared-components/CheckboxStyledComponents'
import { displayDate } from '../../../../../utils/date'
import SharedWithCounterpartiesTextInfo from '../common/SharedWithCounterpartiesTextInfo'
import SimpleIcon from '../../../../credit-line/components/credit-appetite-shared-components/SimpleIcon'
import { Counterparty } from '../../../../counterparties/store/types'
import { defaultShared } from '../../../constants'
import { findCounterpartyByStatic } from '../../../../letter-of-credit-legacy/utils/selectors'
import { getCompanyName } from '../../../../counterparties/utils/selectors'
import ConfirmWrapper, {
  ConfirmAction
} from '../../../../credit-line/components/credit-appetite-shared-components/ConfirmWrapper'
import RemoveCounterpartyConfirmContent from './RemoveCounterpartyConfirmContent'

interface IOwnProps {
  counterparties: Counterparty[]
  requested: boolean
  requests?: IExtendRequestDepositLoan[]
}

interface WithFormik {
  formik: FormikProps<IDepositLoanForm>
}

interface IProps extends WithFormik, IOwnProps {}

const CHECKBOX_FIELD_STYLE = { height: '32px', paddingTop: '9px' }
const INPUT_FIELD_STYLE = { width: '100px', marginLeft: '20px', marginTop: '-2px', marginBottom: 0 }

interface IState {
  removeSharedWithId?: number
  arrayHelpers?: ArrayHelpers
  requestCommentOpen?: IExtendRequestDepositLoan
}

export class CreateOrEditSharedWithPart extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {}

    this.handleRemoveSharedWithCounterparty = this.handleRemoveSharedWithCounterparty.bind(this)
    this.handleConfirmRemove = this.handleConfirmRemove.bind(this)
    this.handleCancelConfirmRemove = this.handleCancelConfirmRemove.bind(this)
    this.handleOpenCommentModal = this.handleOpenCommentModal.bind(this)
    this.handleCloseCommentModal = this.handleCloseCommentModal.bind(this)
  }

  componentDidUpdate() {
    const { formik } = this.props
    const { values } = formik
    if (!values.sharedWith || !values.sharedWith.find(item => !item.sharedWithStaticId)) {
      const sharedWith = values.sharedWith || []
      sharedWith.push(_.cloneDeep(defaultShared))
      formik.setFieldValue('sharedWith', sharedWith)
    }
  }

  handleRemoveSharedWithCounterparty(removeSharedWithId: number, arrayHelpers: ArrayHelpers) {
    this.setState({
      removeSharedWithId,
      arrayHelpers
    })
  }

  handleConfirmRemove() {
    const { removeSharedWithId, arrayHelpers } = this.state
    arrayHelpers.remove(removeSharedWithId)
    this.handleCancelConfirmRemove()
  }

  handleCancelConfirmRemove() {
    this.setState({
      removeSharedWithId: undefined,
      arrayHelpers: undefined
    })
  }

  getCounterpartiesDropdownOptions() {
    const { formik, counterparties } = this.props
    const alreadyShared = formik.values.sharedWith.map(sharedInfo => sharedInfo.sharedWithStaticId)
    return counterparties.filter(counterparty => !alreadyShared.includes(counterparty.staticId)).map(counterparty => ({
      value: counterparty.staticId,
      text: counterparty.x500Name.CN,
      content: counterparty.x500Name.CN
    }))
  }

  handleOpenCommentModal(requestCommentOpen: IExtendRequestDepositLoan) {
    this.setState({
      requestCommentOpen
    })
  }

  handleCloseCommentModal() {
    this.setState({
      requestCommentOpen: undefined
    })
  }

  renderSharedWithDropdown(values: IDepositLoanForm, index: number) {
    const { requests, requested, counterparties } = this.props
    let request
    if (requested) {
      request = requests.find(r => r.staticId === values.sharedWith[index].requestStaticId) as IExtendRequestDepositLoan
    }
    if (values.sharedWith[index].sharedWithStaticId) {
      return (
        <Grid.Column computer={3} tablet={16}>
          <BoldText data-test-id={`counterparty-selected-${values.sharedWith[index].sharedWithStaticId}`}>
            {values.sharedWith[index].sharedWithCompanyName ||
              getCompanyName(findCounterpartyByStatic(counterparties, values.sharedWith[index].sharedWithStaticId))}
          </BoldText>
          {values.sharedWith[index].updatedAt ? (
            <p>
              <small className="grey">Updated on {displayDate(values.sharedWith[index].updatedAt)}</small>
            </p>
          ) : null}
          {request && request.comment ? (
            <SimpleButton
              onClick={() => this.handleOpenCommentModal(request)}
              type="button"
              style={{ padding: 0, textDecoration: 'underline' }}
            >
              View Comment
            </SimpleButton>
          ) : null}
        </Grid.Column>
      )
    }

    return (
      <Grid.Column computer={3} tablet={16}>
        <Field
          name={`sharedWith[${index}].sharedWithStaticId`}
          search={!values.currency ? undefined : true}
          disabled={!values.currency}
          options={this.getCounterpartiesDropdownOptions()}
          component={GridDropdownController}
          placeholder="Select counterparty"
          customStyle={{ width: '80%' }}
          data-test-id="counterparty-select"
        />
      </Grid.Column>
    )
  }

  printCheckboxOrPopup = (component: React.ReactNode, disabled: boolean, popupMessage: string): React.ReactNode => {
    if (disabled) {
      return <Popup content={popupMessage} trigger={component} on="hover" inverted={true} position="bottom left" />
    }
    return component
  }

  getTooltipContent = () => {
    const { formik } = this.props
    return !formik.values.appetite
      ? `Currency and tenor appetite must be set to "Yes" and disclosed to share information`
      : `Appetite must be disclosed to the counteparty before you can disclose other currency and tenor information`
  }

  renderPricing = (formik: FormikProps<IDepositLoanForm>, index: number) => {
    const checkboxFieldName = `sharedWith[${index}].pricing.shared`
    const amountFieldName = `sharedWith[${index}].pricing.pricing`
    const disabledCheckbox = !formik.values.appetite || !formik.values.sharedWith[index].appetite.shared

    return this.printCheckboxOrPopup(
      <CheckboxWrapper>
        <Field
          name={checkboxFieldName}
          disabled={disabledCheckbox}
          component={CheckboxController}
          fieldName="Pricing per annum"
          style={{ ...CHECKBOX_FIELD_STYLE }}
          data-test-id={`pricing-check-${formik.values.sharedWith[index].sharedWithStaticId}`}
        />
        <Field
          name={amountFieldName}
          type="text"
          icon={<SimpleIcon>%</SimpleIcon>}
          formatAsString={formatToStringDecimalNumberWithDefaultNull}
          toValue={numberToValueWithDefaultNull}
          component={FormattedInputController}
          disabled={disabledCheckbox || !formik.values.sharedWith[index].pricing.shared}
          error={isErrorActive(amountFieldName, formik.errors, formik.touched)}
          style={INPUT_FIELD_STYLE}
          defaultValue={null}
          data-test-id={`pricing-input-${formik.values.sharedWith[index].sharedWithStaticId}`}
        />
        <FieldError show={isErrorActive(amountFieldName, formik.errors, formik.touched)} fieldName={amountFieldName}>
          {getErrorForSpecificField(amountFieldName, formik)}
        </FieldError>
        <FieldError
          show={
            formik.values.pricing !== null &&
            !!_.get(formik.touched, amountFieldName) &&
            formik.values.sharedWith[index].pricing.pricing !== null &&
            formik.values.sharedWith[index].pricing.pricing < formik.values.pricing
          }
          fieldName="Pricing per annum"
        >
          Lower than your "Pricing Fee"
        </FieldError>
      </CheckboxWrapper>,
      disabledCheckbox,
      this.getTooltipContent()
    )
  }

  render() {
    const { formik, counterparties, requested } = this.props
    const { values } = formik
    const { removeSharedWithId, requestCommentOpen } = this.state
    return (
      <Wrapper>
        <StyledHeaderWrapper>
          <SharedWithCounterpartiesTextInfo requested={requested} values={values} />
        </StyledHeaderWrapper>

        <FieldArray
          name="sharedWith"
          render={arrayHelpers => (
            <React.Fragment>
              {values.sharedWith.map((sharedDepositLoan, index) => {
                return (requested && sharedDepositLoan.requestStaticId) ||
                  (!requested && !sharedDepositLoan.requestStaticId) ? (
                  <SharedWithRow key={index} requested={requested} index={index}>
                    <Grid>
                      <Grid.Column computer={3} tablet={16}>
                        {this.renderSharedWithDropdown(values, index)}
                      </Grid.Column>

                      {sharedDepositLoan.sharedWithStaticId !== '' ? (
                        <React.Fragment>
                          <Grid.Column tablet={16} computer={11}>
                            <CheckboxGrid>
                              <CheckboxColumn>
                                <CheckboxWrapper>
                                  <Field
                                    name={`sharedWith[${index}].appetite.shared`}
                                    component={CheckboxController}
                                    fieldName="Appetite"
                                    style={{ ...CHECKBOX_FIELD_STYLE }}
                                    data-test-id={`apettite-check-${sharedDepositLoan.sharedWithStaticId}`}
                                  />
                                </CheckboxWrapper>
                              </CheckboxColumn>
                              <CheckboxColumn>{this.renderPricing(formik, index)}</CheckboxColumn>
                            </CheckboxGrid>
                          </Grid.Column>

                          <ColumnWithRemoveButton computer={2} textAlign="right" floated="right">
                            {!requested && (
                              <SimpleButton
                                onClick={() => this.handleRemoveSharedWithCounterparty(index, arrayHelpers)}
                                style={{ paddingRight: 0, paddingTop: '8px' }}
                                type="button"
                                data-test-id={`counterparty-remove-${sharedDepositLoan.sharedWithStaticId}`}
                              >
                                Remove
                              </SimpleButton>
                            )}
                          </ColumnWithRemoveButton>
                        </React.Fragment>
                      ) : null}
                    </Grid>
                  </SharedWithRow>
                ) : null
              })}
            </React.Fragment>
          )}
        />
        {removeSharedWithId !== undefined ? (
          <ConfirmWrapper
            isSubmitting={false}
            submittingErrors={[]}
            handleClose={this.handleCancelConfirmRemove}
            handleConfirm={this.handleConfirmRemove}
            header="Remove counterparty"
            action={ConfirmAction.Remove}
          >
            <RemoveCounterpartyConfirmContent
              counterparties={counterparties}
              sharedWithData={values.sharedWith[removeSharedWithId]}
            />
          </ConfirmWrapper>
        ) : null}
        {requestCommentOpen && (
          <Modal open={!!requestCommentOpen} onClose={this.handleCloseCommentModal}>
            <Modal.Header>
              Comment{' '}
              <p style={{ fontSize: '14px' }}>
                {requestCommentOpen.companyName}, {displayDate(requestCommentOpen.createdAt)}
              </p>
            </Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <p>{requestCommentOpen.comment}</p>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions key="done">
              <Button primary={true} onClick={this.handleCloseCommentModal}>
                Close
              </Button>
            </Modal.Actions>
          </Modal>
        )}
      </Wrapper>
    )
  }
}

const BoldText = styled.p`
  font-weight: bold;
`

const Wrapper = styled.div`
  margin-top: 40px;
`

const StyledHeaderWrapper = styled(LightHeaderWrapper)`
  margin-bottom: 1em;
`

export default connect<IOwnProps, IDepositLoanForm>(CreateOrEditSharedWithPart)
