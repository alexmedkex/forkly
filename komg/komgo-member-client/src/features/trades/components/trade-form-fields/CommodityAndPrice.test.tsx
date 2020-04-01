import * as React from 'react'
import * as renderer from 'react-test-renderer'
import CommodityAndPrice, { CommodityAndPriceOwnProps } from './CommodityAndPrice'
import { initialTradeData, initialCargoData, TRADING_ROLE_OPTIONS } from '../../constants'
import { FormikProvider, FormikContext } from 'formik'
import { ICreateOrUpdateTrade } from '../../store/types'
import { fakeFormikContext } from '../../../../store/common/faker'
import {
  buildFakeTrade,
  buildFakeCargo,
  Commodity,
  InvoiceQuantity,
  PriceUnit,
  PriceOption,
  Currency,
  PaymentTermsOption,
  TRADE_SCHEMA_VERSION,
  CARGO_SCHEMA_VERSION
} from '@komgo/types'

describe('CommodityAndPrice component', () => {
  let defaultProps: CommodityAndPriceOwnProps
  let formikContext: FormikContext<ICreateOrUpdateTrade>
  beforeEach(() => {
    defaultProps = {
      initialData: { trade: initialTradeData as any, cargo: initialCargoData as any, documents: [] },
      isDisabled: () => false,
      tradingRole: TRADING_ROLE_OPTIONS.BUYER
    }
    formikContext = fakeFormikContext<ICreateOrUpdateTrade>({
      trade: {
        ...buildFakeTrade({
          commodity: Commodity.Power,
          invoiceQuantity: InvoiceQuantity.Discharge,
          quantity: 3,
          priceUnit: PriceUnit.DMT,
          minTolerance: 1,
          maxTolerance: 3,
          price: 400.33,
          currency: Currency.EUR,
          paymentTermsOption: PaymentTermsOption.Deferred,
          version: TRADE_SCHEMA_VERSION.V2
        }),
        priceOption: PriceOption.Fix
      },
      cargo: buildFakeCargo({
        grade: 'MY_GRADE',
        quality: 'MY_QUALITY',
        originOfGoods: 'MY_ORIGIN_OF_GOODS',
        parcels: [],
        version: CARGO_SCHEMA_VERSION.V2
      }),
      documents: []
    })
  })

  it('should match snapshot', () => {
    expect(
      renderer
        .create(
          <FormikProvider value={formikContext}>
            <CommodityAndPrice {...defaultProps} />
          </FormikProvider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
