import { tradeFinanceManager } from '@komgo/permissions'
import { productRD } from '@komgo/products'
import {
  CreditRequirements,
  Currency,
  ICargo,
  IReceivablesDiscountingInfo,
  IReceivablesDiscountingBase,
  IReceivablesDiscounting
} from '@komgo/types'
import { Formik, FormikProps } from 'formik'
import React from 'react'
import { connect, Dispatch } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'
import { AccordionTitleProps, Button, Form } from 'semantic-ui-react'
import styled from 'styled-components'
import { ErrorMessage, LoadingTransition } from '../../../../components'
import Unauthorized from '../../../../components/unauthorized'
import { withLicenseCheck, WithLicenseCheckProps } from '../../../../components/with-license-check'
import { WithLoaderProps, withLoaders } from '../../../../components/with-loaders'
import { withPermissions, WithPermissionsProps } from '../../../../components/with-permissions'
import { loadingSelector } from '../../../../store/common/selectors'
import { ApplicationState } from '../../../../store/reducers'
import { stringOrNull } from '../../../../utils/types'
import { fetchMovements, getTrade } from '../../../trades/store/actions'
import { ITradeEnriched, TradeActionType } from '../../../trades/store/types'
import { addBuyerSellerEnrichedData } from '../../../trades/utils/displaySelectors'
import ApplyForDiscountingData from './components/ApplyForDiscountingData'
import ReceivableDiscountingFormErrors from '../../../receivable-discounting-legacy/components/receivable-discounting-application/ReceivableDiscountingFormErrors'
import ReceivableDiscountingTradeView from '../../../receivable-discounting-legacy/components/receivable-discounting-application/ReceivableDiscountingTradeView'
import SubmitStatus from '../../../receivable-discounting-legacy/components/receivable-discounting-application/SubmitStatus'
import {
  createReceivablesDiscountingApplication,
  updateReceivablesDiscountingApplication
} from '../../../receivable-discounting-legacy/store/application/actions'
import { ReceivableDiscountingApplicationActionType } from '../../../receivable-discounting-legacy/store/application/types'
import {
  ApplyForDiscountingPanels,
  initialApplyForDiscountingData,
  rdDiscountingSchema
} from '../../../receivable-discounting-legacy/utils/constants'
import { TOAST_TYPE } from '../../../toasts/utils'
import { createToast } from '../../../toasts/store/actions'
import { setItem, getItem } from '../../../../utils/user-storage'
import FormikEffect from '../../../standby-letter-of-credit-legacy/components/formik-effect'
import { merge, isEqual, cloneDeep } from 'lodash'
import { fetchRdsByStaticIds } from '../../../receivable-discounting-legacy/store/application/actions'
import {
  receivablesDiscountingBaseDiff,
  cleanReceivableDiscountingInfo,
  formatRdForInputs
} from '../../../receivable-discounting-legacy/utils/formatters'
import { getMembersList, getCurrentCompanyStaticId } from '../../../../store/common/selectors/state-selectors'
import { getTradeByTradeId } from '../../../trades/utils/state-selectors'
import { getReceivableDiscountingInfoByTradeId } from '../../../receivable-discounting-legacy/utils/state-selectors'
import { isLaterThan } from '../../../../utils/date'
import { SpacedFixedButtonBar } from '../../../receivable-discounting-legacy/components/generics'
import {
  sanitizeReceivableDiscontingForSubmit,
  sanitizeReceivableDiscontingForValidation,
  removeEmptyEntries,
  removeUndefinedOrNull
} from '../../../receivable-discounting-legacy/utils/sanitize'
import { rdValidator } from '../../../receivable-discounting-legacy/utils/RDValidator'
import {
  FieldDataProvider,
  FieldDataContext
} from '../../../receivable-discounting-legacy/presentation/FieldDataProvider'
import { TemplateLayout } from '../../../templates/components/TemplateLayout'
import { BasicTopbarInfoItem } from '../../../receivable-discounting-legacy/components/generics/BasicTopbarInfoItem'
import { RDTopbarFactory } from '../../../receivable-discounting-legacy/presentation/RDTopbarFactory'
import { TradingRole } from '../../../trades/constants'

