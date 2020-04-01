import { tranformToRdTraderDashboardData, DEFAULT_TEXT_BANK_NOT_ACCEPTED } from './rdTraderDashboardSelectors'
import { fakeTradeSeller, fakeMember } from '../../letter-of-credit-legacy/utils/faker'
import { ITradeEnriched } from '../../trades/store/types'
import { fakeReceivablesDiscounting } from '../utils/faker'
import { formatPrice } from '../../trades/utils/displaySelectors'
import { sentenceCase } from '../../../utils/casings'
import { displayDate } from '../../../utils/date'
import { IReceivableDiscountingDashboardTrader } from '../store/types'
import { CreditRequirements, RDStatus, IReceivablesDiscountingInfo, TradeSource } from '@komgo/types'
import { IMember } from '../../members/store/types'
import { TRADE_STATUS, TradingRole } from '../../trades/constants'
import { Strings } from '../resources/strings'

const exampleCompany = '123'

describe('tranformToRdTraderDashboardData', () => {
  it('should return formatted RD data', () => {
    expect(tranformToRdTraderDashboardData(fakeMembers, fakeTrades, fakeRds)).toMatchSnapshot()
  })

  it('should return only trades if there is no RD data in a formatted way', () => {
    expect(tranformToRdTraderDashboardData(fakeMembers, fakeTrades, [])).toMatchSnapshot()
  })

  it('should return trades merged with RD data', () => {
    const expected: IReceivableDiscountingDashboardTrader[] = [
      createExpectedTraderWithRDData(0, 0),
      createExpectedTrader(1),
      createExpectedTraderWithRDData(2, 1),
      createExpectedTraderWithRDData(4, 3)
    ]

    expect(tranformToRdTraderDashboardData(fakeMembers, fakeTrades, fakeRds)).toEqual(expected)
  })

  it('should return only trades if there is no RD data', () => {
    const expected: IReceivableDiscountingDashboardTrader[] = [
      createExpectedTrader(0),
      createExpectedTrader(1),
      createExpectedTrader(2),
      createExpectedTrader(4)
    ]

    expect(tranformToRdTraderDashboardData(fakeMembers, fakeTrades, [])).toEqual(expected)
  })

  it('should return empty if there are not trades even if there is RD data', () => {
    expect(tranformToRdTraderDashboardData(fakeMembers, [], fakeRds)).toEqual([])
  })

  function createExpectedTraderWithRDData(tradeIndex: number, rdIndex?: number): IReceivableDiscountingDashboardTrader {
    return {
      bank: rdIndex < fakeMembers.length ? fakeMembers[rdIndex].x500Name.CN : DEFAULT_TEXT_BANK_NOT_ACCEPTED,
      commodity: fakeTrades[tradeIndex].commodity,
      counterparty: fakeTrades[tradeIndex].buyerName,
      currency: fakeRds[rdIndex].rd.currency,
      invoiceType: sentenceCase(fakeRds[rdIndex].rd.invoiceType),
      invoiceAmount: formatPrice(fakeRds[rdIndex].rd.invoiceAmount),
      rdId: fakeRds[rdIndex].rd.staticId,
      status: sentenceCase(fakeRds[rdIndex].status),
      tradeDate: displayDate(fakeTrades[tradeIndex].dealDate),
      tradeId: fakeTrades[tradeIndex].sellerEtrmId,
      tradeTechnicalId: fakeTrades[tradeIndex]._id,
      rdStatus: fakeRds[rdIndex].status
    }
  }

  function createExpectedTrader(tradeIndex: number): IReceivableDiscountingDashboardTrader {
    return {
      bank: DEFAULT_TEXT_BANK_NOT_ACCEPTED,
      commodity: fakeTrades[tradeIndex].commodity,
      counterparty: fakeTrades[tradeIndex].buyerName,
      currency: fakeTrades[tradeIndex].currency,
      invoiceType: undefined,
      invoiceAmount: undefined,
      rdId: undefined,
      status: Strings.SellerTradeStatusDefault,
      tradeDate: displayDate(fakeTrades[tradeIndex].dealDate),
      tradeId: fakeTrades[tradeIndex].sellerEtrmId,
      tradeTechnicalId: fakeTrades[tradeIndex]._id,
      rdStatus: undefined
    }
  }
})

