import * as React from 'react'
import { mount } from 'enzyme'
import * as renderer from 'react-test-renderer'
import DeliveryTerms, { IDeliveryTermsOwnProps } from './DeliveryTerms'
import { initialParcelData, TRADING_ROLE_OPTIONS } from '../../constants'
import { FormikContext, FormikProvider } from 'formik'
import { ICreateOrUpdateTrade } from '../../store/types'
import { fakeFormikContext } from '../../../../store/common/faker'
import {
  buildFakeTrade,
  buildFakeCargo,
  buildFakeParcel,
  DeliveryTerms as DeliveryTermsEnum,
  ModeOfTransport,
  PARCEL_SCHEMA_VERSION,
  CARGO_SCHEMA_VERSION,
  TRADE_SCHEMA_VERSION
} from '@komgo/types'
import { v4 } from 'uuid'
import { Button } from 'semantic-ui-react'

describe('DeliveryTerms component', () => {
  let formikContext: FormikContext<ICreateOrUpdateTrade>
  let setFieldValue: jest.Mock
  let testProps: IDeliveryTermsOwnProps
  beforeEach(() => {
    setFieldValue = jest.fn()
    testProps = {
      isDisabled: () => false,
      tradingRole: TRADING_ROLE_OPTIONS.BUYER
    }
    formikContext = fakeFormikContext<ICreateOrUpdateTrade>(
      {
        trade: buildFakeTrade({
          deliveryPeriod: { startDate: '2016-11-11', endDate: '2019-06-19' },
          deliveryTerms: DeliveryTermsEnum.EXW,
          deliveryLocation: 'MY_DELIVERY_LOCATION',
          version: TRADE_SCHEMA_VERSION.V2
        }),
        cargo: buildFakeCargo({
          cargoId: 'MY_CARGOID',
          version: CARGO_SCHEMA_VERSION.V2,
          parcels: [
            {
              ...buildFakeParcel({
                id: 'MY_ID',
                destinationPlace: 'MY_DESTINATION_PLACE',
                loadingPlace: 'MY_LOADING_PLACE',
                deemedBLDate: '2019-01-03',
                quantity: 1,
                modeOfTransport: ModeOfTransport.Vessel,
                version: PARCEL_SCHEMA_VERSION.V2
              }),
              laycanPeriod: { startDate: '2015-12-04', endDate: '2019-06-19' },
              inspector: 'MY_INSPECTOR',
              quantity: 13,
              vesselIMO: 44,
              vesselName: 'MY_VESSEL_NAME'
            }
          ]
        }),
        documents: []
      },
      { setFieldValue }
    )
  })

  it('should match snapshot when seller', () => {
    const tree = renderer
      .create(
        <FormikProvider value={formikContext}>
          <DeliveryTerms {...testProps} tradingRole={TRADING_ROLE_OPTIONS.SELLER} />
        </FormikProvider>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match snapshot', () => {
    const tree = renderer
      .create(
        <FormikProvider value={formikContext}>
          <DeliveryTerms {...testProps} />
        </FormikProvider>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should add a parcel with a "uniqueKey" when button is clicked', () => {
    const wrapper = mount(
      <FormikProvider value={formikContext}>
        <DeliveryTerms {...testProps} />
      </FormikProvider>
    )

    wrapper.find('button[data-test-id="addParcel"]').simulate('click')
    expect(setFieldValue).toHaveBeenCalledWith('cargo.parcels', [
      ...formikContext.values.cargo.parcels,
      expect.objectContaining(initialParcelData)
    ])
  })

  it('should remove parcel if parcel close icon is pressed', () => {
    const wrapper = mount(
      <FormikProvider value={formikContext}>
        <DeliveryTerms {...testProps} />
      </FormikProvider>
    )

    wrapper.find('i[data-test-id="parcelForm-0-removeParcel"]').simulate('click')

    wrapper
      .find(Button)
      .find({ content: 'Confirm' })
      .simulate('click')

    expect(setFieldValue).toHaveBeenCalledWith('cargo.parcels', [])
  })

  it('should update the right parcel if parcel is edited', () => {
    const formikContext = fakeFormikContext<ICreateOrUpdateTrade>(
      {
        cargo: buildFakeCargo({
          parcels: [buildFakeParcel({ id: 'a' }), buildFakeParcel({ id: 'b' }), buildFakeParcel({ id: 'c' })]
        }),
        trade: buildFakeTrade(),
        documents: []
      },
      { setFieldValue }
    )

    const wrapper = mount(
      <FormikProvider value={formikContext}>
        <DeliveryTerms {...testProps} />
      </FormikProvider>
    )

    const value = v4()

    wrapper
      .find('input[name="id"]')
      .at(1)
      .simulate('change', { target: { value, name: 'id' } })

    expect(setFieldValue).toHaveBeenCalledWith('cargo.parcels', [
      formikContext.values.cargo.parcels[0],
      {
        ...formikContext.values.cargo.parcels[1],
        id: value
      },
      formikContext.values.cargo.parcels[2]
    ])
  })
})
