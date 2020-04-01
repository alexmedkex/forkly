import * as React from 'react'
import * as renderer from 'react-test-renderer'
import TradeData, { TradeDataOwnProps } from './TradeData'
import { initialTradeData, initialCargoData, TRADING_ROLE_OPTIONS } from '../../constants'
import {
  ITrade,
  buildFakeTrade,
  buildFakeCargo,
  buildFakeParcel,
  CreditRequirements,
  TRADE_SCHEMA_VERSION
} from '@komgo/types'
import { FormikContext, FormikProvider } from 'formik'
import { ICreateOrUpdateTrade } from '../../store/types'
import { fakeFormikContext } from '../../../../store/common/faker'
import { isDisabledFieldForRole } from '../../utils/tradeActionUtils'

const tradeDataBuyerTrade: ITrade = buildFakeTrade({
  buyer: 'MY_BUYER',
  buyerEtrmId: 'MY_BUYER_REF',
  seller: 'MY_SELLER',
  sellerEtrmId: 'MY_SELLER_REF',
  creditRequirement: CreditRequirements.StandbyLetterOfCredit,
  dealDate: '2019-06-19',
  version: TRADE_SCHEMA_VERSION.V2
})

const tradeDataSellerTrade: ITrade = buildFakeTrade({
  buyer: 'MY_BUYER',
  buyerEtrmId: 'MY_BUYER_REF',
  seller: 'MY_SELLER',
  sellerEtrmId: 'MY_SELLER_REF',
  creditRequirement: CreditRequirements.OpenCredit,
  dealDate: '2019-06-19',
  version: TRADE_SCHEMA_VERSION.V2
})

const tradeDataCreateOrUpdateTrade: ICreateOrUpdateTrade = {
  trade: tradeDataBuyerTrade,
  cargo: buildFakeCargo({
    parcels: [
      buildFakeParcel({
        destinationPlace: 'Test',
        loadingPlace: 'Test',
        deemedBLDate: '2019-01-03',
        quantity: 1
      })
    ]
  }),
  documents: []
}

describe('TradeData component', () => {
  let defaultProps: TradeDataOwnProps
  let formikContext: FormikContext<ICreateOrUpdateTrade>

  beforeEach(() => {
    formikContext = fakeFormikContext<ICreateOrUpdateTrade>(tradeDataCreateOrUpdateTrade)

    defaultProps = {
      initialData: { trade: initialTradeData as any, cargo: initialCargoData as any, documents: [] },
      tradingMembersDropdownOptions: [],
      tradingRole: TRADING_ROLE_OPTIONS.BUYER,
      canSwitchTradingRole: true,
      switchToTradingRole: () => null,
      isDisabled: jest.fn()
    }
  })

  it('should match snapshot as buyer trade', () => {
    defaultProps.isDisabled = jest.fn(field => isDisabledFieldForRole(field, TRADING_ROLE_OPTIONS.BUYER))
    expect(
      renderer
        .create(
          <FormikProvider value={formikContext}>
            <TradeData {...defaultProps} />
          </FormikProvider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should match snapshot with seller trade', () => {
    defaultProps.isDisabled = jest.fn(field => isDisabledFieldForRole(field, TRADING_ROLE_OPTIONS.SELLER))
    const sellerFormikContext = fakeFormikContext<ICreateOrUpdateTrade>({
      ...tradeDataCreateOrUpdateTrade,
      trade: tradeDataSellerTrade
    })

    expect(
      renderer
        .create(
          <FormikProvider value={sellerFormikContext}>
            <TradeData {...defaultProps} tradingRole={TRADING_ROLE_OPTIONS.SELLER} />
          </FormikProvider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
