import { CreditLineType } from './store/types'

export const ROUTES = {
  [CreditLineType.RiskCover]: {
    financialInstitution: {
      new: '/risk-cover/new',
      requestInfo: '/risk-cover/request-information/:counterpartyId',
      edit: '/risk-cover/:id/edit',
      view: '/risk-cover/:id',
      dashboard: '/risk-cover'
    },
    corporate: {
      dashboard: '/risk-cover',
      requestInfoUpdate: '/risk-cover/buyers/:id/request-information/new',
      view: '/risk-cover/buyers/:id',
      requestInfoNew: '/risk-cover/request-information/new'
    }
  },
  [CreditLineType.BankLine]: {
    financialInstitution: {
      new: '/bank-lines/new',
      requestInfo: '/bank-lines/request-information/:counterpartyId',
      edit: '/bank-lines/:id/edit',
      view: '/bank-lines/:id',
      dashboard: '/bank-lines'
    },
    corporate: {
      dashboard: '/bank-lines',
      requestInfoUpdate: '/bank-lines/banks/:id/request-information/new',
      view: '/bank-lines/banks/:id',
      requestInfoNew: '/bank-lines/request-information/new'
    }
  }
}
