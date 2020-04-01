import * as React from 'react'
import { compose } from 'redux'
import { withRouter, RouteComponentProps } from 'react-router'

import { connect } from 'react-redux'
import { ServerError } from '../../../store/common/types'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { WithPermissionsProps, withPermissions } from '../../../components/with-permissions'
import { Unauthorized, ErrorMessage, LoadingTransition } from '../../../components'
import { ApplicationState } from '../../../store/reducers'
import { loadingSelector } from '../../../store/common/selectors'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { clearError } from '../../../store/common/actions'
import { EditorTemplatesActionType } from '../../templates/store/templates/types'
import { EditorTemplateBindingsActionType } from '../../templates/store/template-bindings/types'
import { TradeActionType } from '../../trades/store/types'
import { MemberActionType, IMember } from '../../members/store/types'
import { CounterpartiesActionType, Counterparty } from '../../counterparties/store/types'
import { FindTradeBySourceAndSourceId, fetchTradesWithCargos } from '../../trades/store/actions'
import { fetchTemplatesWithTemplateBindings } from '../../templates/store/actions'
import { fetchConnectedCounterpartiesAsync } from '../../counterparties/store/actions'
import {
  ITrade,
  ICargo,
  ITemplate,
  Product,
  SubProduct,
  ITemplateBinding,
  ILetterOfCreditBase,
  IDataLetterOfCreditBase
} from '@komgo/types'
import { ImmutableObject, ImmutableList } from '../../../utils/types'
import { ITradeId } from '../../standby-letter-of-credit-legacy/store/types'
import { findFinancialInstitutions, findByStaticId } from '../../letter-of-credit-legacy/utils/selectors'
import { fromJS } from 'immutable'
import { parse } from 'qs'
import { selectTemplateByProductAndSubProduct } from '../../templates/store/selectors'
import { CreateLetterOfCredit } from '../components/CreateLetterOfCredit'
import { tradeFinanceManager } from '@komgo/permissions'
import { createLetterOfCredit } from '../store/actions'
import { LetterOfCreditActionType } from '../store/types'
import { Confirm } from '../../standby-letter-of-credit-legacy/components/confirm-modal'
import { ConfirmStandbyLetterOfCreditSubmission } from '../components/ConfirmStandbyLetterOfCreditSubmission'
import { withPadding } from '../../../routes'

interface CreateProps {
  isSubmitting: boolean
  submitErrors: ServerError[]
  trade: ImmutableObject<ITrade>
  cargo?: ICargo
  tradeId: ITradeId
  applicant: IMember
  beneficiary: IMember
  issuingBanks: Counterparty[]
  beneficiaryBanks: IMember[]
  template: ImmutableObject<ITemplate>
  templateBinding: ImmutableObject<ITemplateBinding>
}

export interface IProps
  extends WithLoaderProps,
    WithPermissionsProps,
    RouteComponentProps<any>,
    CreateProps,
    CreateActions {}

interface CreateActions {
  clearError: (action: string) => null
  fetchConnectedCounterpartiesAsync: (params?: {}) => void
  fetchTradesWithCargos: (params: FindTradeBySourceAndSourceId) => void
  fetchTemplatesWithTemplateBindings: () => void
  createLetterOfCredit: (templatedLetterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase>) => void
}

interface IState {
  confirmModalIsOpen: boolean
  letterOfCredit: ILetterOfCreditBase<IDataLetterOfCreditBase>
}

const submissionActions = [LetterOfCreditActionType.CREATE_STANDBY_LETTER_OF_CREDIT_REQUEST]

const loadingActions = [
  EditorTemplatesActionType.FETCH_TEMPLATES_REQUEST,
  EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_REQUEST,
  TradeActionType.TRADES_REQUEST,
  TradeActionType.TRADE_MOVEMENTS_REQUEST,
  CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
  MemberActionType.FetchMembersRequest
]

export class CreateLetterOfCreditContainer extends React.Component<IProps, IState> {
  constructor(props) {
    super(props)
    this.state = {
      confirmModalIsOpen: false,
      letterOfCredit: null
    }
  }

  componentDidMount() {
    const {
      tradeId: { source, sourceId }
    } = this.props
    this.props.fetchConnectedCounterpartiesAsync()
    this.props.fetchTradesWithCargos({
      source,
      filter: {
        projection: undefined,
        options: {},
        query: { source, sourceId }
      }
    })
    this.props.fetchTemplatesWithTemplateBindings()
  }

  componentDidUpdate(prevProps: IProps) {
    const {
      tradeId: { source, sourceId }
    } = this.props
    if (sourceId !== prevProps.tradeId.sourceId || source !== prevProps.tradeId.source) {
      this.props.fetchConnectedCounterpartiesAsync()
      this.props.fetchTradesWithCargos({
        source,
        filter: {
          projection: undefined,
          options: {},
          query: { source, sourceId }
        }
      })
      this.props.fetchTemplatesWithTemplateBindings()
    }
  }

