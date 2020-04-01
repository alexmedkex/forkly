import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import ApplyForDiscountingContainer from '../../receivable-finance/pages/apply-for-discounting/ApplyForDiscountingContainer'
import PushToMarketContainer from '../../receivable-finance/pages/push-to-market/PushToMarketContainer'
import ReceivableFinanceDashboardContainer from '../../receivable-finance/pages/dashboard/ReceivableFinanceDashboardContainer'
import DiscountingRequestViewContainer from '../../receivable-finance/pages/view-request/DiscountingRequestViewContainer'
import ViewQuotesContainer from '../../receivable-finance/pages/view-quotes/ViewQuotesContainer'
import AcceptQuoteContainer from '../../receivable-finance/pages/accept-quote/AcceptQuoteContainer'
import SubmitQuoteContainer from '../../receivable-finance/pages/submit-quote/SubmitQuoteContainer'
import { withPadding } from '../../../routes'

export const ReceivableDiscountingRoutes = () => (
  <Switch>
    <Route
      exact={true}
      path="/receivable-discounting"
      render={() => withPadding(<ReceivableFinanceDashboardContainer />)}
    />
    <Route path="/receivable-discounting/:tradeId/apply" component={ApplyForDiscountingContainer} />
    <Route path="/receivable-discounting/:rdId/request-for-proposal" component={PushToMarketContainer} />
    <Route path="/receivable-discounting/:rdId/quotes" component={ViewQuotesContainer} />
    <Route exact={true} path="/receivable-discounting/:rdId" component={DiscountingRequestViewContainer} />
    <Route path="/receivable-discounting/:rdId/provide-quote" component={SubmitQuoteContainer} />
    <Route path="/receivable-discounting/:rdId/accept/:participantStaticId" component={AcceptQuoteContainer} />
  </Switch>
)

export default ReceivableDiscountingRoutes
