import * as React from 'react'
import { Grid, Popup, Confirm, Button, Modal } from 'semantic-ui-react'
import { connect, FormikProps, FieldArray, Field, ArrayHelpers } from 'formik'
import styled from 'styled-components'
import { ICreateOrEditCreditLineForm, IExtendedCreditLineRequest, CreditLineType } from '../../../store/types'
import {
  GridDropdownController,
  CheckboxController,
  FormattedInputController
} from '../../../../letter-of-credit-legacy/components'
import { Counterparty } from '../../../../counterparties/store/types'
import SimpleButton from '../../../../../components/buttons/SimpleButton'
import {
  defaultShared,
  SHARED_STATIC_ID_FIELD,
  SHARED_FEE_SHARED,
  SHARED_FEE_AMOUNT,
  SHARED_AVAILABILITY_SHARED_FIELD,
  SHARED_MARGIN_SHARED,
  SHARED_MARGIN_AMOUNT,
  SHARED_MAX_TENOR_SHARED,
  SHARED_MAX_TENOR_AMOUNT,
  SHARED_CREDIT_LIMIT_FIELD
} from '../../../constants'
import { isErrorActive } from '../../../../trades/utils/isErrorActive'
import FieldError from '../../../../../components/error-message/FieldError'
import {
  getErrorForSpecificField,
  isDisabledCounterpartyStaticId,
  isDisabledDefault,
  isDisabledMinRiskFeeAmount,
  isDisabledMarginAmount,
  isDisabledMaxTenorAmount
} from '../../../utils/validation'
import {
  numberToValueWithDefaultNull,
  formatToStringDayInputWithDefaultNull,
  formatToStringDecimalNumberWithDefaultNull
} from '../../../utils/formatters'
import { Action } from '../../../containers/financial-institution/CreateOrEditCreditLine'
import { getCompanyName } from '../../../../counterparties/utils/selectors'
import { IMember } from '../../../../members/store/types'
import { findMembersByStatic } from '../../../../letter-of-credit-legacy/utils/selectors'
import { displayDate } from '../../../../../utils/date'
import { dictionary } from '../../../dictionary'
import { capitalize } from '../../../../../utils/casings'
import SharedWithRow from '../../credit-appetite-shared-components/SharedWithRow'
import ColumnWithRemoveButton from '../../credit-appetite-shared-components/ColumnWithRemoveButton'
import {
  CheckboxGrid,
  CheckboxWrapper,
  CheckboxColumn
} from '../../credit-appetite-shared-components/CheckboxStyledComponents'
import SimpleIcon from '../../credit-appetite-shared-components/SimpleIcon'
import _ from 'lodash'

const CHECKBOX_FIELD_STYLE = { height: '32px', paddingTop: '9px' }
const INPUT_FIELD_STYLE = { width: '100px', marginLeft: '20px', marginTop: '-2px', marginBottom: 0 }

interface IOwnProps {
  counterparties: Counterparty[]
  currentAction: Action
  requested: boolean
  requests: IExtendedCreditLineRequest[]
  feature: CreditLineType
  members: IMember[]
}

interface WithFormik {
  formik: FormikProps<ICreateOrEditCreditLineForm>
}

interface IProps extends WithFormik, IOwnProps {}

interface IState {
  removeSellerIndex?: number
  arrayHelpers?: ArrayHelpers
  requestInCommentModal?: IExtendedCreditLineRequest
}

export class CreateOrEditCreditLineSharedWithCompany extends React.Component<IProps, IState> {
  private disabledInputRules: Map<string, (index: number, values: ICreateOrEditCreditLineForm) => boolean>

  constructor(props: IProps) {
    super(props)
    this.state = {}
    this.disabledInputRules = new Map([
      [SHARED_STATIC_ID_FIELD, isDisabledCounterpartyStaticId],
      [SHARED_FEE_SHARED, isDisabledDefault],
      [SHARED_FEE_AMOUNT, isDisabledMinRiskFeeAmount],
      [SHARED_AVAILABILITY_SHARED_FIELD, isDisabledDefault],
      [SHARED_MARGIN_SHARED, isDisabledDefault],
      [SHARED_MARGIN_AMOUNT, isDisabledMarginAmount],
      [SHARED_CREDIT_LIMIT_FIELD, isDisabledDefault],
      [SHARED_MAX_TENOR_SHARED, isDisabledDefault],
      [SHARED_MAX_TENOR_AMOUNT, isDisabledMaxTenorAmount]
    ])
  }

