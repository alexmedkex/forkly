import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import { FeatureProvider } from './components/feature-toggles'
import { CounterpartiesContainer } from './features/counterparties'
import RequestCounterpartyContainer from './features/counterparties/containers/RequestCounterpartyContainer'
import {
  CounterpartiesContainer as DocumentsCounterpartiesContainer,
  CounterpartyDocsContainer,
  DocumentManagementContainer,
  IncomingRequestContainer
} from './features/document-management'
import DocumentViewContainer from './features/document-management/containers/DocumentViewContainer'
import RequestDocumentsContainer from './features/document-management/containers/RequestDocumentsContainer'
import { Verification } from './features/doc-verification'
import { Verification as DocVerification, OutlookVerification } from './features/document-verification'
import { ErrorReportForm } from './features/error-report'
import FinancialInstrumentsRoutes from './features/financial-instruments/components/FinancialInstrumentsRoutes'
import AmendmentRoutes from './features/letter-of-credit-legacy/components/AmendmentRoutes'
import { Licenses } from './features/licenses'
import ProductsLicenses from './features/products-licenses'
import ReceivableDiscountingRoutes from './features/receivable-discounting-legacy/components/ReceivableDiscountingRoutes'
import { EvaluationContainer, ReviewContainer } from './features/review-documents'
import CreditLineRoutes from './features/credit-line/components/common/CreditLineRoutes'
import { Roles } from './features/role-management'
import { TaskRoutes } from './features/tasks'
import { TradeDashboard, TradeViewContainer } from './features/trades'
import CreateOrUpdateTrade from './features/trades/containers/CreateOrUpdateTrade'
import DefaultLayout from './layouts/Default'
import SemanticComponents from './styles/SemanticComponents'
import { getEnabledFeatureToggles } from './utils/featureToggles'
import { AddressBook } from './features/address-book'
import { EditCompany } from './features/address-book'
import { Profile } from './features/profile'
import { Products } from './features/document-management/constants/Products'
import { SubProducts } from './features/document-management/constants/SubProducts'
import DepositLoanRoutes from './features/deposit-loan/components/common/DepositLoanRoutes'
import { CreditAppetiteDepositLoanFeature } from './features/deposit-loan/store/types'
import { NotificationRoutes } from './features/notifications/components'
import TradeDocuments from './features/trade-documents/containers/TradeDocuments'
import LettersOfCreditRoutes from './features/letter-of-credit/components/LettersOfCreditRoutes'
import { TemplateRoutes } from './features/templates/components/TemplatesRoutes'
import DocumentRequestContainer from './features/document-management/containers/DocumentRequestContainer'
import { SPACES } from '@komgo/ui-components'
import RequestDocumentReviewContainer from './features/document-management/containers/RequestDocumentReviewContainer'

export const withPadding = (element): any => {
  // TODO LS this could be the actual defaultLayout rather than withPadding
  return <div style={{ padding: SPACES.DEFAULT }}>{element}</div>
}