export interface IApplyForDiscountingContainerProps
  extends WithPermissionsProps,
    WithLicenseCheckProps,
    WithLoaderProps,
    RouteComponentProps<any> {
  tradeId: string
  company: string
  dispatch: Dispatch<any>
  trade: ITradeEnriched
  tradeMovements: ICargo[]
  createLoader: boolean
  fetchMovements: (id: string) => any
  createToast: (msg: string, type?: TOAST_TYPE) => void
  submissionError: stringOrNull
  rdInfo: IReceivablesDiscountingInfo
  fetchRdsByStaticIds: (params?: {}) => any
  getTrade(id: string): void
  createReceivablesDiscountingApplication(values: IReceivablesDiscountingBase): void
  updateReceivablesDiscountingApplication(values: IReceivablesDiscountingBase, rdId: string, replace: boolean): void
}

interface IApplyForDiscountingContainerState {
  openConfirm?: boolean
  formValuesChanged: boolean
  values: Partial<IReceivablesDiscountingBase>
  draftValues?: Partial<IReceivablesDiscountingBase>
  formik?: FormikProps<IReceivablesDiscountingBase>
  actives: { [key in ApplyForDiscountingPanels]: boolean }
}

const draftRdKey = (id: string) => `${id}-draft-receivable-discounting-application`
const getDraft = (tradeId: string) => removeEmptyEntries((getItem(draftRdKey(tradeId)) || {}) as object)
const saveDraft = (tradeId: string, values: Partial<IReceivablesDiscountingBase>) =>
  setItem(draftRdKey(tradeId), timestamp(removeEmptyEntries(values)))

const timestamp = <T extends object>(obj: T): T & { createdAt: string } => ({
  ...obj,
  createdAt: new Date().toJSON(),
  updatedAt: new Date().toJSON()
})

export class ApplyForDiscountingContainer extends React.Component<
  IApplyForDiscountingContainerProps,
  IApplyForDiscountingContainerState
