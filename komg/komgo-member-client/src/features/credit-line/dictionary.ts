import { CreditLineType } from './store/types'

const ISSUING_BANK = 'Issuing bank'

export const dictionary = {
  [CreditLineType.RiskCover]: {
    common: {
      title: 'Risk cover',
      loadingTitle: 'Loading Risk Cover',
      subTitleContent:
        'This screen shows you the information provided by your organization as well as the date of the last update regarding your risk cover appetite. In order to know the non-binding information that has been shared with counterparties on a bilateral basis, click on "View details" using the elipsis.'
    },
    financialInstitution: {
      dashboard: {
        htmlPageTitle: 'Risk Cover Dashboard',
        linkText: 'Add buyer',
        editText: 'Edit buyer',
        counterpartyName: 'Buyer',
        fee: 'Minimum Risk Fee',
        removeConfirmHeader: 'Remove buyer',
        removeConfirmSpecificText:
          'This will remove the buyer information from sellers who have access to this information.'
      },
      createOrEdit: {
        createTitle: 'Add buyer',
        counterpartyTitle: 'Buyer information',
        counterpartyText: `The information provided in this section about buyers will only be accessible by your organisation depending on their permissions. However, you may choose to disclose some of these data to your clients using "Visibility to sellers" section below.`,
        companyTitle: 'Visibility to sellers',
        companyCommonText:
          'Information shared with your counterparties on a bilateral basis. This information is displayed to counterparties as non-binding and does not represent or warrant any commitment on your part.',
        companyTitleRequest: 'Requests to disclose buyer information',
        companyRole: 'seller',
        companyRolePlural: 'sellers',
        counterpartyRole: 'buyer',
        counterpartyFieldLabel: 'Buyer',
        counterpartyFieldPlaceholder: 'Select buyer',
        feeFieldLabel: 'Minimum risk fee',
        companyFieldPlaceholder: 'Select seller',
        companyFeeFieldLabel: 'Risk fee',
        companyFeeWarning: 'Lower than min. risk fee for buyer',
        selectCounterpartyModalTitle: 'Select a buyer'
      },
      view: {
        htmlPageTitle: 'Risk Cover',
        counterpartyTitle: 'Buyer information',
        counterpartyText: 'Internal information relating to the buyer',
        companyTitle: 'Visibility to sellers',
        companyText:
          'Information shared with your counterparties on a bilateral basis. This information is displayed to counterparties as non-binding and does not represent or warrant any commitment on your part.'
      }
    },
    corporate: {
      dashboard: {
        htmlPageTitle: 'Risk Cover Dashboard',
        counterpartyName: 'Buyer',
        lowestFee: 'Lowest risk fee',
        linkText: 'Request information on a New Buyer'
      },
      createOrEdit: {
        createTitle: 'Request information for a New Buyer',
        createSubtitle:
          'Ask banks to disclose information relating to their risk cover appetite on a particiluar buyer.',
        editSubtitle: 'Ask banks to update information relating to their risk cover appetite',
        htmlPageTitle: 'Risk Cover - Request Information',
        counterpartyFieldPlaceholder: 'Select buyer',
        counterpartyFieldLabel: 'Select new buyer',
        mailToTitle: 'Appetite on $participantName in the context of Silent Cover'
      },
      details: {
        htmlPageTitle: 'Risk Cover Buyer Details',
        fee: 'Risk Fee',
        subTitle:
          'The information displayed below has been shared with you on a bilateral basis and does not represent any commitment of the financial institutions that have shared it.'
      }
    }
  },
  [CreditLineType.BankLine]: {
    common: {
      title: 'Bank lines',
      loadingTitle: 'Loading Bank Lines',
      subTitleContent:
        'This screen shows you the information provided by your organization as well as the date of the last update regarding your bank lines appetite. In order to know the non-binding information that has been shared with counterparties on a bilateral basis, click on "View details" using the elipsis.'
    },
    financialInstitution: {
      dashboard: {
        htmlPageTitle: 'Bank Lines Dashboard',
        linkText: 'Add issuing bank',
        editText: 'Edit issuing bank',
        counterpartyName: ISSUING_BANK,
        fee: 'Min Confirmation Fee',
        removeConfirmHeader: 'Remove issuing bank',
        removeConfirmSpecificText:
          'This will remove the issuing bank information from beneficiaries who have access to this information.'
      },
      createOrEdit: {
        createTitle: 'Add issuing bank',
        counterpartyTitle: 'Issuing bank information',
        counterpartyText: `The information provided in this section about issuing banks will only be accessible by your organisation depending on their permissions. However, you may choose to disclose some of these data to your clients using "Visibility to beneficiaries" section below.`,
        companyTitle: 'Visibility to beneficiaries',
        companyCommonText:
          'Information shared with your counterparties on a bilateral basis. This information is displayed to counterparties as non-binding and does not represent or warrant any commitment on your part.',
        companyTitleRequest: 'Requests to disclose issuing bank information',
        companyRole: 'beneficiary',
        companyRolePlural: 'beneficiaries',
        counterpartyRole: 'issuing bank',
        counterpartyFieldLabel: ISSUING_BANK,
        counterpartyFieldPlaceholder: 'Select issuing bank',
        feeFieldLabel: 'Minimum confirmation fee',
        companyFieldPlaceholder: 'Select beneficiaries',
        companyFeeFieldLabel: 'Confirmation fee',
        companyFeeWarning: 'Lower than min. confirmation fee for issuing bank',
        selectCounterpartyModalTitle: 'Select an issuing bank'
      },
      view: {
        htmlPageTitle: 'Bank Lines',
        counterpartyTitle: 'Issuing bank information',
        counterpartyText: 'Internal information relating to the issuing bank',
        companyTitle: 'Visibility to beneficiaries',
        companyText:
          'Information shared with your counterparties on a bilateral basis. This information is displayed to counterparties as non-binding and does not represent or warrant any commitment on your part.'
      }
    },
    corporate: {
      dashboard: {
        htmlPageTitle: 'Bank Lines Dashboard',
        counterpartyName: ISSUING_BANK,
        lowestFee: 'Lowest confirmation fee',
        linkText: 'Request information on a New Issuing Bank'
      },
      createOrEdit: {
        createTitle: 'Request information for a New Issuing Bank',
        createSubtitle:
          'Ask banks to disclose information relating to their bank lines appetite on a particular issuing bank.',
        editSubtitle: 'Ask banks to update information relating to their bank lines appetite',
        htmlPageTitle: 'Bank Lines - Request Information',
        counterpartyFieldPlaceholder: 'Select issuing bank',
        counterpartyFieldLabel: 'Select new issuing bank',
        mailToTitle: 'Appetite on $participantName in the context of LC confirmation'
      },
      details: {
        htmlPageTitle: 'Bank Lines Bank Details',
        fee: 'Confirmation Fee',
        subTitle:
          'The information displayed below has been shared with you on a bilateral basis and does not represent any commitment of the financial institutions that have shared it.'
      }
    }
  }
}
