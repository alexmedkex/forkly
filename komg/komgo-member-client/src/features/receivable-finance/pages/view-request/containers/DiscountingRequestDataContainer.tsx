import { tradeFinanceManager } from '@komgo/permissions'
import {
  IReceivablesDiscountingBase,
  IHistory,
  IReceivablesDiscountingInfo,
  RDStatus,
  IReceivablesDiscounting
} from '@komgo/types'
import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Button } from 'semantic-ui-react'
import { ModalPrompt } from '../../../../../components/modal-prompt/ModalPrompt'
import { withPermissions, WithPermissionsProps } from '../../../../../components/with-permissions'
import { clearError } from '../../../../../store/common/actions'
import { loadingSelector } from '../../../../../store/common/selectors'
import { findErrors } from '../../../../../store/common/selectors/errorSelector'
import { ApplicationState } from '../../../../../store/reducers'
import { stringOrNull } from '../../../../../utils/types'
import DiscountingRequestData from '../../../../receivable-discounting-legacy/components/DiscountingRequestData'
import {
  fetchHistoryForRDData,
  updateReceivablesDiscountingApplication
} from '../../../../receivable-discounting-legacy/store/application/actions'
import { ReceivableDiscountingApplicationActionType } from '../../../../receivable-discounting-legacy/store/application/types'
import {
  ReceivableDiscountingViewPanels,
  ReceivablesDiscountingRole
} from '../../../../receivable-discounting-legacy/utils/constants'
import { ICachedData, CachedDataProvider } from '../../../../../components/cached-data-provider'
import { isLaterThan } from '../../../../../utils/date'
import { sanitizeReceivableDiscontingForSubmit } from '../../../../receivable-discounting-legacy/utils/sanitize'

export interface IDiscountingRequestDataContainerOwnProps {
  discountingRequest: IReceivablesDiscountingInfo
  role: ReceivablesDiscountingRole
}

export interface IDiscountingRequestDataContainerProps
  extends IDiscountingRequestDataContainerOwnProps,
    WithPermissionsProps {
  submissionError: stringOrNull
  isSubmitting: boolean
  history: IHistory<IReceivablesDiscounting>
  isLoadingHistory: boolean

  clearError: (action: ReceivableDiscountingApplicationActionType) => void
  updateReceivablesDiscountingApplication: (values: IReceivablesDiscountingBase, rdId: string) => void
  fetchHistoryForRDData: (rdId: string) => void
}

interface IDiscountingRequestDataContainerState {
  isEditingRequest: boolean
  isConfirmingEdit: boolean
  active: boolean
  editedRd?: IReceivablesDiscountingBase
}

export class DiscountingRequestDataContainer extends React.Component<
  IDiscountingRequestDataContainerProps,
  IDiscountingRequestDataContainerState