> {
  static getDerivedStateFromProps = (props: IApplyForDiscountingContainerProps) => {
    const draft = (getDraft(props.tradeId) || {}) as Partial<IReceivablesDiscountingBase>
    const draftValues = merge(cloneDeep(initialApplyForDiscountingData), draft)
    return {
      draftValues
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      openConfirm: false,
      formValuesChanged: false,
      values: { ...initialApplyForDiscountingData() },
      draftValues: undefined,
      actives: {
        [ApplyForDiscountingPanels.TradeSummary]: false,
        [ApplyForDiscountingPanels.ApplyForDiscountingData]: true
      }
    }
  }

  componentDidMount() {
    const { tradeId } = this.props
    this.props.getTrade(tradeId)
    this.props.fetchMovements(tradeId)
    this.props.fetchRdsByStaticIds()
  }

  validate = (values: IReceivablesDiscountingBase) => {
    return rdValidator.validateReceivableDiscounting(sanitizeReceivableDiscontingForValidation(values))
  }

  handleFormikValuesChanged = (values: IReceivablesDiscountingBase) => {
    this.setState({ values, formValuesChanged: true })
  }

  handleSaveAsDraft = () => {
    const { tradeId } = this.props
    saveDraft(tradeId, this.state.values)
    this.props.createToast('Saved a draft of this receivable discounting application')
    this.props.history.push(`/receivable-discounting`)
  }

  handleCancelSubmit = () => {
    this.setState({
      openConfirm: false
    })
  }

  handleSubmit = (values: IReceivablesDiscountingBase, formik: FormikProps<IReceivablesDiscountingBase>) => {
    formik.setSubmitting(false)
    this.setState(
      {
        values: sanitizeReceivableDiscontingForSubmit(values),
        formik,
        openConfirm: true
      },
      this.handleConfirmSubmit
    )
  }

  // Checks and decides whether to
  // 1. Create RD - if no RD exists
  // 2. Update RD - if changes made since RD created
  // 3. Do nothing - no changes made since RD created
  handleConfirmSubmit = () => {
    const values = this.state.values as IReceivablesDiscounting
    const {
      rdInfo,
      history,
      updateReceivablesDiscountingApplication,
      createReceivablesDiscountingApplication
    } = this.props

    if (rdInfo && rdInfo.rd) {
      const rdDiff = receivablesDiscountingBaseDiff(formatRdForInputs(rdInfo.rd), values)
      rdDiff.length > 0
        ? updateReceivablesDiscountingApplication(values, rdInfo.rd.staticId, true)
        : history.push(`/receivable-discounting/${rdInfo.rd.staticId}/request-for-proposal`)
    } else {
      // If no RD - CREATE
      const { createdAt, updatedAt, ...base } = values
      createReceivablesDiscountingApplication(base)
    }
  }

  cancelRDApplication = () => {
    this.props.history.push(`/receivable-discounting`)
  }

  handleAccordionClick = (e: React.SyntheticEvent, titleProps: AccordionTitleProps) => {
    const { index } = titleProps
    const { actives } = this.state

    this.setState({
      actives: {
        ...actives,
        [index as string]: !actives[index as ApplyForDiscountingPanels]
      }
    })
  }

  getInitialValues() {
    const { trade, rdInfo } = this.props
    const draftValues = this.state.draftValues as IReceivablesDiscounting

    if (!trade) {
      return draftValues
    }

    const useLocalDraft: boolean =
      !rdInfo ||
      (draftValues.updatedAt && rdInfo.rd.updatedAt && isLaterThan(draftValues.updatedAt, rdInfo.rd.updatedAt))

    const draftRequestType = !useLocalDraft ? rdInfo.rd.requestType : draftValues.requestType
    const draftDiscountingType = !useLocalDraft ? rdInfo.rd.discountingType : draftValues.discountingType

    const { sourceId, sellerEtrmId, source, currency } = trade
    const initialValues = {
      ...initialApplyForDiscountingData(
        draftRequestType ? draftRequestType : this.state.values.requestType,
        draftDiscountingType ? draftDiscountingType : this.state.values.discountingType
      ),
      currency: currency as Currency,
      tradeReference: {
        sourceId,
        sellerEtrmId,
        source
      }
    }

    return removeUndefinedOrNull(
      useLocalDraft
        ? merge(cloneDeep(initialValues), cleanReceivableDiscountingInfo(draftValues, initialValues.tradeReference))
        : merge(cloneDeep(initialValues), cleanReceivableDiscountingInfo(rdInfo.rd, initialValues.tradeReference))
    )
  }

  getFieldDataProvider(initialValues: IReceivablesDiscounting): FieldDataProvider {
    return new FieldDataProvider(
      rdDiscountingSchema,
      initialApplyForDiscountingData(
        this.state.values.requestType ? this.state.values.requestType : initialValues.requestType,
        this.state.values.discountingType ? this.state.values.discountingType : initialValues.discountingType
      )
    )
  }

  render() {
    const {
      isAuthorized,
      trade,
      tradeMovements,
      company,
      createLoader,
      isFetching,
      isLicenseEnabled,
      errors,
      submissionError
    } = this.props
    const { actives } = this.state

    if (!isAuthorized(tradeFinanceManager.canCrudRD) || !isLicenseEnabled(productRD)) {
      return <Unauthorized />
    }

    const [error] = errors
    if (error) {
      return <ErrorMessage title="Something went wrong" error={error} />
    }
    if (isFetching) {
      return <LoadingTransition title="Loading Trade" />
    }

    if (trade && (!trade.tradingRole || trade.tradingRole !== TradingRole.SELLER)) {
      return <ErrorMessage title="Invalid Trade" error="This trade is not applicable for Receivable Discounting" />
    }

    const initialValues = this.getInitialValues() as IReceivablesDiscounting
    const { tradeReference: _, ...initialValuesWithoutTradeReference } = initialValues
    const { tradeReference: _1, ...valuesWithoutTradeReference } = this.state.values
    const fieldDataProvider = this.getFieldDataProvider(initialValues)

    return (
      <TemplateLayout
        title={'Apply for Risk cover / Discounting'}
        infos={RDTopbarFactory.createApplyForDiscountingTopBarInfoItems(trade)}
        withPadding={true}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={this.handleSubmit}
          enableReinitialize={true}
          validate={this.validate}
          validateOnBlur={false}
          validateOnChange={true}
          render={(formik: FormikProps<IReceivablesDiscountingBase>) => (
            <React.Fragment>
              <ReceivableDiscountingFormErrors formik={formik} />
              <ReceivableDiscountingTradeView
                tradeMovements={tradeMovements}
                company={company}
                trade={trade}
                changed={false}
                index={ApplyForDiscountingPanels.TradeSummary}
                open={actives[ApplyForDiscountingPanels.TradeSummary]}
                handleClick={this.handleAccordionClick}
              />
              <Form
                onSubmit={formik.handleSubmit}
                data-test-id="apply-for-discounting-form"
                id="apply-for-discounting-form"
              >
                <FormikEffect onChange={this.handleFormikValuesChanged} />
                <FieldDataContext.Provider value={fieldDataProvider}>
                  <ApplyForDiscountingData
                    formik={formik}
                    index={ApplyForDiscountingPanels.ApplyForDiscountingData}
                    isApplyForDiscountingDataAccordionOpen={actives[ApplyForDiscountingPanels.ApplyForDiscountingData]}
                    handleClick={this.handleAccordionClick}
                  />
                </FieldDataContext.Provider>
              </Form>
            </React.Fragment>
          )}
        />
        <SubmitStatus
          title="Receivable discounting application"
          actionText="Generating discounting application"
          isSubmitting={createLoader}
          open={this.state.openConfirm}
          cancelSubmit={this.handleCancelSubmit}
          error={submissionError}
        />
        <SpacedFixedButtonBar>
          <Button
            type="button"
            data-test-id="button-save-as-draft"
            disabled={
              !this.state.formValuesChanged ||
              isEqual(
                removeEmptyEntries(valuesWithoutTradeReference),
                removeEmptyEntries(initialValuesWithoutTradeReference)
              )
            }
            onClick={this.handleSaveAsDraft}
          >
            Save as draft
          </Button>
          <Button type="button" data-test-id="button-cancel" onClick={this.cancelRDApplication}>
            Cancel
          </Button>
          <Button
            primary={true}
            type="submit"
            form="apply-for-discounting-form"
            data-test-id="button-next"
            onClick={() => {
              window.scrollTo(0, 0)
            }}
          >
            Next
          </Button>
        </SpacedFixedButtonBar>
      </TemplateLayout>
    )
  }
}

