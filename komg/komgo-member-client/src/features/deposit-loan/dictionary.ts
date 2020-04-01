import { CreditAppetiteDepositLoanFeature } from './store/types'

export const dictionary = {
  [CreditAppetiteDepositLoanFeature.Deposit]: {
    common: {
      title: 'Deposits',
      loadingTitle: 'Loading Deposits',
      subTitleContent:
        'This information has been provided by your organization. Click on "View details" using the elipsis to see the non-binding information that has been shared with counterparties on a bilateral basis.'
    },
    financialInstitution: {
      dashboard: {
        htmlPageTitle: 'Deposits Dashboard',
        linkText: 'Add currency and tenor',
        linkTestId: 'add-currency-and-tenor-btn'
      },
      view: {
        htmlPageTitle: 'Deposits'
      }
    },
    corporate: {
      dashboard: {
        htmlPageTitle: 'Deposits Dashboard',
        linkText: 'Request deposit information',
        linkTestId: 'request-currency-and-tenor-btn'
      },
      createOrEdit: {
        createTitle: 'Request information for a new currency and tenor',
        createSubtitle: 'Ask banks to disclose information relating to their pricing on a specific currency and tenor.',
        editTitle: 'Request an update for',
        editSubtitle: 'Ask banks to disclose information relating to their pricing on',
        htmlPageTitle: 'Deposits - Request Information',
        mailToTitle: 'Appetite on $currencyAndTenor in the context of Deposit',
        counterpartyFieldPlaceholder: 'Currency and tenor',
        counterpartyFieldLabel: 'Select currency and tenor',
        commentPlaceholder: 'Please clarify your request by specifying the desired amount and the start date'
      },
      details: {
        linkText: 'Request an update',
        linkTestId: 'request-update-currency-and-tenor-btn',
        subTitle:
          'The information displayed below has been shared with you on a bilateral basis and does not represent any commitment of the financial institutions that have shared it.',
        emptyMessage: 'There are not any deposit with this parameters.'
      }
    }
  },
  [CreditAppetiteDepositLoanFeature.Loan]: {
    common: {
      title: 'Loans',
      loadingTitle: 'Loading Loans',
      subTitleContent:
        'This information has been provided by your organization. Click on "View details" using the elipsis to see the non-binding information that has been shared with counterparties on a bilateral basis.'
    },
    financialInstitution: {
      dashboard: {
        htmlPageTitle: 'Loans Dashboard',
        linkText: 'Add currency and tenor',
        linkTestId: 'add-currency-and-tenor-btn'
      },
      view: {
        htmlPageTitle: 'Deposits'
      }
    },
    corporate: {
      dashboard: {
        htmlPageTitle: 'Loans Dashboard',
        linkText: 'Request loan information',
        linkTestId: 'request-currency-and-tenor-btn'
      },
      createOrEdit: {
        createTitle: 'Request information for a new currency and tenor',
        createSubtitle: 'Ask banks to disclose information relating to their pricing on a specific currency and tenor.',
        editTitle: 'Request an update for',
        editSubtitle: 'Ask banks to disclose information relating to their pricing on',
        htmlPageTitle: 'Loans - Request Information',
        mailToTitle: 'Appetite on $currencyAndTenor in the context of Loan',
        counterpartyFieldPlaceholder: 'Currency and tenor',
        counterpartyFieldLabel: 'Select currency and tenor',
        commentPlaceholder: 'Please clarify your request by specifying the desired amount and the start date'
      },
      details: {
        linkText: 'Request an update',
        linkTestId: 'request-update-currency-and-tenor-btn',
        subTitle:
          'The information displayed below has been shared with you on a bilateral basis and does not represent any commitment of the financial institutions that have shared it.',
        emptyMessage: 'There are not any loan with this parameters.'
      }
    }
  }
}