  componentDidUpdate() {
    const { formik } = this.props
    const { values } = formik
    if (!values.sharedCreditLines || !values.sharedCreditLines.find(item => !item.sharedWithStaticId)) {
      const creditLines = values.sharedCreditLines || []
      creditLines.push(defaultShared)

      formik.setFieldValue('sharedCreditLines', creditLines)
    }
  }

  handleRemoveSeller = (removeSellerIndex: number, arrayHelpers: ArrayHelpers) => {
    this.setState({
      removeSellerIndex,
      arrayHelpers
    })
  }

  handleConfirmRemoveSeller = () => {
    const { formik } = this.props
    const { removeSellerIndex, arrayHelpers } = this.state
    arrayHelpers.remove(removeSellerIndex)
    formik.setFieldError(`sharedCreditLines[${removeSellerIndex}]`, undefined)
    this.handleCancelConfirmRemoveSeller()
  }

  handleCancelConfirmRemoveSeller = () => {
    this.setState({
      removeSellerIndex: undefined,
      arrayHelpers: undefined
    })
  }

  getSellersDropodownValues = (values: ICreateOrEditCreditLineForm, index: number) =>
    this.props.counterparties
      .filter(c => {
        let share = true
        if (values.counterpartyStaticId === c.staticId) {
          return false
        }
        values.sharedCreditLines.forEach((sharedLine, i) => {
          if (sharedLine.sharedWithStaticId === c.staticId && i !== index) {
            share = false
          }
        })
        return share
      })
      .map(c => ({
        value: c.staticId,
        text: c.x500Name.CN,
        content: c.x500Name.CN
      }))

  printCheckboxOrPopup = (component: React.ReactNode, disabled: boolean, popupMessage: string): React.ReactNode => {
    if (disabled) {
      return <Popup content={popupMessage} trigger={component} on="hover" inverted={true} position="bottom left" />
    }
    return component
  }

  getTooltipContent = () => {
    const { formik, feature } = this.props
    const { createOrEdit } = dictionary[feature].financialInstitution
    return !formik.values.appetite
      ? `${capitalize(createOrEdit.counterpartyRole)} appetite must be set to "Yes" and disclosed to share information`
      : `Appetite must be disclosed to the ${createOrEdit.companyRole} before you can disclose other ${
          createOrEdit.counterpartyRole
        } information`
  }

  handleOpenCommentModal = (requestInCommentModal: IExtendedCreditLineRequest) => {
    this.setState({
      requestInCommentModal
    })
  }

  handleCloseCommentModal = () => {
    this.setState({
      requestInCommentModal: undefined
    })
  }