export const StyledPage = styled.section`
  padding-bottom: 30px;
`

export const mapStateToProps = (state: ApplicationState, ownProps: IApplyForDiscountingContainerProps) => {
  const tradeId = ownProps.match.params.tradeId

  const trade = getTradeByTradeId(state, tradeId)

  const [tradeEnriched] = addBuyerSellerEnrichedData(
    getCurrentCompanyStaticId(state),
    trade ? [trade] : [],
    getMembersList(state)
  )

  const rdInfo = trade ? getReceivableDiscountingInfoByTradeId(state, trade.sourceId) : undefined

  return {
    tradeId,
    rdInfo,
    trade: tradeEnriched,
    company: state.get('uiState').get('profile')!.company,
    error: state.get('trades').get('error'),
    submissionError: state.get('receivableDiscountingApplication').get('error'),
    tradeMovements: state
      .get('trades')
      .get('tradeMovements')
      .toJS(),
    createLoader: loadingSelector(
      state.get('loader').get('requests'),
      [ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_REQUEST],
      false
    )
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      TradeActionType.TRADE_REQUEST,
      TradeActionType.TRADE_MOVEMENTS_REQUEST,
      ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST
    ]
  }),
  withPermissions,
  withLicenseCheck,
  withRouter,
  connect(mapStateToProps, {
    getTrade,
    fetchMovements,
    createToast,
    createReceivablesDiscountingApplication,
    updateReceivablesDiscountingApplication,
    fetchRdsByStaticIds
  })
)(ApplyForDiscountingContainer)
