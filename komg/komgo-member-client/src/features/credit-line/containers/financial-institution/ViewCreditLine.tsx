import React from 'react'
import CreditLineView from '../../components/financial-institution/credit-line-view/CreditLineView'
import { ApplicationState } from '../../../../store/reducers'
import { compose } from 'redux'
import { withLoaders, WithLoaderProps } from '../../../../components/with-loaders'
import { getCreditLine } from '../../store/actions'
import { connect } from 'react-redux'
import { CreditLineActionType, IExtendedCreditLine, IProductProps, CreditLineType } from '../../store/types'
import { populateCreditLineData } from '../../utils/selectors'
import { withRouter, RouteComponentProps } from 'react-router'
import {
  LoadingTransition,
  ErrorMessage,
  Unauthorized,
  withPermissions,
  WithPermissionsProps
} from '../../../../components'
import { IMember } from '../../../members/store/types'
import Helmet from 'react-helmet'
import { findFeature } from '../../utils/creditAppetiteTypes'
import { dictionary } from '../../dictionary'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'
import { getReadPermission } from '../../utils/permissions'

export interface IProps
  extends WithLoaderProps,
    RouteComponentProps<{ id: string }>,
    WithPermissionsProps,
    IProductProps {
  creditLine: IExtendedCreditLine
  feature: CreditLineType
  productId: Products
  subProductId: SubProducts
  getCreditLine(id: string, productId: string, subProductId: string): void
}

export class ViewCreditLine extends React.Component<IProps> {
  componentDidMount() {
    this.props.getCreditLine(this.props.match.params.id, this.props.productId, this.props.subProductId)
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.props.feature !== prevProps.feature) {
      this.props.getCreditLine(this.props.match.params.id, this.props.productId, this.props.subProductId)
    }
  }

  render() {
    const { creditLine, isFetching, errors, isAuthorized, feature } = this.props
    const [error] = errors

    if (!isAuthorized(getReadPermission(feature))) {
      return <Unauthorized />
    }
    if (error) {
      return <ErrorMessage title={dictionary[feature].common.title} error={error} />
    }
    if (isFetching || !creditLine) {
      return <LoadingTransition title={dictionary[feature].common.loadingTitle} />
    }

    const title = `${dictionary[feature].financialInstitution.view.htmlPageTitle} - ${creditLine.counterpartyName}`
    return (
      <React.Fragment>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <CreditLineView creditLine={creditLine} feature={feature} />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps?: IProps): Partial<IProps> => {
  const feature = findFeature({ productId: ownProps.productId, subProductId: ownProps.subProductId })
  const members: IMember[] = Object.values(
    state
      .get('members')
      .get('byId')
      .toJS()
  )

  const creditLineData: IExtendedCreditLine = state
    .get('creditLines')
    .get(feature)
    .get('creditLinesById')
    .toJS()[ownProps.match.params.id] as IExtendedCreditLine

  const creditLine: IExtendedCreditLine = creditLineData ? populateCreditLineData(creditLineData, members) : null

  return {
    creditLine,
    feature
  }
}

export default compose<any>(
  withLoaders({
    actions: [CreditLineActionType.GetCreditLineRequest]
  }),
  withRouter,
  withPermissions,
  connect(mapStateToProps, {
    getCreditLine
  })
)(ViewCreditLine)