  renderSellerDropdown = (index: number, values: ICreateOrEditCreditLineForm) => {
    const disabled = this.disabledInputRules.get(SHARED_STATIC_ID_FIELD)(index, values)
    const sellers = this.getSellersDropodownValues(values, index)
    const { requests, requested, feature } = this.props

    if (requested && requests) {
      const request = requests.find(request => request.staticId === values.sharedCreditLines[index].requestStaticId)
      return (
        <Grid.Column computer={3} tablet={16}>
          <p>
            <SellerName>{request.companyName}</SellerName>
          </p>
          <p>
            <small className="grey">Sent on {displayDate(request.createdAt)}</small>
          </p>
          {request.comment ? (
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

    if (values.sharedCreditLines[index].sharedWithStaticId) {
      const seller = this.props.counterparties.find(
        counterparty => counterparty.staticId === values.sharedCreditLines[index].sharedWithStaticId
      )
      const sellerName = seller ? getCompanyName(seller) : '-'
      return (
        <Grid.Column computer={3} tablet={16}>
          <p>
            <SellerName>{sellerName}</SellerName>
          </p>
          {values.sharedCreditLines[index].updatedAt ? (
            <p>
              <small className="grey">Updated on {displayDate(values.sharedCreditLines[index].updatedAt)}</small>
            </p>
          ) : null}
        </Grid.Column>
      )
    }

    return (
      <Grid.Column computer={3} tablet={16}>
        <Field
          name={`sharedCreditLines[${index}].${SHARED_STATIC_ID_FIELD}`}
          search={disabled ? undefined : true}
          options={sellers}
          component={GridDropdownController}
          placeholder={dictionary[feature].financialInstitution.createOrEdit.companyFieldPlaceholder}
          disabled={disabled}
          customStyle={{ width: '80%' }}
        />
      </Grid.Column>
    )
  }

  renderAvailability = (index: number, values: ICreateOrEditCreditLineForm) => {
    const disabledCheckbox = this.disabledInputRules.get(SHARED_AVAILABILITY_SHARED_FIELD)(index, values)

    return this.printCheckboxOrPopup(
      <CheckboxWrapper>
        <Field
          name={`sharedCreditLines[${index}].${SHARED_AVAILABILITY_SHARED_FIELD}`}
          disabled={disabledCheckbox}
          component={CheckboxController}
          fieldName="Availability (Y/N)"
          style={CHECKBOX_FIELD_STYLE}
        />
      </CheckboxWrapper>,
      disabledCheckbox,
      this.getTooltipContent()
    )
  }

  renderMinRiskFee = (index: number, formik: FormikProps<ICreateOrEditCreditLineForm>) => {
    const sharedFieldName = `sharedCreditLines[${index}].${SHARED_FEE_SHARED}`
    const amountFieldName = `sharedCreditLines[${index}].${SHARED_FEE_AMOUNT}`
    const disabledCheckbox = this.disabledInputRules.get(SHARED_FEE_SHARED)(index, formik.values)
    const { feature } = this.props

    return this.printCheckboxOrPopup(
      <CheckboxWrapper>
        <Field
          name={sharedFieldName}
          disabled={disabledCheckbox}
          component={CheckboxController}
          fieldName={dictionary[feature].financialInstitution.createOrEdit.companyFeeFieldLabel}
          style={{ ...CHECKBOX_FIELD_STYLE }}
        />
        <Field
          type="text"
          name={amountFieldName}
          formatAsString={formatToStringDecimalNumberWithDefaultNull}
          toValue={numberToValueWithDefaultNull}
          component={FormattedInputController}
          disabled={this.disabledInputRules.get(SHARED_FEE_AMOUNT)(index, formik.values)}
          error={isErrorActive(amountFieldName, formik.errors, formik.touched)}
          icon={<SimpleIcon>%</SimpleIcon>}
          style={INPUT_FIELD_STYLE}
          defaultValue={null}
        />
        <FieldError show={isErrorActive(amountFieldName, formik.errors, formik.touched)} fieldName={amountFieldName}>
          {getErrorForSpecificField(amountFieldName, formik)}
        </FieldError>
        <FieldError
          show={
            formik.values.data.fee !== null &&
            !!_.get(formik.touched, amountFieldName) &&
            formik.values.sharedCreditLines[index].data.fee.fee !== null &&
            formik.values.sharedCreditLines[index].data.fee.fee < formik.values.data.fee
          }
          fieldName={amountFieldName}
        >
          {dictionary[feature].financialInstitution.createOrEdit.companyFeeWarning}
        </FieldError>
      </CheckboxWrapper>,
      disabledCheckbox,
      this.getTooltipContent()
    )
  }

  renderMaxTenor = (index: number, formik: FormikProps<ICreateOrEditCreditLineForm>) => {
    const sharedFieldName = `sharedCreditLines[${index}].${SHARED_MAX_TENOR_SHARED}`
    const amountFieldName = `sharedCreditLines[${index}].${SHARED_MAX_TENOR_AMOUNT}`
    const disabledCheckbox = this.disabledInputRules.get(SHARED_MAX_TENOR_SHARED)(index, formik.values)

    return this.printCheckboxOrPopup(
      <CheckboxWrapper>
        <Field
          name={sharedFieldName}
          disabled={disabledCheckbox}
          component={CheckboxController}
          fieldName="Max. tenor"
          style={{ ...CHECKBOX_FIELD_STYLE }}
        />
        <Field
          name={amountFieldName}
          type="text"
          icon={<SimpleIcon>days</SimpleIcon>}
          formatAsString={formatToStringDayInputWithDefaultNull}
          toValue={numberToValueWithDefaultNull}
          component={FormattedInputController}
          disabled={this.disabledInputRules.get(SHARED_MAX_TENOR_AMOUNT)(index, formik.values)}
          error={isErrorActive(amountFieldName, formik.errors, formik.touched)}
          style={INPUT_FIELD_STYLE}
          defaultValue={null}
        />
        <FieldError show={isErrorActive(amountFieldName, formik.errors, formik.touched)} fieldName={amountFieldName}>
          {getErrorForSpecificField(amountFieldName, formik)}
        </FieldError>
      </CheckboxWrapper>,
      disabledCheckbox,
      this.getTooltipContent()
    )
  }

  renderMargin = (index: number, formik: FormikProps<ICreateOrEditCreditLineForm>) => {
    const sharedFieldName = `sharedCreditLines[${index}].${SHARED_MARGIN_SHARED}`
    const marginAmountName = `sharedCreditLines[${index}].${SHARED_MARGIN_AMOUNT}`
    const disabledCheckbox = this.disabledInputRules.get(SHARED_MARGIN_SHARED)(index, formik.values)

    return this.printCheckboxOrPopup(
      <CheckboxWrapper>
        <Field
          name={sharedFieldName}
          disabled={disabledCheckbox}
          component={CheckboxController}
          fieldName="Margin"
          style={{ ...CHECKBOX_FIELD_STYLE }}
        />
        <Field
          type="text"
          name={marginAmountName}
          value={formik.values.sharedCreditLines[index].data.margin.margin}
          formatAsString={formatToStringDecimalNumberWithDefaultNull}
          toValue={numberToValueWithDefaultNull}
          component={FormattedInputController}
          disabled={this.disabledInputRules.get(SHARED_MARGIN_AMOUNT)(index, formik.values)}
          error={isErrorActive(marginAmountName, formik.errors, formik.touched)}
          icon={<SimpleIcon>%</SimpleIcon>}
          style={INPUT_FIELD_STYLE}
          defaultValue={null}
        />
        <FieldError show={isErrorActive(marginAmountName, formik.errors, formik.touched)} fieldName={marginAmountName}>
          {getErrorForSpecificField(marginAmountName, formik)}
        </FieldError>
      </CheckboxWrapper>,
      disabledCheckbox,
      this.getTooltipContent()
    )
  }

  renderSharedCreditLine = (index: number, values: ICreateOrEditCreditLineForm) => {
    const tooltipMessage = !values.appetite
      ? 'Buyer appetite must be set to "Yes" and disclosed to share information'
      : !values.sharedCreditLines[index].data.appetite.shared
        ? 'Appetite must be disclosed to the seller before you can disclose other buyer information'
        : 'Buyer availability must be set to "Yes" and disclosed to share information'
    const disabledCheckbox = this.disabledInputRules.get(SHARED_CREDIT_LIMIT_FIELD)(index, values)

    return this.printCheckboxOrPopup(
      <CheckboxWrapper>
        <Field
          name={`sharedCreditLines[${index}].${SHARED_CREDIT_LIMIT_FIELD}`}
          disabled={disabledCheckbox}
          component={CheckboxController}
          fieldName="Credit limit"
          style={{ ...CHECKBOX_FIELD_STYLE }}
        />
      </CheckboxWrapper>,
      disabledCheckbox,
      this.getTooltipContent()
    )
  }

  getRemoveSellerName = () => {
    const { values } = this.props.formik
    const { removeSellerIndex } = this.state
    if (removeSellerIndex !== undefined) {
      const sellerStaticId = values.sharedCreditLines[removeSellerIndex].sharedWithStaticId
      return this.props.counterparties.find(c => c.staticId === sellerStaticId).x500Name.CN
    }
    return ''
  }

  getTexts = () => {
    const { requested, formik, members, feature } = this.props
    const { createOrEdit } = dictionary[feature].financialInstitution
    const counterparty = findMembersByStatic(members, formik.values.counterpartyStaticId)
    return {
      header: requested ? createOrEdit.companyTitleRequest : createOrEdit.companyTitle,
      paragraph:
        requested && counterparty
          ? `The ${createOrEdit.companyRolePlural} below requested information on ${getCompanyName(
              counterparty
            )} to be shared with them. ${createOrEdit.companyCommonText}`
          : createOrEdit.companyCommonText
    }
  }

  render() {
    const { formik, requested, feature } = this.props
    const { removeSellerIndex, requestInCommentModal } = this.state
    const { values } = formik
    const text = this.getTexts()
    return (
      <SellerWrapper>
        <h4>{text.header}</h4>
        <ItalicText>{text.paragraph}</ItalicText>

        <FieldArray
          name="sharedCreditLines"
          render={arrayHelpers => (
            <React.Fragment>
              {values.sharedCreditLines.map((sharedLine, index) => {
                return (requested && sharedLine.requestStaticId) || (!requested && !sharedLine.requestStaticId) ? (
                  <SharedWithRow key={index} requested={requested} index={index}>
                    <Grid>
                      <Grid.Column computer={3} tablet={16}>
                        {this.renderSellerDropdown(index, values)}
                      </Grid.Column>

                      {sharedLine.sharedWithStaticId !== '' ? (
                        <React.Fragment>
                          <Grid.Column tablet={16} computer={11}>
                            <CheckboxGrid>
                              <CheckboxColumn>
                                <CheckboxWrapper>
                                  <Field
                                    name={`sharedCreditLines[${index}].data.appetite.shared`}
                                    component={CheckboxController}
                                    fieldName="Appetite"
                                    style={{ ...CHECKBOX_FIELD_STYLE }}
                                  />
                                </CheckboxWrapper>
                              </CheckboxColumn>

                              <CheckboxColumn>{this.renderAvailability(index, values)}</CheckboxColumn>

                              <CheckboxColumn>{this.renderSharedCreditLine(index, values)}</CheckboxColumn>

                              <CheckboxColumn>{this.renderMinRiskFee(index, formik)}</CheckboxColumn>

                              <CheckboxColumn>{this.renderMargin(index, formik)}</CheckboxColumn>

                              <CheckboxColumn>{this.renderMaxTenor(index, formik)}</CheckboxColumn>
                            </CheckboxGrid>
                          </Grid.Column>

                          {!requested && (
                            <ColumnWithRemoveButton computer={2} textAlign="right" floated="right">
                              <SimpleButton
                                onClick={() => this.handleRemoveSeller(index, arrayHelpers)}
                                style={{ paddingRight: 0, paddingTop: '8px' }}
                                type="button"
                                data-test-id="remove-seller"
                              >
                                Remove
                              </SimpleButton>
                            </ColumnWithRemoveButton>
                          )}
                        </React.Fragment>
                      ) : null}
                    </Grid>
                  </SharedWithRow>
                ) : null
              })}
            </React.Fragment>
          )}
        />
        <Confirm
          open={removeSellerIndex !== undefined}
          header={`Remove ${dictionary[feature].financialInstitution.createOrEdit.companyRole}`}
          content={
            <div className="content">
              Are you sure you want to remove {dictionary[feature].financialInstitution.createOrEdit.companyRole}{' '}
              <b>{this.getRemoveSellerName()}</b> from your list? This{' '}
              {dictionary[feature].financialInstitution.createOrEdit.companyRole} will no longer have access to this{' '}
              {dictionary[feature].financialInstitution.createOrEdit.counterpartyRole}
              information.
            </div>
          }
          onCancel={this.handleCancelConfirmRemoveSeller}
          onConfirm={this.handleConfirmRemoveSeller}
          cancelButton={<Button data-test-id="remove-seller-modal-cancel">Cancel</Button>}
          confirmButton={
            <Button data-test-id="remove-seller-modal-confirm" negative={true}>
              Remove
            </Button>
          }
        />
        {requestInCommentModal && (
          <Modal open={!!requestInCommentModal} onClose={this.handleCloseCommentModal}>
            <Modal.Header>
              Comment{' '}
              <p style={{ fontSize: '14px' }}>
                {requestInCommentModal.companyName}, {displayDate(requestInCommentModal.createdAt)}
              </p>
            </Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <p>{requestInCommentModal.comment}</p>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions key="done">
              <Button primary={true} onClick={this.handleCloseCommentModal}>
                Close
              </Button>
            </Modal.Actions>
          </Modal>
        )}
      </SellerWrapper>
    )
  }
}

const SellerWrapper = styled.div`
  margin-top: 40px;
  h4 {
    font-weight: 600;
    margin-bottom: 5px;
  }
`

const ItalicText = styled.p`
  font-style: italic;
  width: 80%;
`

const SellerName = styled.b`
  margin-top: 10px;
  display: inline-block;
`

export default connect<IOwnProps, ICreateOrEditCreditLineForm>(CreateOrEditCreditLineSharedWithCompany)
