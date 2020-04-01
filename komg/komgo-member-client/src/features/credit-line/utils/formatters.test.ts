import {
  amountWithCurrencyDisplay,
  formatAmountWithCurrency,
  formatAmountValue,
  percentFormat,
  daysFormat,
  formatCreditLineFormValues,
  numberToValueWithDefaultNull,
  formatToStringDayInputWithDefaultNull,
  formatToStringDecimalNumberWithDefaultNull,
  cutOutRequestCompaniesThatAreNotDisclosedAnyInfo,
  generateSharedDataFromRequests,
  prepareRequestInfoData,
  buildCounterpartyPickerItems,
  buildCounterpartyRowConfig
} from './formatters'
import { Currency, CreditLineRequestType, CreditLineRequestStatus } from '@komgo/types'
import {
  ICreateOrEditCreditLineForm,
  IExtendedCreditLineRequest,
  CreditLineType,
  IRequestCreditLineForm
} from '../store/types'
import { defaultShared } from '../constants'
import { createInitialCreditLine } from './factories'
import { Products } from '../../document-management/constants/Products'
import { SubProducts } from '../../document-management/constants/SubProducts'
import { fakeMember } from '../../letter-of-credit-legacy/utils/faker'

const receivedRequest: IExtendedCreditLineRequest = {
  staticId: '123',
  requestType: CreditLineRequestType.Received,
  context: { productId: 'tradeFinance', subProductId: 'rd' },
  counterpartyStaticId: '0b5ad248-6159-47ca-9ac7-610c22877186',
  companyStaticId: 'a3d82ae6-908c-49da-95b3-ba1ebe7e5f85',
  comment: 'This is a custom comment 1',
  status: CreditLineRequestStatus.Pending,
  createdAt: '2019-06-10T15:22:29.738Z',
  updatedAt: '2019-06-10T15:22:29.738Z',
  companyName: 'Company name',
  counterpartyName: 'Counterparty name'
}

const fakeFormData: IRequestCreditLineForm = {
  context: {
    productId: Products.TradeFinance,
    subProductId: SubProducts.LetterOfCredit
  },
  mailTo: false,
  comment: 'This a comment',
  requestForId: 'counteprarty123',
  companyIds: ['company123']
}

const initialRiskCoverValues = createInitialCreditLine(Products.TradeFinance, SubProducts.ReceivableDiscounting)

const fakeMember1 = { ...fakeMember({ country: 'RS' }), disabled: false }
const fakeMember2 = { ...fakeMember({ country: 'RS', staticId: '123' }), disabled: true }

describe('formatAmountWithCurrency', () => {
  it('should return price with symbol', () => {
    expect(formatAmountWithCurrency(1000, Currency.USD)).toBe('$ 1,000')
  })

  it('should return price with symbol', () => {
    expect(formatAmountWithCurrency(1000, Currency.AED)).toBe('1,000 AED')
  })
})

describe('amountWithCurrencyDisplay', () => {
  it('should return formatted price', () => {
    expect(amountWithCurrencyDisplay(1000, Currency.USD)).toBe('$ 1,000')
  })
  it('should return dash when price is null', () => {
    expect(amountWithCurrencyDisplay(null, Currency.USD)).toBe('-')
  })
  it('should return plus when price is null and we send default printing', () => {
    expect(amountWithCurrencyDisplay(null, Currency.USD, '+')).toBe('+')
  })
})

describe('formatAmountValue', () => {
  it('should return formatted price', () => {
    expect(formatAmountValue(1000)).toBe('1,000')
  })
  it('should return formatted price which is less than 1000', () => {
    expect(formatAmountValue(91)).toBe('91')
  })
})

describe('percentFormat', () => {
  it('should return formatted percent', () => {
    expect(percentFormat(4)).toBe('4.00 %')
  })
  it('should return formatted percent when 0 is given', () => {
    expect(percentFormat(0)).toBe('0.00 %')
  })
})

describe('daysFormat', () => {
  it('should return formatted days', () => {
    expect(daysFormat(4, '')).toBe('4 days')
  })
  it('should return formatted percent when 0 is given', () => {
    expect(daysFormat(0, '-')).toBe('0 days')
  })
  it('should return default value if null is given', () => {
    expect(daysFormat(null, '-')).toBe('-')
  })
})

describe('formatCreditLine', () => {
  const values: ICreateOrEditCreditLineForm = {
    ...initialRiskCoverValues,
    counterpartyStaticId: '1234',
    sharedCreditLines: [{ ...defaultShared, sharedWithStaticId: '123' }]
  }

  it('should attach counterpartyStaticId to shared credit line', () => {
    const receivedValue = formatCreditLineFormValues(values)
    const expectedValue = {
      ...values,
      creditExpiryDate: null,
      sharedCreditLines: [{ ...defaultShared, sharedWithStaticId: '123', counterpartyStaticId: '1234' }]
    }
    expect(receivedValue).toEqual(expectedValue)
  })
})

