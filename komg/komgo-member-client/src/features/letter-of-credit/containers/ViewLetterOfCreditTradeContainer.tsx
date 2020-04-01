import * as React from 'react'
import { compose } from 'redux'
import { withRouter, RouteComponentProps } from 'react-router'

import { connect } from 'react-redux'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { WithPermissionsProps, withPermissions } from '../../../components/with-permissions'
import { Unauthorized, ErrorMessage, LoadingTransition } from '../../../components'
import { ApplicationState } from '../../../store/reducers'
import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { ImmutableObject } from '../../../utils/types'
import { fromJS } from 'immutable'
import { tradeFinanceManager } from '@komgo/permissions'
import { LetterOfCreditActionType } from '../store/types'
import { getLetterOfCredit } from '../store/actions'
import { withPadding } from '../../../routes'
import { TradeView } from '../../trades/components/TradeView'
import { SPACES } from '@komgo/ui-components'
import { addBuyerSellerEnrichedData } from '../../trades/utils/displaySelectors'
import { sentenceCase } from '../../../utils/casings'
import { ContentBar } from '../../../components/content-bar/ContentBar'
import styled from 'styled-components'
import { hasSomeLetterOfCreditPermissions } from '../utils/permissions'

interface ViewLetterOfCreditTradeProps {
  letterOfCreditStaticId: string
  letterOfCredit: ImmutableObject<ILetterOfCredit<IDataLetterOfCredit>>
  companyStaticId: string
}

interface ViewLetterOfCreditTradeActions {
  getLetterOfCredit: (staticId: string) => void
}

const Italic = styled.p`
  font-style: italic;
`

const StyledHeader = styled.h1`
  display: inline-block;
`

export interface IProps
  extends WithLoaderProps,
    WithPermissionsProps,
    RouteComponentProps<any>,
    ViewLetterOfCreditTradeProps,
    ViewLetterOfCreditTradeActions {}

const loadingActions = [LetterOfCreditActionType.GET_LETTER_OF_CREDIT_REQUEST]

export class ViewLetterOfCreditTradeContainer extends React.Component<IProps> {
  componentDidMount() {
    const { letterOfCreditStaticId } = this.props
    this.props.getLetterOfCredit(letterOfCreditStaticId)
  }

  componentDidUpdate(prevProps: IProps) {
    const { letterOfCreditStaticId } = this.props
    if (letterOfCreditStaticId !== prevProps.letterOfCreditStaticId) {
      this.props.getLetterOfCredit(letterOfCreditStaticId)
    }
  }

  isAuthorized() {
    const { isAuthorized } = this.props

    return isAuthorized(tradeFinanceManager.canManageSBLCRequests)
  }

  render() {
    const { isFetching, errors, letterOfCredit, companyStaticId, isAuthorized } = this.props

    if (!hasSomeLetterOfCreditPermissions(isAuthorized)) {
      return <Unauthorized />
    }

    const [error] = errors
    if (error) {
      return withPadding(<ErrorMessage title="View Letter of Credit Trade error" error={error} />)
    }

    if (isFetching) {
      return <LoadingTransition title="Loading Letter of Credit Trade data" />
    }

    const members = [
      letterOfCredit
        .get('templateInstance')
        .get('data')
        .get('applicant')
        .toJS(),
      letterOfCredit
        .get('templateInstance')
        .get('data')
        .get('beneficiary')
        .toJS()
    ]

    return (
      <div style={{ padding: SPACES.DEFAULT }}>
        <ContentBar>
          <StyledHeader>{letterOfCredit.get('reference')} trade details</StyledHeader>
        </ContentBar>

        <Italic>{sentenceCase(letterOfCredit.get('status'))}</Italic>
        <TradeView
          trade={
            addBuyerSellerEnrichedData(
              companyStaticId,
              [
                {
                  ...letterOfCredit
                    .get('templateInstance')
                    .get('data')
                    .get('trade')
                    .toJS(),
                  status: letterOfCredit.get('status')
                }
              ],
              members as any
            )[0]
          }
          company={companyStaticId}
          tradeMovements={[
            letterOfCredit
              .get('templateInstance')
              .get('data')
              .has('cargo')
              ? letterOfCredit
                  .get('templateInstance')
                  .get('data')
                  .get('cargo')
                  .toJS()
              : undefined
          ]}
          uploadedDocuments={[]}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): ViewLetterOfCreditTradeProps => {
  const { staticId } = ownProps.match.params

  const letterOfCredit: ImmutableObject<ILetterOfCredit<IDataLetterOfCredit>> =
    state
      .get('templatedLettersOfCredit')
      .get('byStaticId')
      .get(staticId) || fromJS({})

  const companyStaticId = state.get('uiState').get('profile').company

  return {
    letterOfCreditStaticId: staticId,
    letterOfCredit,
    companyStaticId
  }
}

export default compose<any>(
  withRouter,
  withPermissions,
  connect<ViewLetterOfCreditTradeProps, ViewLetterOfCreditTradeActions>(mapStateToProps, {
    getLetterOfCredit
  }),
  withLoaders({
    actions: loadingActions
  })
)(ViewLetterOfCreditTradeContainer)
