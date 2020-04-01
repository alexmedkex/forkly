import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'

import { ApplicationState } from '../../../../store/reducers'
import { withLoaders, WithLoaderProps } from '../../../../components/with-loaders'
import {
  CreditLineActionType,
  IExtendedCreditLine,
  IProductProps,
  CreditLineType,
  IMemberWithDisabledFlag
} from '../../store/types'
import PageHeader from '../../components/credit-appetite-shared-components/PageHeader'
import CreditLineStartMessage from '../../components/common/CreditLineStartMessage'
import { fetchCreditLines, removeCreditLine } from '../../store/actions'
import {
  LoadingTransition,
  ErrorMessage,
  withPermissions,
  WithPermissionsProps,
  Unauthorized
} from '../../../../components'
import CreditLinesTable from '../../components/financial-institution/dashboard/CreditLinesTable'
import Helmet from 'react-helmet'
import { populateCreditLinesData, getMembersWithDisabledFlag } from '../../utils/selectors'
import { IMember } from '../../../members/store/types'
import { loadingSelector } from '../../../../store/common/selectors'
import { findErrors } from '../../../../store/common/selectors/errorSelector'
import { ServerError } from '../../../../store/common/types'
import { clearError } from '../../../../store/common/actions'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'
import { findFeature } from '../../utils/creditAppetiteTypes'
import { dictionary } from '../../dictionary'
import { ROUTES } from '../../routes'
import { getReadPermission, getCrudPermission } from '../../utils/permissions'
import RemoveConfirmContent from '../../components/financial-institution/dashboard/RemoveConfirmContent'
import ConfirmWrapper, { ConfirmAction } from '../../components/credit-appetite-shared-components/ConfirmWrapper'
import { getExtendedCreditLineArray } from '../../utils/state-selectors'
import { withRouter, RouteComponentProps } from 'react-router'

interface IProps
  extends WithLoaderProps,
    IPropsActions,
    IStateProps,
    WithPermissionsProps,
    IProductProps,
    RouteComponentProps<any> {}

interface IPropsActions {
  fetchCreditLines(product: Products, subProduct: SubProducts): void
  removeCreditLine(creditLine: IExtendedCreditLine): void
  clearError(action: string): void
}

interface IStateProps {
  extendedCreditLines: IExtendedCreditLine[]
  isRemoving: boolean
  removingErrors: ServerError[]
  feature: CreditLineType
  membersFiltered: IMemberWithDisabledFlag[]
}

interface IState {
  removeCreditLine?: IExtendedCreditLine
}

export class CreditLinesDashboard extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.props.fetchCreditLines(this.props.productId, this.props.subProductId)
  }

  componentDidUpdate(prevProps: IProps) {
    const { isRemoving, removingErrors, feature, productId, subProductId } = this.props
    if (prevProps.isRemoving && !isRemoving && removingErrors.length === 0) {
      this.handleCloseRemove()
    }
    if (prevProps.feature !== feature) {
      this.props.fetchCreditLines(productId, subProductId)
    }
  }

  handleRemoveCreditLine = (removeCreditLine: IExtendedCreditLine) => {
    this.setState({
      removeCreditLine
    })
  }

  handleConfirmRemoveCreditLine = () => {
    const { removeCreditLine } = this.state
    this.props.removeCreditLine(removeCreditLine)
  }

  handleCloseRemove = () => {
    this.setState({
      removeCreditLine: undefined
    })
    if (this.props.removingErrors.length) {
      this.props.clearError(CreditLineActionType.RemoveCreditLineRequest)
    }
  }

  redirectToCreateNewCreditLine = (counterpartyId: string) => {
    this.props.history.push(`${ROUTES[this.props.feature].financialInstitution.new}?counterpartyId=${counterpartyId}`)
  }

  render() {
    const {
      extendedCreditLines,
      isFetching,
      errors,
      isAuthorized,
      isRemoving,
      removingErrors,
      feature,
      membersFiltered
    } = this.props
    const [error] = errors
    const { removeCreditLine } = this.state

    if (!isAuthorized(getReadPermission(feature))) {
      return <Unauthorized />
    }
    if (isFetching) {
      return <LoadingTransition title={dictionary[feature].common.loadingTitle} />
    }
    if (error) {
      return <ErrorMessage title={dictionary[feature].common.title} error={error} />
    }

    const canCrudCreditLine = isAuthorized(getCrudPermission(feature))

    const withModalProps = {
      members: membersFiltered,
      title: dictionary[feature].financialInstitution.createOrEdit.selectCounterpartyModalTitle,
      counterpartyTablePrint: dictionary[feature].financialInstitution.dashboard.counterpartyName,
      onNext: this.redirectToCreateNewCreditLine
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>{dictionary[feature].financialInstitution.dashboard.htmlPageTitle}</title>
        </Helmet>

        <PageHeader
          canCrudCreditAppetite={canCrudCreditLine}
          headerContent={dictionary[feature].common.title}
          subTitleContent={extendedCreditLines.length ? dictionary[feature].common.subTitleContent : ''}
          buttonProps={
            extendedCreditLines.length > 0
              ? {
                  content: dictionary[feature].financialInstitution.dashboard.linkText,
                  redirectUrl: ROUTES[feature].financialInstitution.new,
                  testId: 'rc-intro-add-buyer-btn'
                }
              : null
          }
          withModalProps={withModalProps}
        />

        {!extendedCreditLines.length && (
          <CreditLineStartMessage
            canCrudRiskCover={canCrudCreditLine}
            isFinancialInstitution={true}
            feature={feature}
            withModalProps={withModalProps}
          />
        )}

        {extendedCreditLines.length ? (
          <CreditLinesTable
            items={extendedCreditLines}
            canCrudRiskCover={canCrudCreditLine}
            handleRemoveCreditLine={this.handleRemoveCreditLine}
            feature={feature}
          />
        ) : null}

        {removeCreditLine && (
          <ConfirmWrapper
            handleClose={this.handleCloseRemove}
            isSubmitting={isRemoving}
            submittingErrors={removingErrors}
            handleConfirm={this.handleConfirmRemoveCreditLine}
            header={dictionary[feature].financialInstitution.dashboard.removeConfirmHeader}
            action={ConfirmAction.Remove}
          >
            <RemoveConfirmContent feature={feature} creditLine={removeCreditLine} />
          </ConfirmWrapper>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): IStateProps => {
  const feature = findFeature({ productId: ownProps.productId, subProductId: ownProps.subProductId })
  const members: IMember[] = Object.values(
    state
      .get('members')
      .get('byId')
      .toJS()
  )
  const company = state.get('uiState').get('profile').company

  const creditLines: IExtendedCreditLine[] = getExtendedCreditLineArray(state, feature)
  let extendedCreditLines: IExtendedCreditLine[] = []

  if (creditLines.length > 0) {
    extendedCreditLines = populateCreditLinesData(creditLines, members)
  }

  return {
    extendedCreditLines,
    isRemoving: loadingSelector(
      state.get('loader').get('requests'),
      [CreditLineActionType.RemoveCreditLineRequest],
      false
    ),
    removingErrors: findErrors(state.get('errors').get('byAction'), [CreditLineActionType.RemoveCreditLineRequest]),
    feature,
    membersFiltered: getMembersWithDisabledFlag(members, feature, creditLines, company)
  }
}

export default compose<any>(
  withLoaders({
    actions: [CreditLineActionType.FetchCreditLinesRequest]
  }),
  withPermissions,
  withRouter,
  connect(mapStateToProps, {
    fetchCreditLines,
    removeCreditLine,
    clearError
  })
)(CreditLinesDashboard)
