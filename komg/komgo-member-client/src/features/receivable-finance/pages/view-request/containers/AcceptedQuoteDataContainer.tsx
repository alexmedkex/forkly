import { tradeFinanceManager } from '@komgo/permissions'
import { IReceivablesDiscountingInfo, RDStatus, IQuote, IQuoteBase, IHistory } from '@komgo/types'
import { clearError } from '../../../../../store/common/actions'
import React from 'react'
import { Button } from 'semantic-ui-react'
import { ModalPrompt } from '../../../../../components/modal-prompt/ModalPrompt'
import { withPermissions, WithPermissionsProps } from '../../../../../components/with-permissions'
import { loadingSelector } from '../../../../../store/common/selectors'
import { findErrors } from '../../../../../store/common/selectors/errorSelector'
import { ApplicationState } from '../../../../../store/reducers'
import {
  ReceivableDiscountingViewPanels,
  ReceivablesDiscountingRole
} from '../../../../receivable-discounting-legacy/utils/constants'
import AcceptedQuoteData from '../../../../receivable-discounting-legacy/components/AcceptedQuoteData'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  updateAcceptedQuote,
  fetchSingleQuote,
  fetchHistoryForAgreedTerms
} from '../../../../receivable-discounting-legacy/store/quote/actions'
import { QuoteActionType } from '../../../../receivable-discounting-legacy/store/quote/types'
import { stringOrNull } from '../../../../../utils/types'
import { withLoaders, WithLoaderProps } from '../../../../../components/with-loaders'
import { MinimalAccordionWrapper } from '../../../../../components/accordion/MinimalAccordionWrapper'
import { LoadingTransition } from '../../../../../components'
import { ICachedData, CachedDataProvider } from '../../../../../components/cached-data-provider'
import { isLaterThan } from '../../../../../utils/date'

export interface IAcceptedQuoteDataContainerOwnProps extends WithLoaderProps {
  discountingRequest: IReceivablesDiscountingInfo
  role: ReceivablesDiscountingRole
  quoteId: string
}

export interface IAcceptedQuoteDateContainerProps extends IAcceptedQuoteDataContainerOwnProps, WithPermissionsProps {
  submissionError: stringOrNull
  isSubmitting: boolean
  comment: string
  replyDate: string
  clearError: (action: QuoteActionType) => void
  provider?: string
  quote: IQuote
  updateAcceptedQuote: (value: IQuoteBase, quoteId: string) => void
  fetchSingleQuote: (staticId: string) => void
  agreedTermsHistory: IHistory<IQuote>
  fetchHistoryForAgreedTerms: (quoteId: string) => void
}

interface IAcceptedQuoteDataContainerState {
  isEditingRequest: boolean
  isConfirmingEdit: boolean
  active: boolean
  editedQuote?: IQuoteBase
}

export class AcceptedQuoteDataContainer extends React.Component<
  IAcceptedQuoteDateContainerProps,
  IAcceptedQuoteDataContainerState
