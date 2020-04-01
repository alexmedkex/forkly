import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import {
  CreditLineActionType,
  IDisclosedCreditLineEnriched,
  IDisclosedCreditLine,
  IProductProps,
  CreditLineType
} from '../../store/types'
import { withLoaders, WithLoaderProps } from '../../../../components/with-loaders'
import {
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  LoadingTransition,
  ErrorMessage
} from '../../../../components'
import { ApplicationState } from '../../../../store/reducers'
import { fetchDisclosedCreditLines } from '../../store/actions'
import Helmet from 'react-helmet'
import PageHeader from '../../components/credit-appetite-shared-components/PageHeader'
import { populateDisclosedCreditLineData } from '../../utils/selectors'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'
import DisclosedCreditLinesForCounterpartyTable from '../../components/corporate/details/DisclosedCreditLinesForCounterpartyTable'
import { findFeature } from '../../utils/creditAppetiteTypes'
import { getReadPermission, getCrudPermission } from '../../utils/permissions'
import { dictionary } from '../../dictionary'

interface DisclosedCreditLineDetailsProps {
  id: string
  disclosedCreditLines: IDisclosedCreditLineEnriched[]
  feature: CreditLineType
}

interface DisclosedCreditLineDetailsActions {
  fetchDisclosedCreditLines(productId: Products, subProductId: SubProducts, buyerId: string): void
}

interface IProps
  extends DisclosedCreditLineDetailsProps,
    RouteComponentProps<{ id }>,
    DisclosedCreditLineDetailsActions,
    WithPermissionsProps,
    WithLoaderProps,
    IProductProps {}

interface IState {
  highlightBank?: string
}

export class DisclosedCreditLineDetails extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      highlightBank: props.location.state ? props.location.state.highlightBank : undefined
    }
  }

  componentDidMount() {
    this.fetchDataAndReplaceHistory()
  }

  fetchDataAndReplaceHistory() {
    const { fetchDisclosedCreditLines, id, location, history, productId, subProductId } = this.props
    fetchDisclosedCreditLines(productId, subProductId, id)
    if (this.state.highlightBank) {
      history.replace({
        pathname: location.pathname,
        search: location.search,
        state: undefined
      })
    }
  }

  componentDidUpdate(prevProps: IProps) {
    const { feature, location, id } = this.props
    if (prevProps.feature !== feature || id !== prevProps.id) {
      this.fetchDataAndReplaceHistory()
    }
    if (location.state && location.state.highlightBank !== this.state.highlightBank) {
      this.refresStateData()
    }
  }

  refresStateData() {
    this.setState({
      highlightBank: this.props.location.state.highlightBank
    })
  }

  render() {
    const { isFetching, errors, isAuthorized, disclosedCreditLines, id, feature } = this.props
    const [error] = errors

    if (!isAuthorized(getReadPermission(feature))) {
      return <Unauthorized />
    }
    if (isFetching) {
      return <LoadingTransition title={dictionary[feature].common.loadingTitle} />
    }
    if (error) {
      return <ErrorMessage title={dictionary[feature].common.title} error={error} />
    }

    const canCrudRiskCover = isAuthorized(getCrudPermission(feature))
    const counterpartyName = disclosedCreditLines.length ? disclosedCreditLines[0].counterpartyName : ''
    return (
      <React.Fragment>
        <Helmet>
          <title>{dictionary[feature].corporate.details.htmlPageTitle}</title>
        </Helmet>
        <PageHeader
          buttonProps={{
            content: 'Request an update',
            redirectUrl: `${id}/request-information/new`,
            testId: 'rc-intro-request-information'
          }}
          canCrudCreditAppetite={canCrudRiskCover}
          headerContent={`${dictionary[feature].common.title} - ${counterpartyName}`}
          subTitleContent={dictionary[feature].corporate.details.subTitle}
        />
        {disclosedCreditLines.length ? (
          <DisclosedCreditLinesForCounterpartyTable
            items={disclosedCreditLines}
            highlightBank={this.state.highlightBank}
            feature={feature}
          />
        ) : null}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): DisclosedCreditLineDetailsProps => {
  const id = ownProps.match.params.id
  const feature = findFeature({ productId: ownProps.productId, subProductId: ownProps.subProductId })

  const membersByStaticId = state
    .get('members')
    .get('byStaticId')
    .toJS()
  const allDisclosedCreditLines: IDisclosedCreditLine[] = Object.values(
    state
      .get('creditLines')
      .get(feature)
      .get('disclosedCreditLinesById')
      .toJS()
  )
  const disclosedCreditLines = populateDisclosedCreditLineData(allDisclosedCreditLines, membersByStaticId, id)
  return {
    id,
    disclosedCreditLines,
    feature
  }
}

export default compose<any>(
  withLoaders({
    actions: [CreditLineActionType.FetchDisclosedCreditLinesForCounterpartyRequest]
  }),
  withPermissions,
  withRouter,
  connect<DisclosedCreditLineDetailsProps, DisclosedCreditLineDetailsActions>(mapStateToProps, {
    fetchDisclosedCreditLines
  })
)(DisclosedCreditLineDetails)