export const MainRoutes = props => (
  <FeatureProvider features={getEnabledFeatureToggles(props.location.search)}>
    <DefaultLayout>
      <Switch>
        <Route path="/" exact={true} render={() => withPadding(<TaskRoutes />)} />
        <Route path="/tasks" render={() => withPadding(<TaskRoutes />)} />
        <Route path="/notifications" render={() => withPadding(<NotificationRoutes />)} />
        <Route path="/roles" render={props => withPadding(<Roles {...props} />)} />
        <Route path="/manage-licenses" render={props => withPadding(<Licenses {...props} />)} />
        <Route path="/documents/:id" render={props => withPadding(<DocumentViewContainer {...props} />)} />
        <Route path="/documents" render={props => withPadding(<DocumentManagementContainer {...props} />)} />
        <Route
          path="/counterparty-docs"
          render={props => withPadding(<DocumentsCounterpartiesContainer {...props} />)}
          exact={true}
        />
        <Route
          path="/counterparty-docs/:id"
          render={props => withPadding(<CounterpartyDocsContainer {...props} />)}
          exact={true}
        />
        <Route
          path="/counterparties"
          render={props => withPadding(<CounterpartiesContainer {...props} />)}
          exact={true}
        />
        <Route
          path="/counterparties/request"
          render={props => withPadding(<RequestCounterpartyContainer {...props} />)}
        />
        <Route path="/trades" render={props => withPadding(<TradeDashboard {...props} />)} exact={true} />
        <Route path="/trades/new" render={props => withPadding(<CreateOrUpdateTrade {...props} />)} exact={true} />
        <Route path="/trades/:id/edit" render={props => withPadding(<CreateOrUpdateTrade {...props} />)} />
        <Route path="/trades/:id" render={props => withPadding(<TradeViewContainer {...props} />)} />
        <Route path="/review" render={props => withPadding(<ReviewContainer {...props} />)} />
        <Route
          path="/incoming-request"
          render={props => withPadding(<IncomingRequestContainer {...props} />)}
          exact={true}
        />
        <Route path="/evaluation" render={props => withPadding(<EvaluationContainer {...props} />)} />
        <Route path="/amendments" render={() => withPadding(<AmendmentRoutes />)} />
        <Route path="/receivable-discounting" component={ReceivableDiscountingRoutes} />
        <Route path="/letters-of-credit" component={LettersOfCreditRoutes} />
        <Route path="/templates" component={TemplateRoutes} />
        <Route path="/trade-documents" component={TradeDocuments} exact={true} />
        <Route path="/financial-instruments" render={() => withPadding(<FinancialInstrumentsRoutes />)} />
        <Route path="/product-licenses" render={props => withPadding(<ProductsLicenses {...props} />)} />
        <Route path="/request-documents/review/:id" component={RequestDocumentReviewContainer} />
        <Route path="/request-documents/:id" render={props => withPadding(<RequestDocumentsContainer {...props} />)} />
        <Route path="/document-request/:id" component={DocumentRequestContainer} exact={true} />
        <Route
          path="/risk-cover"
          render={props =>
            withPadding(
              <CreditLineRoutes
                {...props}
                productId={Products.TradeFinance}
                subProductId={SubProducts.ReceivableDiscounting}
              />
            )
          }
        />
        <Route
          path="/bank-lines"
          render={props =>
            withPadding(
              <CreditLineRoutes
                {...props}
                productId={Products.TradeFinance}
                subProductId={SubProducts.LetterOfCredit}
              />
            )
          }
        />
        <Route
          path="/deposits"
          render={props =>
            withPadding(<DepositLoanRoutes {...props} feature={CreditAppetiteDepositLoanFeature.Deposit} />)
          }
        />
        <Route
          path="/loans"
          render={props =>
            withPadding(<DepositLoanRoutes {...props} feature={CreditAppetiteDepositLoanFeature.Loan} />)
          }
        />
        <Route path="/address-book" render={props => withPadding(<AddressBook {...props} />)} exact={true} />
        <Route path="/address-book/new" render={props => withPadding(<EditCompany {...props} />)} exact={true} />
        <Route path="/address-book/:id/edit" render={props => withPadding(<EditCompany {...props} />)} />
        <Route path="/address-book/:id" render={props => withPadding(<EditCompany {...props} />)} />
        <Route path="/profile" render={props => withPadding(<Profile {...props} />)} />
        {process.env.NODE_ENV === 'development' && (
          <Route path="/semantic" render={props => withPadding(<SemanticComponents {...props} />)} />
        )}
      </Switch>
    </DefaultLayout>
  </FeatureProvider>
)

// We must use string interpolation, otherwise webpack will put a result of the
// expression, i.e. false That's because '%REACT_APP_IS_KOMGO_NODE%' !== 'true'
// (see Dockerfile)
const isKomgoNode = `${process.env.REACT_APP_IS_KOMGO_NODE}` === 'true'
const AppRoutes = () => (
  <Switch>
    <Route exact={true} path="/error-report/new" render={() => withPadding(<ErrorReportForm />)} />
    {isKomgoNode && <Route path="/doc-verification" render={() => withPadding(<Verification />)} />}
    {isKomgoNode && <Route path="/document-verification" render={() => withPadding(<DocVerification />)} />}
    {isKomgoNode && <Route path="/outlook-document-verification" component={OutlookVerification} />}
    <Route path="/" component={MainRoutes} />
  </Switch>
)

export default AppRoutes