> {
  state = {
    isEditingRequest: false,
    isConfirmingEdit: false,
    editedRd: undefined,
    active: this.shouldExpandAccordion()
  }

  componentDidMount() {
    const { discountingRequest } = this.props
    if (discountingRequest.status === RDStatus.QuoteAccepted) {
      this.props.fetchHistoryForRDData(discountingRequest.rd.staticId)
    }
  }

  componentDidUpdate(prevProps) {
    const { discountingRequest } = this.props
    if (prevProps.discountingRequest !== discountingRequest && discountingRequest.status === RDStatus.QuoteAccepted) {
      fetchHistoryForRDData(discountingRequest.rd.staticId)
    }
  }

  handleEditRequest() {
    this.setState({
      isEditingRequest: true,
      active: true
    })
  }

  handleCancelEditRequest() {
    this.setState({
      isEditingRequest: false
    })
  }

  handleSubmitRequest(editedRd: IReceivablesDiscountingBase) {
    this.setState({
      isConfirmingEdit: true,
      editedRd: sanitizeReceivableDiscontingForSubmit(editedRd)
    })
  }

  handleCancelConfirmEditRequest() {
    this.clearErrors()
    this.setState({
      isConfirmingEdit: false,
      editedRd: undefined
    })
  }

  handleConfirmSubmitRequest() {
    this.clearErrors()
    const { discountingRequest } = this.props
    const { editedRd } = this.state
    this.props.updateReceivablesDiscountingApplication(editedRd, discountingRequest.rd.staticId)
    this.setState({
      isEditingRequest: false,
      isConfirmingEdit: false
    })
  }

  clearErrors() {
    this.props.clearError(ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_REQUEST)
    this.props.clearError(ReceivableDiscountingApplicationActionType.SHARE_APPLICATION_REQUEST)
  }

  shouldExpandAccordion(): boolean {
    const { role, discountingRequest } = this.props

    const traderRule =
      role === ReceivablesDiscountingRole.Trader &&
      discountingRequest &&
      (discountingRequest.status === RDStatus.Requested || discountingRequest.status === RDStatus.QuoteSubmitted)

    const bankRule =
      role === ReceivablesDiscountingRole.Bank && discountingRequest && discountingRequest.status === RDStatus.Requested

    return traderRule || bankRule
  }

  handleAccordionClick(): void {
    this.setState(prevState => ({
      active: !prevState.active
    }))
  }

  render() {
    const {
      discountingRequest,
      isSubmitting,
      submissionError,
      isAuthorized,
      role,
      isLoadingHistory,
      history
    } = this.props
    const { isEditingRequest, active, isConfirmingEdit } = this.state
    const sectionId = id => `${id}-application`
    const canEditRequest =
      role === ReceivablesDiscountingRole.Trader &&
      isAuthorized(tradeFinanceManager.canCrudRD) &&
      discountingRequest.status === RDStatus.QuoteAccepted
    return (
      discountingRequest && (
        <>
          <CachedDataProvider
            id={sectionId(discountingRequest.rd.staticId)}
            data={active ? discountingRequest.rd.createdAt : null}
          >
            {({ cached: lastCreatedAt }: ICachedData<string>) => (
              <DiscountingRequestData
                discountingRequest={discountingRequest}
                index={ReceivableDiscountingViewPanels.ReceivableDiscountingData}
                open={active}
                isEditing={isEditingRequest}
                isSubmitting={isSubmitting}
                editable={canEditRequest}
                handleEditClicked={() => this.handleEditRequest()}
                handleCancelClicked={() => this.handleCancelEditRequest()}
                handleSubmit={rd => this.handleSubmitRequest(rd)}
                changed={lastCreatedAt ? isLaterThan(discountingRequest.rd.createdAt, lastCreatedAt) : false}
                handleToggleAccordion={() => this.handleAccordionClick()}
                isLoadingHistory={isLoadingHistory}
                history={history}
              />
            )}
          </CachedDataProvider>
          <ModalPrompt
            data-test-id="submit-edit-request-modal"
            header={'Update Discounting Request'}
            error={submissionError}
            errorTitle={'Failed to update request'}
            open={isSubmitting || isConfirmingEdit || Boolean(submissionError)}
            loading={isSubmitting}
            loadingTransitionTitle={'Saving changes'}
            actions={
              <>
                <Button
                  data-test-id="confirm-edit-request"
                  primary={true}
                  content={'Submit'}
                  disabled={!isConfirmingEdit}
                  onClick={() => this.handleConfirmSubmitRequest()}
                />
                <Button
                  data-test-id="cancel-edit-request"
                  content={'Cancel'}
                  disabled={!isConfirmingEdit}
                  onClick={() => this.handleCancelConfirmEditRequest()}
                />
              </>
            }
          >
            You are about to update this request
          </ModalPrompt>
        </>
      )
    )
  }
}

export const mapStateToProps = (state: ApplicationState, ownProps: IDiscountingRequestDataContainerOwnProps) => {
  const submitEditActions = [
    ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_REQUEST,
    ReceivableDiscountingApplicationActionType.SHARE_APPLICATION_REQUEST
  ]
  const isSubmitting = loadingSelector(state.get('loader').get('requests'), submitEditActions, false)
  const isLoadingHistory = loadingSelector(
    state.get('loader').get('requests'),
    [ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_REQUEST],
    false
  )

  const [submissionError] = findErrors(state.get('errors').get('byAction'), submitEditActions).map(
    ({ message }) => message
  )

  const history =
    state
      .get('receivableDiscountingApplication')
      .get('historyById')
      .toJS()[ownProps.discountingRequest.rd.staticId] || undefined

  return {
    submissionError,
    isSubmitting,
    isLoadingHistory,
    history
  }
}

export default compose<any>(
  withPermissions,
  connect<any, any, IDiscountingRequestDataContainerOwnProps>(mapStateToProps, {
    updateReceivablesDiscountingApplication,
    fetchHistoryForRDData,
    clearError
  })
)(DiscountingRequestDataContainer)