  isAuthorized() {
    const { isAuthorized } = this.props
    return isAuthorized(tradeFinanceManager.canManageLCRequests)
  }

  componentWillUnmount() {
    submissionActions.forEach(action => this.props.clearError(action))
  }

  onSubmit = () => this.props.createLetterOfCredit(this.state.letterOfCredit)

  render() {
    const {
      isFetching,
      errors,
      isSubmitting,
      submitErrors,
      trade,
      cargo,
      template,
      templateBinding,
      applicant,
      beneficiary,
      beneficiaryBanks,
      issuingBanks
    } = this.props

    const { confirmModalIsOpen, letterOfCredit } = this.state

    if (!this.isAuthorized()) {
      return withPadding(<Unauthorized />)
    }

    const [error] = errors
    if (error) {
      return withPadding(<ErrorMessage title="Letter of Credit application error" error={error} />)
    }

    if (isFetching) {
      return <LoadingTransition title="Loading Letter of Credit data" />
    } else if (!trade.get('seller')) {
      return withPadding(<ErrorMessage title="Missing data" error="Trade data not found" />)
    } else if (!template.get('staticId')) {
      return withPadding(<ErrorMessage title="Missing data" error="Template data not found" />)
    } else if (!templateBinding || !templateBinding.get('staticId')) {
      return withPadding(<ErrorMessage title="Missing data" error="Variables definitions not found for template" />)
    } else if (!beneficiary) {
      return withPadding(<ErrorMessage title="Missing data" error="Beneficiary not found" />)
    }

    return (
      <>
        <CreateLetterOfCredit
          trade={trade}
          cargo={cargo}
          template={template}
          templateBinding={templateBinding}
          applicant={applicant}
          beneficiary={beneficiary}
          beneficiaryBanks={beneficiaryBanks}
          issuingBanks={issuingBanks}
          onSubmit={letterOfCredit => {
            this.setState({ letterOfCredit, confirmModalIsOpen: true })
          }}
        />
        <Confirm
          title="Submit SBLC application"
          errors={submitErrors}
          isSubmitting={isSubmitting}
          open={confirmModalIsOpen}
          onCancel={() => {
            submissionActions.forEach(action => this.props.clearError(action))
            this.setState({ confirmModalIsOpen: false })
          }}
          onSubmit={this.onSubmit}
        >
          <ConfirmStandbyLetterOfCreditSubmission
            buyerEtrmId={trade.get('buyerEtrmId')}
            letterOfCredit={letterOfCredit}
            issuingBanks={issuingBanks}
            beneficiary={beneficiary}
          />
        </Confirm>
      </>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): CreateProps => {
  const { source, sourceId, templateId }: { source: any; sourceId: string; templateId: string } = parse(
    ownProps.location.search.replace('?', '')
  )

  const isSubmitting = loadingSelector(state.get('loader').get('requests'), submissionActions, false)
  const submitErrors = findErrors(state.get('errors').get('byAction'), submissionActions)

  const applicantId = state.get('uiState').get('profile').company
  const counterparties = state.get('counterparties').get('counterparties')
  const members: IMember[] = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()

  const trades: ImmutableList<ITrade> =
    state
      .get('trades')
      .get('trades')
      .toList() || fromJS([])

  const trade: ImmutableObject<ITrade> =
    trades.find(t => t.get('source') === source && t.get('sourceId') === sourceId) || fromJS({})

  const cargos: ICargo[] =
    state
      .get('trades')
      .get('tradeMovements')
      .toList()
      .toJS() || []

  // Notice: source & sourceId are actual tradeSource and tradeSourceId
  const cargo: ICargo = cargos.find(t => t.source === source && t.sourceId === sourceId)

  const applicant = findByStaticId(members, applicantId)
  const beneficiary = findByStaticId(members, trade.get('seller'))

  const templates = selectTemplateByProductAndSubProduct(
    state.get('editorTemplates').get('byStaticId'),
    Product.TradeFinance,
    SubProduct.LetterOfCredit
  )

  const template = templates.find(t => t.get('staticId') === templateId) || fromJS({})

  const templateBinding = templates.size
    ? state
        .get('editorTemplateBindings')
        .get('byStaticId')
        .get(template.get('templateBindingStaticId'))
    : fromJS({})

  return {
    isSubmitting,
    submitErrors,
    issuingBanks: findFinancialInstitutions<Counterparty>(counterparties),
    beneficiaryBanks: findFinancialInstitutions<IMember>(members),
    trade,
    cargo,
    applicant,
    beneficiary,
    tradeId: { source, sourceId },
    template,
    templateBinding
  }
}

export default compose<any>(
  withRouter,
  withPermissions,
  connect<CreateProps, CreateActions>(mapStateToProps, {
    clearError,
    fetchConnectedCounterpartiesAsync,
    fetchTradesWithCargos,
    fetchTemplatesWithTemplateBindings,
    createLetterOfCredit
  }),
  withLoaders({
    actions: loadingActions
  })
)(CreateLetterOfCreditContainer)
