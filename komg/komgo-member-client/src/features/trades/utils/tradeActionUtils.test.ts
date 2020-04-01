import {
  getActionPermissions,
  TradeAction,
  getTradeActionsForFinancialInstruments,
  canDeleteTrade,
  canEditTrade,
  isDisabledFieldForRole,
  isDisabledFieldForRd
} from './tradeActionUtils'
import { TradingRole, TRADING_ROLE_OPTIONS, TRADE_STATUS } from '../constants'
import { ILetterOfCredit, ILetterOfCreditStatus } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import {
  IStandbyLetterOfCredit,
  StandbyLetterOfCreditStatus,
  buildFakeTrade,
  TradeSource,
  buildFakeStandByLetterOfCredit,
  buildFakeLetterOfCredit,
  RDStatus,
  CreditRequirements,
  IDataLetterOfCredit,
  LetterOfCreditStatus
} from '@komgo/types'
import { fakeLetterOfCredit } from '../../letter-of-credit-legacy/utils/faker'
import { ILetterOfCreditWithData } from '../../letter-of-credit/store/types'
describe('tradeActionUtils', () => {
  it('should get permissions for all actions', () => {
    Object.values(TradeAction).forEach(action => {
      expect(getActionPermissions(action)).toBeDefined()
    })
  })

  describe('getTradeActionsForFinancialInstruments', () => {
    it('should get actions if LC exists', () => {
      const actions = getTradeActionsForFinancialInstruments(
        null,
        TradingRole.BUYER,
        { status: ILetterOfCreditStatus.REQUESTED } as ILetterOfCredit,
        null,
        null
      )

      expect(actions).toMatchObject([TradeAction.ViewLC])
    })

    it('should get actions if for rejected LC', () => {
      const actions = getTradeActionsForFinancialInstruments(
        null,
        TradingRole.BUYER,
        { status: ILetterOfCreditStatus.REQUEST_REJECTED } as ILetterOfCredit,
        null,
        null
      )

      expect(actions).toMatchObject([TradeAction.ReapplyForLC, TradeAction.ApplyForSBLC])
    })

    it('should get actions legacy SBLC exists', () => {
      const actions = getTradeActionsForFinancialInstruments(
        null,
        TradingRole.BUYER,
        null,
        {
          status: StandbyLetterOfCreditStatus.Requested
        } as IStandbyLetterOfCredit,
        null
      )

      expect(actions).toMatchObject([TradeAction.ViewLegacySBLC])
    })

    it('should get actions for rejected SBLC', () => {
      const actions = getTradeActionsForFinancialInstruments(
        null,
        TradingRole.BUYER,
        null,
        {
          status: StandbyLetterOfCreditStatus.RequestRejected
        } as IStandbyLetterOfCredit,
        null
      )

      expect(actions).toMatchObject([TradeAction.ApplyForLC, TradeAction.ReapplyForSBLC])
    })

    it('should get actions new SBLC exists', () => {
      const actions = getTradeActionsForFinancialInstruments(
        null,
        TradingRole.BUYER,
        null,
        null,
        buildFakeLetterOfCredit<IDataLetterOfCredit>()
      )

      expect(actions).toMatchObject([TradeAction.ViewSBLC])
    })

    it('should get actions for rejected new SBLC', () => {
      const actions = getTradeActionsForFinancialInstruments(null, TradingRole.BUYER, null, null, {
        status: LetterOfCreditStatus.RequestRejected
      } as ILetterOfCreditWithData)

      expect(actions).toMatchObject([TradeAction.ApplyForLC, TradeAction.ReapplyForSBLC])
    })
  })

  describe('canEditTrade', () => {
    it('should not allow editing for VAKT trade', () => {
      expect(canEditTrade(buildFakeTrade({ source: TradeSource.Vakt }), undefined)).toBeFalsy()
    })

    describe('Non-Vakt Trade', () => {
      it('should allow editing if trade is not open credit', () => {
        expect(
          canEditTrade(
            buildFakeTrade({
              source: TradeSource.Komgo,
              creditRequirement: CreditRequirements.DocumentaryLetterOfCredit
            }),
            undefined
          )
        ).toBeTruthy()
      })

      it('should allow editing if trade if RD status is PendingRequest ', () => {
        expect(
          canEditTrade(
            buildFakeTrade({
              source: TradeSource.Komgo,
              creditRequirement: CreditRequirements.OpenCredit,
              sellerEtrmId: 'testSellerEtrm',
              buyerEtrmId: ''
            }),
            RDStatus.PendingRequest
          )
        ).toBeTruthy()
      })

      it('should allow editing if trade if Trade RD status is ToBeDiscounted ', () => {
        expect(
          canEditTrade(
            buildFakeTrade({
              source: TradeSource.Komgo,
              creditRequirement: CreditRequirements.OpenCredit,
              sellerEtrmId: 'testSellerEtrm',
              buyerEtrmId: '',
              status: TRADE_STATUS.ToBeDiscounted
            }),
            undefined
          )
        ).toBeTruthy()
      })

      it('should allow editing if trade if RD status is QuoteAccepted ', () => {
        expect(
          canEditTrade(
            buildFakeTrade({
              source: TradeSource.Komgo,
              creditRequirement: CreditRequirements.OpenCredit,
              sellerEtrmId: 'testSellerEtrm',
              buyerEtrmId: ''
            }),
            RDStatus.QuoteAccepted
          )
        ).toBeTruthy()
      })

      it('should not allow editing if RD status is QuoteSubmitted ', () => {
        expect(
          canEditTrade(
            {
              ...buildFakeTrade({
                source: TradeSource.Komgo,
                creditRequirement: CreditRequirements.OpenCredit,
                sellerEtrmId: 'testSellerEtrm',
                buyerEtrmId: ''
              }),
              tradingRole: TradingRole.SELLER
            },
            RDStatus.QuoteSubmitted
          )
        ).toBeFalsy()
      })

      it('should not allow editing if RD status is Requested ', () => {
        expect(
          canEditTrade(
            {
              ...buildFakeTrade({
                source: TradeSource.Komgo,
                creditRequirement: CreditRequirements.OpenCredit,
                sellerEtrmId: 'testSellerEtrm',
                buyerEtrmId: ''
              }),
              tradingRole: TradingRole.SELLER
            },
            RDStatus.Requested
          )
        ).toBeFalsy()
      })
    })
  })

  describe('canDeleteTrade', () => {
    it('doesnt allow deletion of vakt trades', () => {
      expect(canDeleteTrade(buildFakeTrade({ source: TradeSource.Vakt }))).toEqual(false)
    })
    it('allows deletion of a basic trade', () => {
      expect(canDeleteTrade(buildFakeTrade())).toEqual(true)
    })
    it('doesnt allow deletion of a trade with an associated LC in requested state', () => {
      expect(canDeleteTrade(buildFakeTrade(), fakeLetterOfCredit())).toEqual(false)
    })
    it('doesnt allow deletion of a trade with an associated LC in issued state', () => {
      expect(canDeleteTrade(buildFakeTrade(), fakeLetterOfCredit({ status: ILetterOfCreditStatus.ISSUED }))).toEqual(
        false
      )
    })
    it('allows deletion of a trade with an associated LC in a rejected state', () => {
      expect(
        canDeleteTrade(buildFakeTrade(), fakeLetterOfCredit({ status: ILetterOfCreditStatus.ISSUED_LC_REJECTED }))
      ).toEqual(true)
    })
    it('doesnt allow deletion of a trade with an associated SBLC in requested state', () => {
      expect(canDeleteTrade(buildFakeTrade(), null, buildFakeStandByLetterOfCredit())).toEqual(false)
    })
    it('doesnt allow deletion of a trade with an associated SBLC in issued state', () => {
      expect(
        canDeleteTrade(
          buildFakeTrade(),
          null,
          buildFakeStandByLetterOfCredit({ status: StandbyLetterOfCreditStatus.Issued })
        )
      ).toEqual(false)
    })
    it('allows deletion of a trade with an associated SBLC in a rejected state', () => {
      expect(
        canDeleteTrade(
          buildFakeTrade(),
          null,
          buildFakeStandByLetterOfCredit({ status: StandbyLetterOfCreditStatus.RequestRejected })
        )
      ).toEqual(true)
    })
    it('doesnt allow deletion if lc in in an active state but SBLC isnt', () => {
      expect(
        canDeleteTrade(
          buildFakeTrade(),
          fakeLetterOfCredit(),
          buildFakeStandByLetterOfCredit({ status: StandbyLetterOfCreditStatus.RequestRejected })
        )
      ).toEqual(false)
    })
    it('doesnt allow deletion if SBLC in in an active state but LC isnt', () => {
      expect(
        canDeleteTrade(
          buildFakeTrade(),
          fakeLetterOfCredit({ status: ILetterOfCreditStatus.ISSUED_LC_REJECTED }),
          buildFakeStandByLetterOfCredit({ status: StandbyLetterOfCreditStatus.Issued })
        )
      ).toEqual(false)
    })
    it('allows deletion if neither SBLC or LC are in active state', () => {
      expect(
        canDeleteTrade(
          buildFakeTrade(),
          fakeLetterOfCredit({ status: ILetterOfCreditStatus.REQUEST_REJECTED }),
          buildFakeStandByLetterOfCredit({ status: StandbyLetterOfCreditStatus.IssuedRejected })
        )
      ).toEqual(true)
    })
  })
  describe('isDisabledFieldForRole', () => {
    it('should return true for seller field and seller role', () => {
      expect(isDisabledFieldForRole('trade.seller', TRADING_ROLE_OPTIONS.SELLER)).toBeTruthy()
    })
    it('should return true for buyer field and buyer role', () => {
      expect(isDisabledFieldForRole('trade.buyer', TRADING_ROLE_OPTIONS.BUYER)).toBeTruthy()
    })
  })
  describe('isDisabledFieldForRd', () => {
    // spot checks, real tests are on component
    it('should be editable when RD status is QuoteAccepted', () => {
      expect(isDisabledFieldForRd('trade.contractDate', RDStatus.QuoteAccepted)).toBeFalsy()
    })
    it('should editable for cargo field when RD status is QuoteAccepted', () => {
      expect(isDisabledFieldForRd('cargo.quality', RDStatus.QuoteAccepted)).toBeFalsy()
    })
    it('should be disabled when RD status is QuoteSubmitted', () => {
      expect(isDisabledFieldForRd('trade.contractDate', RDStatus.QuoteSubmitted)).toBeTruthy()
    })
    it('should be disabled for non-editable field when RD status is QuoteAccepted', () => {
      expect(isDisabledFieldForRd('trade.sellerEtrmId', RDStatus.QuoteAccepted)).toBeTruthy()
    })
    it('should be editable when RD status is PendingRequest', () => {
      expect(isDisabledFieldForRd('trade.sellerEtrmId', RDStatus.PendingRequest)).toBeFalsy()
    })
  })
})