const tradeSourceId1 = 'SOURCE-ID-1'
const tradeSourceId2 = 'SOURCE-ID-2'
const tradeSourceId3 = 'SOURCE-ID-3'
const tradeSourceIdWithoutRD = 'SOURCE-ID-WithoutRD'
const tradeSourceIdDeleted = 'SOURCE-ID-Del'

const acceptedParticipantStaticId1 = 'acceptedParticipantStaticId-1'
const acceptedParticipantStaticId2 = 'acceptedParticipantStaticId-2'
const acceptedParticipantStaticId3 = 'acceptedParticipantStaticId-3'
const acceptedParticipantStaticIdDeleted = 'acceptedParticipantStaticId-Deleted'

const fakeMembers: IMember[] = [
  fakeMember({ staticId: acceptedParticipantStaticId1, commonName: 'bank1' }),
  fakeMember({ staticId: acceptedParticipantStaticId2, commonName: 'bank2' }),
  fakeMember({ staticId: acceptedParticipantStaticIdDeleted, commonName: 'bankDeleted' })
]

const fakeTrades: ITradeEnriched[] = [
  {
    ...fakeTradeSeller(),
    source: TradeSource.Vakt,
    status: TRADE_STATUS.ToBeDiscounted,
    sourceId: tradeSourceId1,
    _id: 'a',
    buyerName: 'CN buyer 1',
    sellerName: 'CN seller 1',
    buyer: exampleCompany,
    buyerEtrmId: '1',
    sellerEtrmId: '5',
    seller: 'bphggggg'
  },
  {
    ...fakeTradeSeller(),
    source: TradeSource.Komgo,
    status: TRADE_STATUS.ToBeDiscounted,
    sourceId: tradeSourceIdWithoutRD, // make it with sourceId without RD to be ignored
    _id: 'd',
    seller: exampleCompany,
    sellerEtrmId: '2',
    buyer: 'texaco',
    buyerName: 'CN buyer texaco',
    sellerName: 'CN seller 123'
  },
  {
    ...fakeTradeSeller(),
    source: TradeSource.Komgo,
    status: 'OK',
    sourceId: tradeSourceId2,
    _id: 'b',
    seller: exampleCompany,
    sellerEtrmId: '2',
    buyer: '321',
    buyerName: 'CN buyer texaco',
    sellerName: 'CN seller 123'
  },
  {
    ...fakeTradeSeller(),
    tradingRole: TradingRole.BUYER, // make it buyer trade to be ignored
    source: TradeSource.Komgo,
    status: 'OK',
    sourceId: tradeSourceId2,
    _id: 'b',
    seller: exampleCompany,
    sellerEtrmId: '2',
    buyer: '321',
    buyerName: 'CN buyer texaco',
    sellerName: 'CN seller 123'
  },
  {
    ...fakeTradeSeller(),
    source: TradeSource.Komgo,
    status: 'OK',
    sourceId: tradeSourceId3,
    _id: 'c',
    seller: exampleCompany,
    sellerEtrmId: '2',
    buyer: 'texaco',
    buyerName: 'CN buyer texaco',
    sellerName: 'CN seller 123'
  }
]

const fakeRds: IReceivablesDiscountingInfo[] = [
  fakeReceivablesDiscounting(
    {
      status: RDStatus.PendingRequest,
      sourceId: tradeSourceId1
    },
    acceptedParticipantStaticId1
  ),
  fakeReceivablesDiscounting(
    {
      status: RDStatus.PendingRequest,
      sourceId: tradeSourceId2
    },
    acceptedParticipantStaticId2
  ),
  fakeReceivablesDiscounting({
    status: RDStatus.PendingRequest,
    sourceId: tradeSourceIdDeleted
  }),
  fakeReceivablesDiscounting({
    status: RDStatus.PendingRequest,
    sourceId: tradeSourceId3
  })
]
