import * as React from 'react'
import { Accordion } from 'semantic-ui-react'
import { Field, FormikContext, connect } from 'formik'
import { PANELS } from '../TradeViewData'
import { FieldWithLabel } from '../Field'
import { CapitalizedHeader } from '../../../letter-of-credit-legacy/components/CapitalizedHeader'
import { ICreateOrUpdateTrade } from '../../store/types'
import {
  GridTextController,
  GridDropdownController,
  enumToDropdownOptions,
  withEmptyItem
} from '../../../letter-of-credit-legacy/components/InputControllers'
import { findFieldFromTradeSchema } from '../../utils/displaySelectors'
import { FieldStyling } from './TradeData'
import { isErrorActive } from '../../utils/isErrorActive'
import { DeliveryTerms as DeliveryTermsEnum, CARGO_SCHEMA, IParcel, ITradeBase, ICargoBase } from '@komgo/types'
import { getFieldConfiguration } from '../../utils/getFieldConfiguration'
import BasicPanel from './../BasicPanel'
import ParcelData, { IParcelWithOverrides } from '../cargo-form-fields/ParcelData'
import SimpleButton from '../../../../components/buttons/SimpleButton'
import { generateInitialParcelData, TRADING_ROLE_OPTIONS, emptyDropdownItem } from '../../constants'
import Label from '../Label'
import { addMandatoryFieldNameForBuyer } from '../../utils/getFormFieldName'

const cargoParcels = 'cargo.parcels'

export interface IDeliveryTermsOwnProps {
  tradingRole: string
  isDisabled(field: string): boolean
}

export class DeliveryTerms extends React.Component<
  IDeliveryTermsOwnProps & { formik: FormikContext<ICreateOrUpdateTrade> }
> {
  constructor(props) {
    super(props)
  }

  removeParcel = (idx: number) => {
    const { formik } = this.props
    const newParcels = formik.values.cargo.parcels.filter((_, i) => idx !== i)
    formik.setFieldValue(cargoParcels, newParcels)
  }

  addParcel = () => {
    this.props.formik.setFieldValue(cargoParcels, [
      ...this.props.formik.values.cargo.parcels,
      generateInitialParcelData()
    ])
  }

  updateParcel = (updatedParcel: IParcel, idx: number) => {
    const { formik } = this.props
    formik.setFieldValue(
      cargoParcels,
      formik.values.cargo.parcels.map((parcel, i) => (idx === i ? updatedParcel : parcel))
    )
  }

  render() {
    const { formik, isDisabled } = this.props
    const { trade } = formik.values

    return (
      <React.Fragment>
        <Accordion.Title active={true} index={PANELS.Terms}>
          <CapitalizedHeader block={true}>Delivery Terms</CapitalizedHeader>
        </Accordion.Title>
        <Accordion.Content active={true}>
          <BasicPanel>
            <FieldWithLabel>
              <Field
                name="trade.deliveryPeriod.startDate"
                disabled={isDisabled('trade.deliveryPeriod')}
                fieldName={findFieldFromTradeSchema('title', 'deliveryPeriod.properties.startDate')}
                error={isErrorActive('trade.deliveryPeriod.startDate', formik.errors, formik.touched)}
                type="date"
                fieldStyle={FieldStyling}
                component={GridTextController}
                customStyle={{ width: '175px' }}
                value={trade.deliveryPeriod.startDate}
              />
            </FieldWithLabel>
            <FieldWithLabel>
              <Field
                name="trade.deliveryPeriod.endDate"
                disabled={isDisabled('trade.deliveryPeriod')}
                fieldName={findFieldFromTradeSchema('title', 'deliveryPeriod.properties.endDate')}
                error={isErrorActive('trade.deliveryPeriod.endDate', formik.errors, formik.touched)}
                type="date"
                fieldStyle={FieldStyling}
                component={GridTextController}
                customStyle={{ width: '175px' }}
                value={trade.deliveryPeriod.endDate}
              />
            </FieldWithLabel>
            <FieldWithLabel>
              <Field
                name="trade.deliveryTerms"
                disabled={isDisabled('trade.deliveryTerms')}
                fieldStyle={FieldStyling}
                fieldName={findFieldFromTradeSchema('title', 'deliveryTerms')}
                selection={true}
                search={true}
                error={isErrorActive('trade.deliveryTerms', formik.errors, formik.touched)}
                options={withEmptyItem(enumToDropdownOptions(DeliveryTermsEnum), emptyDropdownItem)}
                component={GridDropdownController}
              />
            </FieldWithLabel>
            <FieldWithLabel>
              {formik.values.trade.deliveryTerms === DeliveryTermsEnum.Other ? (
                <Field
                  type="text"
                  name="deliveryTermsOther"
                  disabled={isDisabled('deliveryTermsOther')}
                  fieldStyle={FieldStyling}
                  fieldName="Other (please specify) *"
                  value={formik.values.deliveryTermsOther}
                  component={GridTextController}
                  error={isErrorActive('deliveryTermsOther', formik.errors, formik.touched)}
                />
              ) : (
                <Field style={{ visibility: 'hidden' }} name="hidden" />
              )}
            </FieldWithLabel>
            <FieldWithLabel>
              <Field
                type="text"
                name="trade.deliveryLocation"
                disabled={isDisabled('trade.deliveryLocation')}
                fieldName={findFieldFromTradeSchema('title', 'deliveryLocation')}
                value={formik.values.trade.deliveryLocation}
                fieldStyle={FieldStyling}
                component={GridTextController}
                error={isErrorActive('trade.deliveryLocation', formik.errors, formik.touched)}
              />
            </FieldWithLabel>
            {/*
              // NOTE: Temporary hide cargoId since it is currently autogenerated (uuid)
              <FieldWithLabel>
              <Field
                type="text"
                name="cargo.cargoId"
                disabled={formik.initialValues.cargo.cargoId !== '' || isDisabled('cargo.cargoId')}
                fieldName={addMandatoryFieldNameForBuyer(
                  'cargoId',
                  this.props.tradingRole === TRADING_ROLE_OPTIONS.BUYER,
                  CARGO_SCHEMA
                )}
                value={formik.values.cargo.cargoId}
                fieldStyle={FieldStyling}
                component={GridTextController}
                error={isErrorActive('cargo.cargoId', formik.errors, formik.touched)}
                configuration={getFieldConfiguration(findFieldFromSchema('description', 'cargoId', CARGO_SCHEMA))}
              />
                </FieldWithLabel>*/}

            <div style={{ display: 'flex', paddingTop: '8px' }}>
              <Label>Parcels</Label>
              <div style={{ flexGrow: 1, maxWidth: '830px' }}>
                {formik.values.cargo.parcels.map((parcel, idx) => (
                  <ParcelData
                    dataTestId={`parcelForm-${idx}`}
                    key={parcel._id ? parcel._id : (parcel as IParcelWithOverrides).uniqueKey}
                    initialParcelData={parcel}
                    removeParcel={() => this.removeParcel(idx)}
                    onChange={(changedParcel: IParcel) => this.updateParcel(changedParcel, idx)}
                    submitCount={formik.submitCount}
                    tradingRole={this.props.tradingRole}
                  />
                ))}
                <SimpleButton type="button" onClick={this.addParcel} data-test-id="addParcel">
                  + Add new parcel
                </SimpleButton>
              </div>
            </div>
          </BasicPanel>
        </Accordion.Content>
      </React.Fragment>
    )
  }
}

export default connect<IDeliveryTermsOwnProps, ICreateOrUpdateTrade>(DeliveryTerms)