> {
  state = {
    isEditingRequest: false,
    isConfirmingEdit: false,
    editedQuote: undefined,
    active: this.shouldExpandAccordion()
  }

  componentDidMount() {
    const { discountingRequest, quoteId } = this.props

    this.props.fetchSingleQuote(quoteId)

    if (discountingRequest.status === RDStatus.QuoteAccepted) {
      this.props.fetchHistoryForAgreedTerms(quoteId)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.quoteId !== this.props.quoteId) {
      this.props.fetchSingleQuote(this.props.quoteId)
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

  handleSubmitRequest(editedQuote: IQuoteBase) {
    this.setState({
      isConfirmingEdit: true,
      editedQuote
    })
  }

  handleCancelConfirmEditRequest() {
    this.clearErrors()
    this.setState({
      isConfirmingEdit: false,
      editedQuote: undefined
    })
  }

  handleConfirmSubmitRequest() {
    this.clearErrors()
    const { editedQuote } = this.state
    this.props.updateAcceptedQuote(editedQuote, this.props.quoteId)
    this.setState({
      isEditingRequest: false,
      isConfirmingEdit: false
    })
  }

  clearErrors() {
    this.props.clearError(QuoteActionType.UPDATE_QUOTE_REQUEST)
    this.props.clearError(QuoteActionType.SHARE_QUOTE_REQUEST)
  }

  shouldExpandAccordion(): boolean {
    const { role, discountingRequest } = this.props

    const traderRule =
      role === ReceivablesDiscountingRole.Bank &&
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
      isAuthorized,
      role,
      quote,
      comment,
      replyDate,
      provider,
      isSubmitting,
      submissionError,
      agreedTermsHistory
    } = this.props
    const { isEditingRequest, active, isConfirmingEdit } = this.state
    const canEditRequest =
      role === ReceivablesDiscountingRole.Bank &&
      isAuthorized(tradeFinanceManager.canCrudRDRequests) &&
      discountingRequest.status === RDStatus.QuoteAccepted

    if (!quote) {
      return (
        <MinimalAccordionWrapper
          buttons={canEditRequest && <Button content={'Edit'} data-test-id="edit-accepted-quote" disabled={!!quote} />}
          active={active}
          handleClick={() => this.handleAccordionClick()}
          index={ReceivableDiscountingViewPanels.AcceptedQuote}
          title="Agreed terms"
        >
          <LoadingTransition title="Loading agreed terms" marginTop="10px" />
        </MinimalAccordionWrapper>
      )
    }

    return (
      discountingRequest && (
        <>
          <CachedDataProvider id={`accepted-quote-${quote.staticId}`} data={active ? quote.createdAt : null}>
            {({ cached: lastCreatedAt }: ICachedData<string>) => (
              <AcceptedQuoteData
                index={ReceivableDiscountingViewPanels.AcceptedQuote}
                open={active}
                isEditing={isEditingRequest}
                isSubmitting={isSubmitting}
                editable={canEditRequest}
                handleEditClicked={() => this.handleEditRequest()}
                handleCancelClicked={() => this.handleCancelEditRequest()}
                handleSubmit={quote => this.handleSubmitRequest(quote)}
                quote={quote}
                changed={lastCreatedAt ? isLaterThan(quote.createdAt, lastCreatedAt) : false}
                handleToggleAccordion={() => this.handleAccordionClick()}
                comment={comment}
                replyDate={replyDate}
                provider={provider}
                agreedTermsHistory={agreedTermsHistory}
                rd={discountingRequest.rd}
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
                  disabled={isSubmitting}
                  onClick={() => this.handleConfirmSubmitRequest()}
                />
                <Button
                  data-test-id="cancel-edit-request"
                  content={'Cancel'}
                  disabled={isSubmitting}
                  onClick={() => this.handleCancelConfirmEditRequest()}
                />
              </>
            }
          >
            You are about to update the final agreed terms
          </ModalPrompt>
        </>
      )
    )
  }
}

export const mapStateToProps = (state: ApplicationState, ownProps: IAcceptedQuoteDataContainerOwnProps) => {
  const submitEditActions = [QuoteActionType.UPDATE_QUOTE_REQUEST, QuoteActionType.SHARE_QUOTE_REQUEST]
  const isSubmitting = loadingSelector(state.get('loader').get('requests'), submitEditActions, false)

  const [submissionError] = findErrors(state.get('errors').get('byAction'), submitEditActions).map(
    ({ message }) => message
  )

  const isFetchingQuote = loadingSelector(state.get('loader').get('requests'), [QuoteActionType.FETCH_QUOTE_SUCCESS])

  const quote =
    state
      .get('receivableDiscountingQuote')
      .get('byId')
      .toJS()[ownProps.quoteId] || undefined

  const agreedTermsHistory =
    state
      .get('receivableDiscountingQuote')
      .get('historyById')
      .toJS()[ownProps.quoteId] || undefined

  return {
    submissionError,
    isSubmitting,
    quote,
    isFetching: isFetchingQuote,
    agreedTermsHistory
  }
}
export default compose<any>(
  withPermissions,
  withLoaders({
    actions: [QuoteActionType.FETCH_QUOTE_REQUEST]
  }),
  connect<any, any, IAcceptedQuoteDataContainerOwnProps>(mapStateToProps, {
    updateAcceptedQuote,
    fetchSingleQuote,
    fetchHistoryForAgreedTerms,
    clearError
  })
)(AcceptedQuoteDataContainer)
