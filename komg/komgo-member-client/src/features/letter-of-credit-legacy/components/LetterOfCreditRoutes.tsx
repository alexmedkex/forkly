import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import {
  LetterOfCreditApplication,
  LetterOfCreditPresentation,
  LetterOfCreditPresentationDetails,
  LetterOfCreditDashboard,
  LetterOfCreditPresentationHistory,
  LetterOfCreditPresentationFeedback,
  LetterOfCreditAuthorization
} from '../containers'
import DocumentViewContainer from '../../document-management/containers/DocumentViewContainer'
import LetterOfCreditViewRoutes from '../components/LetterOfCreditViewRoutes'

export const LetterOfCreditRoutes = () => (
  <LetterOfCreditAuthorization>
    <Switch>
      <Route path="/financial-instruments/letters-of-credit/new" component={LetterOfCreditApplication} />
      <Route
        path="/financial-instruments/letters-of-credit/:letterOfCreditId/documents/:id"
        component={DocumentViewContainer}
      />
      <Route
        path="/financial-instruments/letters-of-credit/:id/presentations/:presentationId/history"
        component={LetterOfCreditPresentationHistory}
      />
      <Route
        path="/financial-instruments/letters-of-credit/:lcId/presentations/:presentationId/review"
        component={LetterOfCreditPresentationFeedback}
      />
      <Route
        path="/financial-instruments/letters-of-credit/:lcId/presentations/:presentationId"
        component={LetterOfCreditPresentationDetails}
      />
      <Route path="/financial-instruments/letters-of-credit/:id/presentations" component={LetterOfCreditPresentation} />
      <Route path="/financial-instruments/letters-of-credit/:id" component={LetterOfCreditViewRoutes} />
    </Switch>
  </LetterOfCreditAuthorization>
)

export default LetterOfCreditRoutes
