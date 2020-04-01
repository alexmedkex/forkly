import { CreditAppetiteDepositLoanFeature } from './store/types'

export const ROUTES = {
  [CreditAppetiteDepositLoanFeature.Deposit]: {
    financialInstitution: {
      new: '/deposits/new',
      requestInfo: '/deposits/request-information/:currency/:period/:periodDuration?',
      edit: '/deposits/:id/edit',
      view: '/deposits/:id',
      dashboard: '/deposits'
    },
    corporate: {
      dashboard: '/deposits',
      requestInfoUpdate: '/deposits/currency-tenor/request-information/:currency/:period/:periodDuration?',
      view: '/deposits/currency-tenor/:currency/:period/:periodDuration?',
      requestInfoNew: '/deposits/request-information/new'
    }
  },
  [CreditAppetiteDepositLoanFeature.Loan]: {
    financialInstitution: {
      new: '/loans/new',
      requestInfo: '/loans/request-information/:currency/:period/:periodDuration?',
      edit: '/loans/:id/edit',
      view: '/loans/:id',
      dashboard: '/loans'
    },
    corporate: {
      dashboard: '/loans',
      requestInfoUpdate: '/loans/currency-tenor/request-information/:currency/:period/:periodDuration?',
      view: '/loans/currency-tenor/:currency/:period/:periodDuration?',
      requestInfoNew: '/loans/request-information/new'
    }
  }
}
