import * as React from 'react'
import { IParcelWithOverrides } from '../components/cargo-form-fields/ParcelData'
import {
  buildFakeParcel,
  ModeOfTransport,
  PriceOption,
  PaymentTermsOption,
  ITrade,
  PaymentTermsEventBase,
  PaymentTermsWhen,
  PaymentTermsTimeUnit,
  PaymentTermsDayType,
  buildFakeTrade,
  buildFakeCargo,
  IParcel
} from '@komgo/types'
import { sanitiseParcelValues, sanitiseCreateOrUpdateTrade } from './sanitiser'
import { ICreateOrUpdateTrade } from '../store/types'
import { initialTradeData, initialCargoData, TradingRole } from '../constants'

const parcelWithAllSpecifics: IParcelWithOverrides = {
  ...buildFakeParcel(),
  vesselIMO: 3,
  vesselName: 'brave',
  tankFarmOperatorName: 'chuck',
  pipelineName: 'trans-siberia',
  warehouseOperatorName: 'barry'
}
describe('sanitiseParcelValues', () => {
  it('overwrites the mode of transport other with value of modeOfTransportOther', () => {
    expect(
      sanitiseParcelValues({
        ...parcelWithAllSpecifics,
        modeOfTransport: ModeOfTransport.Other,
        modeOfTransportOther: 'bicycle'
      })
    ).toEqual(expect.objectContaining({ modeOfTransport: 'bicycle' }))
  })
  it('keeps vesselIMO and vesselName if ModeOfTransport is Vessel', () => {
    expect(sanitiseParcelValues({ ...parcelWithAllSpecifics, modeOfTransport: ModeOfTransport.Vessel })).toEqual(
      expect.objectContaining({ vesselIMO: 3, vesselName: 'brave' })
    )
  })
  it('keeps tankFarmOperatorName if ModeOfTransport is ITT', () => {
    expect(sanitiseParcelValues({ ...parcelWithAllSpecifics, modeOfTransport: ModeOfTransport.ITT })).toEqual(
      expect.objectContaining({
        tankFarmOperatorName: 'chuck'
      })
    )
  })
  it('keeps pipelineName if ModeOfTransport is Pipeline', () => {
    expect(sanitiseParcelValues({ ...parcelWithAllSpecifics, modeOfTransport: ModeOfTransport.Pipeline })).toEqual(
      expect.objectContaining({
        pipelineName: 'trans-siberia'
      })
    )
  })
  it('removes other optionals if ModeOfTransport is Pipeline', () => {
    expect(sanitiseParcelValues({ ...parcelWithAllSpecifics, modeOfTransport: ModeOfTransport.Pipeline })).not.toEqual(
      expect.objectContaining({
        vesselIMO: 3,
        vesselName: 'brave',
        tankFarmOperatorName: 'chuck',
        warehouseOperatorName: 'barry'
      })
    )
  })
  it('keeps warehouseOperatorName if ModeOfTransport is Warehouse', () => {
    expect(sanitiseParcelValues({ ...parcelWithAllSpecifics, modeOfTransport: ModeOfTransport.Warehouse })).toEqual(
      expect.objectContaining({
        warehouseOperatorName: 'barry'
      })
    )
  })
})

// NOTE: more tests for sanitiseCreateOrUpdateTrade have been done within the component itself.

describe('sanitiseCreateOrUpdateTrade', () => {
  it('removes pricingFormula if set but priceOption is FIX', () => {
    const form: ICreateOrUpdateTrade = {
      trade: {
        ...initialTradeData,
        priceOption: PriceOption.Fix,
        priceFormula: 'aaaaaa'
      } as any,
      cargo: initialCargoData as any,
      documents: []
    }

    expect(sanitiseCreateOrUpdateTrade(form, TradingRole.BUYER, 'id').trade.priceFormula).toBeUndefined()
  })
  it('removes paymentTerms if set but paymentOption is SIGHT', () => {
    const form: ICreateOrUpdateTrade = {
      trade: {
        ...initialTradeData,
        paymentTermsOption: PaymentTermsOption.Sight,
        paymentTerms: {
          eventBase: PaymentTermsEventBase.NoticeOfReadiness,
          when: PaymentTermsWhen.After,
          time: 1,
          timeUnit: PaymentTermsTimeUnit.Days,
          dayType: PaymentTermsDayType.Calendar
        }
      } as any,
      cargo: initialCargoData as any,
      documents: []
    }

    expect(sanitiseCreateOrUpdateTrade(form, TradingRole.BUYER, 'id').trade.paymentTerms).toBeUndefined()
  })
  it('moves modeoftransportOTHER into the parcel modeoftransport', () => {
    const form: ICreateOrUpdateTrade = {
      trade: buildFakeTrade(),
      cargo: buildFakeCargo({
        parcels: [
          { ...buildFakeParcel({ modeOfTransport: ModeOfTransport.Other }), modeOfTransportOther: 'BIKE' } as IParcel
        ]
      }),
      documents: []
    }

    expect(sanitiseCreateOrUpdateTrade(form, TradingRole.BUYER, 'id').cargo.parcels[0].modeOfTransport).toEqual('BIKE')
  })
})
