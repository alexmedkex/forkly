import {
  populateCreditLinesData,
  populateCreditLineData,
  populateDisclosedCreditLineSummaryData,
  populateDisclosedCreditLineData,
  groupRequestsByBuyerId,
  populateRequestsData,
  getMembersWithDisabledFlag
} from './selectors'
import { fakeMember } from '../../letter-of-credit-legacy/utils/faker'
import { buildFakeRiskCover, buildFakeCreditLine } from '@komgo/types'
import { IExtendedCreditLine, IDisclosedCreditLine, CreditLineType } from '../store/types'

const request = {
  deletedAt: null,
  _id: '5d0233fc449a5c3bd2959015',
  staticId: '123',
  requestType: 'RECEIVED',
  context: { productId: 'tradeFinance', subProductId: 'rd' },
  counterpartyStaticId: 'buyer123',
  companyStaticId: 'seller123',
  comment: 'This is a custom comment 1',
  status: 'PENDING',
  createdAt: '2019-06-10T15:22:29.738Z',
  updatedAt: '2019-06-10T15:22:29.738Z'
}

describe('populateCreditLinesData & populateCreditLineData', () => {
  const riskCover = (buildFakeRiskCover() as unknown) as IExtendedCreditLine

  const members = [fakeMember({ staticId: riskCover.counterpartyStaticId, commonName: 'Test 1' })]

  it('should return list of buyers with buyer name', () => {
    const expectedResponse = [{ ...riskCover, counterpartyName: 'Test 1', counterpartyLocation: 'city' }]
    expect(populateCreditLinesData([riskCover], members)).toEqual(expectedResponse)
  })

  it('should return populate buyer name', () => {
    const expectedResponse = { ...riskCover, counterpartyName: 'Test 1', counterpartyLocation: 'city' }
    expect(populateCreditLineData(riskCover, members)).toEqual(expectedResponse)
  })
})

describe('populateDisclosedCreditLineData', () => {
  const membersByStaticId = { '123': fakeMember({ staticId: '123', commonName: 'Test 1' }) }
  const disclosedCreditLineSummaries = [
    {
      counterpartyStaticId: '123',
      lowestFee: 2,
      availabilityCount: 3,
      appetiteCount: 4,
      _id: '11'
    }
  ]

  it('should return disclosed credit line with counterparty name', () => {
    expect(populateDisclosedCreditLineSummaryData(disclosedCreditLineSummaries, membersByStaticId)).toEqual([
      {
        ...disclosedCreditLineSummaries[0],
        counterpartyName: 'Test 1',
        counterpartyLocation: 'city'
      }
    ])
  })

  it('should return disclosed credit line with - as counterparty name if counterparty is not found in members', () => {
    expect(
      populateDisclosedCreditLineSummaryData(
        [{ ...disclosedCreditLineSummaries[0], counterpartyStaticId: '111' }],
        membersByStaticId
      )
    ).toEqual([
      {
        ...disclosedCreditLineSummaries[0],
        counterpartyStaticId: '111',
        counterpartyName: '-',
        counterpartyLocation: '-'
      }
    ])
  })
})

describe('populateDisclosedCreditLineData', () => {
  const fakeCreditLine1 = {
    ...buildFakeCreditLine({ staticId: '1234', counterpartyStaticId: '111' }),
    ownerStaticId: '123'
  } as IDisclosedCreditLine
  const fakeCreditLine2 = {
    ...buildFakeCreditLine({
      staticId: '1234',
      counterpartyStaticId: '1234'
    }),
    ownerStaticId: '111'
  } as IDisclosedCreditLine
  const members = {
    '123': fakeMember({ staticId: '123', commonName: 'Test 1' }),
    '111': fakeMember({ staticId: '111', commonName: 'Test 2' })
  }
  const buyerId = '111'

  expect(populateDisclosedCreditLineData([fakeCreditLine1, fakeCreditLine2], members, buyerId)).toEqual([
    {
      ...fakeCreditLine1,
      companyName: 'Test 1',
      counterpartyName: 'Test 2',
      companyLocation: 'city'
    }
  ])
})

describe('groupRequestsByBuyerId', () => {
  it('should return empty object when requests do not exist', () => {
    expect(groupRequestsByBuyerId([])).toEqual({})
  })

  it('should return appropritate object which groups requests by buyer id', () => {
    expect(groupRequestsByBuyerId([request as any])).toEqual({
      buyer123: [request]
    })
  })
})

describe('populateRequestsData', () => {
  it('should populate request data with company names for buyer and seller', () => {
    const buyer = fakeMember({ staticId: 'buyer123', commonName: 'Buyer Name' })
    const seller = fakeMember({ staticId: 'seller123', commonName: 'Seller Name' })
    const expectedData = [
      {
        ...request,
        companyName: 'Seller Name',
        counterpartyName: 'Buyer Name'
      }
    ]

    expect(populateRequestsData([request as any], [buyer, seller])).toEqual(expectedData)
  })
})

describe('getMembersWithDisabledFlag', () => {
  const fakeMember1 = fakeMember({ country: 'RS', isFinancialInstitution: true })
  const fakeMember2 = fakeMember({ country: 'RS', staticId: '123' })

  it('should filter out financial institutions and return array of IMemberWithDisabledFlag', () => {
    expect(getMembersWithDisabledFlag([fakeMember1, fakeMember2], CreditLineType.RiskCover, [], '111')).toEqual([
      { ...fakeMember2, disabled: false }
    ])
  })

  it('should filter out non financial institution and return array of IMemberWithDisabledFlag', () => {
    expect(getMembersWithDisabledFlag([fakeMember1, fakeMember2], CreditLineType.BankLine, [], '111')).toEqual([
      { ...fakeMember1, disabled: false }
    ])
  })
})
