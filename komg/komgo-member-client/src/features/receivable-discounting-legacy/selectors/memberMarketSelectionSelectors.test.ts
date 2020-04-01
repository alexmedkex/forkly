import { fakeCounterparty } from '../../letter-of-credit-legacy/utils/faker'
import { IMemberMarketSelectionItem } from '../store/types'
import { Currency } from '@komgo/types'
import { Counterparty } from '../../counterparties/store/types'
import {
  tranformToMemberMarketSelectionData,
  createDefaultMemberMarketSelectionItem
} from './memberMarketSelectionSelectors'
import { IDisclosedCreditLine } from '../../credit-line/store/types'

describe('tranformToMemberMarketSelectionData', () => {
  it('should return counterparty with credit line info', () => {
    const expected: IMemberMarketSelectionItem[] = mergedCounterpartyItems

    expect(tranformToMemberMarketSelectionData(fakeCounterparties, fakeCreditLines)).toEqual(expected)
  })

  it('should return only counterparties if there is no credit line data', () => {
    const expected: IMemberMarketSelectionItem[] = emptyCounterpartyItems

    expect(tranformToMemberMarketSelectionData(fakeCounterparties, [])).toEqual(expected)
  })

  it('should return empty if no counterparties even if there is credit lines for it', () => {
    expect(tranformToMemberMarketSelectionData([], fakeCreditLines)).toEqual([])
  })
})

const commonStaticId: string = 'commonStatcId'
const fakeCounterparties: Counterparty[] = [fakeCounterparty(), fakeCounterparty({ staticId: commonStaticId })]
const fakeCreditLines: IDisclosedCreditLine[] = [
  {
    ownerStaticId: fakeCounterparties[0].staticId,
    counterpartyStaticId: '3v4r3r3r3',
    appetite: false,
    staticId: '123',

    context: { productId: 'TradeFinance', subProductId: 'rd' },
    currency: Currency.EUR,
    availability: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    counterpartyStaticId: 'notUsed',
    ownerStaticId: '3v4r3r3r3',
    appetite: false,
    staticId: '456',
    context: { productId: 'TradeFinance', subProductId: 'rd' },
    currency: Currency.EUR,
    availability: false,
    createdAt: '',
    updatedAt: ''
  },
  {
    counterpartyStaticId: '3v4r3r3r3',
    ownerStaticId: commonStaticId,
    appetite: true,
    staticId: '789',
    context: { productId: 'TradeFinance', subProductId: 'rd' },
    currency: Currency.EUR,
    availability: false,
    createdAt: '',
    updatedAt: '',
    data: { maximumTenor: 90 }
  }
]

const emptyCounterpartyItems: IMemberMarketSelectionItem[] = [
  createDefaultMemberMarketSelectionItem(fakeCounterparties[0]),
  createDefaultMemberMarketSelectionItem(fakeCounterparties[1])
]

const mergedCounterpartyItems: IMemberMarketSelectionItem[] = [
  {
    counterparty: fakeCounterparties[0],
    location: fakeCounterparties[0].x500Name.L,
    appetite: 'No',
    availability: 'Yes',
    creditLimit: '-',
    riskFee: '-',
    margin: '-',
    maxTenor: '-'
  },
  {
    counterparty: fakeCounterparties[1],
    location: fakeCounterparties[1].x500Name.L,
    appetite: 'Yes',
    availability: 'No',
    creditLimit: '-',
    riskFee: '-',
    margin: '-',
    maxTenor: '90'
  }
]