describe('numberToValueWithDefaultNull', () => {
  it('should return number', () => {
    expect(numberToValueWithDefaultNull('2')).toBe(2)
  })
  it('should return empty string', () => {
    expect(numberToValueWithDefaultNull(null)).toBe('')
  })
})

describe('formatToStringDayInputWithDefaultNull', () => {
  it('should return string', () => {
    expect(formatToStringDayInputWithDefaultNull(1)).toBe('1')
  })
  it('should return empty string', () => {
    expect(formatToStringDayInputWithDefaultNull(null)).toBe('')
  })
})

describe('formatToStringDecimalNumberWithDefaultNull', () => {
  it('should return', () => {
    expect(formatToStringDecimalNumberWithDefaultNull(10)).toEqual('10.00')
  })
  it('should return', () => {
    expect(formatToStringDecimalNumberWithDefaultNull(null)).toEqual('')
  })
})

describe('cutOutRequestSellersThatAreNotDisclosedAnyInfo', () => {
  const values = {
    ...initialRiskCoverValues,
    sharedCreditLines: [
      {
        ...defaultShared,
        data: { ...defaultShared.data, appetite: { shared: false } },
        sharedWithStaticId: '123',
        requestStaticId: '12345'
      }
    ]
  }
  it('should return empty array when seller do not have appetite true and have request id', () => {
    expect(cutOutRequestCompaniesThatAreNotDisclosedAnyInfo(values).sharedCreditLines).toEqual([])
  })
  it('should return one item in array for shared data', () => {
    expect(cutOutRequestCompaniesThatAreNotDisclosedAnyInfo(initialRiskCoverValues).sharedCreditLines.length).toEqual(1)
  })
})

describe('generateSharedDataFromRequests', () => {
  it('should return default data when there are not any requests', () => {
    expect(generateSharedDataFromRequests([])).toEqual([defaultShared])
  })
  it('should return default data and one item from request when there is one item in requests', () => {
    const sellerFromRequests = {
      ...defaultShared,
      sharedWithStaticId: receivedRequest.companyStaticId,
      counterpartyStaticId: receivedRequest.counterpartyStaticId,
      requestStaticId: receivedRequest.staticId
    }
    expect(generateSharedDataFromRequests([receivedRequest])).toEqual([sellerFromRequests, defaultShared])
  })
})

describe('prepareRequestInfoData', () => {
  const expectedData = {
    context: {
      productId: Products.TradeFinance,
      subProductId: SubProducts.LetterOfCredit
    },
    comment: 'This a comment',
    counterpartyStaticId: 'counteprarty123',
    companyIds: ['company123']
  }

  it('should return object with mailTo set to undefined', () => {
    expect(prepareRequestInfoData(fakeFormData, CreditLineType.BankLine, 'B 123')).toEqual({
      data: expectedData,
      mailTo: undefined
    })
  })

  it('should return object with mailTo', () => {
    const expectedMailTo = {
      email: '',
      subject: 'Appetite on B 123 in the context of LC confirmation',
      body: 'This a comment'
    }

    expect(prepareRequestInfoData({ ...fakeFormData, mailTo: true }, CreditLineType.BankLine, 'B 123')).toEqual({
      data: expectedData,
      mailToInfo: expectedMailTo
    })
  })
})

describe('buildCounterpartyPickerItems', () => {
  it('should format members to array of CompanyTableItem', () => {
    const expectedValue = [
      {
        name: 'Applicant Name',
        countryName: 'Serbia',
        country: 'rs',
        location: 'city',
        id: 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'
      }
    ]
    expect(buildCounterpartyPickerItems([fakeMember1])).toEqual(expectedValue)
  })
})

describe('buildCounterpartyRowConfig', () => {
  it('should match default expected when nothing is selected', () => {
    const defaultExpectedValue = new Map([['cf63c1f8-1165-4c94-a8f8-9252eb4f0016', {}], ['123', { disabled: true }]])

    expect(buildCounterpartyRowConfig([fakeMember1, fakeMember2], [])).toEqual(defaultExpectedValue)
  })

  it('should match when item is selected', () => {
    const defaultExpectedValue = new Map([
      ['cf63c1f8-1165-4c94-a8f8-9252eb4f0016', { highlighted: true }],
      ['123', { disabled: true }]
    ])

    expect(buildCounterpartyRowConfig([fakeMember1, fakeMember2], ['cf63c1f8-1165-4c94-a8f8-9252eb4f0016'])).toEqual(
      defaultExpectedValue
    )
  })
})
