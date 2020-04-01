import * as React from 'react'
import styled from 'styled-components'
import { Accordion, Form } from 'semantic-ui-react'
import { Field, FormikContext, connect } from 'formik'
import { PANELS } from '../TradeViewData'
import { FieldWithLabel } from '../Field'
import { CapitalizedHeader } from '../../../letter-of-credit-legacy/components/CapitalizedHeader'
import { ICreateOrUpdateTrade } from '../../store/types'

import {
  GridTextController,
  GridDropdownController,
  FormattedInputController,
  DropdownController,
  enumToDropdownOptions,
  withEmptyItem,
  WrappedFormattedInputController
} from '../../../letter-of-credit-legacy/components/InputControllers'
import { findFieldFromTradeSchema } from '../../utils/displaySelectors'
import Label from '../Label'
import { FieldStyling } from './TradeData'
import { isErrorActive } from '../../utils/isErrorActive'
import {
  InvoiceQuantity,
  PriceUnit,
  Currency,
  Commodity,
  CARGO_SCHEMA,
  PriceOption,
  PaymentTermsTimeUnit,
  PaymentTermsDayType,
  PaymentTermsWhen,
  PaymentTermsEventBase,
  PaymentTermsOption,
  ITradeBase,
  ICargoBase
} from '@komgo/types'
import { getFieldConfiguration } from '../../utils/getFieldConfiguration'
import BasicPanel from './../BasicPanel'
import { toDecimalPlaces } from '../../../../utils/field-formatters'
import { TRADING_ROLE_OPTIONS, TradingRole, emptyDropdownItem } from '../../constants'
import { addMandatoryFieldNameForBuyer } from '../../utils/getFormFieldName'
import {
  formatToStringDecimalNumberWithDefaultNull,
  numberToValueWithDefaultNull,
  formatToIntegerWithDefaultNull,
  numberToIntegerValueWithDefaultNull
} from '../../../credit-line/utils/formatters'
import { handlePaymentOptionsChange } from '../../utils/formatters'

const borderLabelStyling = {
  borderTopRightRadius: '0px',
  borderBottomRightRadius: '0px',
  height: '32px',
  paddingTop: '8px'
}

const inlineBlock = 'inline-block'
const dropdownStyling = { margin: '0', minWidth: '100px', marginLeft: '5px' }
const fieldInlineBlockStyle = { ...FieldStyling, display: inlineBlock }

export interface CommodityAndPriceOwnProps {
  initialData: ICreateOrUpdateTrade
  tradingRole: string
  isDisabled(field: string): boolean
}

const CommodityAndPrice: React.FC<CommodityAndPriceOwnProps & { formik: FormikContext<ICreateOrUpdateTrade> }> = ({
  formik,
  initialData,
  tradingRole,
  isDisabled
}) => {
  const { trade, cargo } = formik.values

  const paymentTermsIsDisabled = isDisabled('trade.paymentTerms')

  return (
    <React.Fragment>
      <Accordion.Title active={true} index={PANELS.Goods}>
        <CapitalizedHeader block={true}>Commodity and Price</CapitalizedHeader>
      </Accordion.Title>
      <Accordion.Content active={true}>
        <BasicPanel>
          <FieldWithLabel>
            <Field
              name="trade.commodity"
              disabled={isDisabled('trade.commodity')}
              fieldStyle={FieldStyling}
              fieldName={`${findFieldFromTradeSchema('title', 'commodity')} *`}
              selection={true}
              search={true}
              error={isErrorActive('trade.commodity', formik.errors, formik.touched)}
              options={enumToDropdownOptions(Commodity)}
              component={GridDropdownController}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            {trade.commodity === Commodity.Other ? (
              <Field
                type="text"
                name="commodityOther"
                disabled={isDisabled('commodityOther')}
                fieldStyle={FieldStyling}
                fieldName="Other (please specify) *"
                value={formik.values.commodityOther}
                component={GridTextController}
                error={isErrorActive('commodityOther', formik.errors, formik.touched)}
              />
            ) : (
              <Field style={{ visibility: 'hidden' }} name="hidden" />
            )}
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              type="text"
              name="cargo.grade"
              disabled={isDisabled('cargo.grade')}
              fieldName={findFieldFromTradeSchema('title', 'grade', CARGO_SCHEMA)}
              value={cargo.grade}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={isErrorActive('cargo.grade', formik.errors, formik.touched)}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              type="text"
              name="cargo.quality"
              disabled={isDisabled('cargo.quality')}
              fieldName={findFieldFromTradeSchema('title', 'quality', CARGO_SCHEMA)}
              value={cargo.quality}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={isErrorActive('cargo.quality', formik.errors, formik.touched)}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              type="text"
              name="cargo.originOfGoods"
              disabled={isDisabled('cargo.originOfGoods')}
              fieldName={findFieldFromTradeSchema('title', 'originOfGoods', CARGO_SCHEMA)}
              value={cargo.originOfGoods}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={isErrorActive('cargo.originOfGoods', formik.errors, formik.touched)}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              name="trade.invoiceQuantity"
              disabled={isDisabled('trade.invoiceQuantity')}
              fieldStyle={FieldStyling}
              fieldName={findFieldFromTradeSchema('title', 'invoiceQuantity')}
              selection={true}
              search={true}
              error={isErrorActive('trade.invoiceQuantity', formik.errors, formik.touched)}
              options={withEmptyItem(enumToDropdownOptions(InvoiceQuantity), emptyDropdownItem)}
              component={GridDropdownController}
            />
          </FieldWithLabel>
          <FieldWithLabel selectWidth={'80px'}>
            <Form.Field istyle={FieldStyling}>
              <label className="inputLabel">{findFieldFromTradeSchema('title', 'quantity')}</label>
              <Field
                type="number"
                name="trade.quantity"
                disabled={isDisabled('trade.quantity')}
                fieldName={findFieldFromTradeSchema('title', 'quantity')}
                style={{ width: '275px' }}
                component={FormattedInputController}
                formatAsString={formatToIntegerWithDefaultNull}
                toValue={numberToIntegerValueWithDefaultNull}
                error={isErrorActive('trade.quantity', formik.errors, formik.touched)}
              />
              <Field
                name="trade.priceUnit"
                disabled={isDisabled('trade.priceUnit')}
                style={{ margin: '0', marginLeft: '5px', width: '80px' }}
                selection={true}
                search={true}
                compact={true}
                options={enumToDropdownOptions(PriceUnit, true)}
                component={DropdownController}
              />
            </Form.Field>
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              type="number"
              name="trade.minTolerance"
              disabled={isDisabled('trade.minTolerance')}
              fieldName={findFieldFromTradeSchema('title', 'minTolerance')}
              value={trade.minTolerance}
              formatAsString={formatToStringDecimalNumberWithDefaultNull}
              toValue={numberToValueWithDefaultNull}
              component={WrappedFormattedInputController}
              fieldStyle={FieldStyling}
              customStyle={{ width: '175px' }}
              error={isErrorActive('trade.minTolerance', formik.errors, formik.touched)}
              label={{ basic: true, content: '%', style: borderLabelStyling, attached: 'top right' }}
              labelPosition="right"
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              type="number"
              name="trade.maxTolerance"
              disabled={isDisabled('trade.maxTolerance')}
              fieldName={findFieldFromTradeSchema('title', 'maxTolerance')}
              value={trade.maxTolerance}
              formatAsString={formatToStringDecimalNumberWithDefaultNull}
              toValue={numberToValueWithDefaultNull}
              component={WrappedFormattedInputController}
              fieldStyle={FieldStyling}
              customStyle={{ width: '175px' }}
              error={isErrorActive('trade.maxTolerance', formik.errors, formik.touched)}
              label={{ basic: true, content: '%', style: borderLabelStyling, attached: 'top right' }}
              labelPosition="right"
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              name="trade.priceOption"
              disabled={isDisabled('trade.priceOption')}
              fieldStyle={FieldStyling}
              fieldName={findFieldFromTradeSchema('title', 'priceOption')}
              selection={true}
              search={true}
              error={isErrorActive('trade.priceOption', formik.errors, formik.touched)}
              options={withEmptyItem(enumToDropdownOptions(PriceOption), emptyDropdownItem)}
              component={GridDropdownController}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              type="textarea"
              name="trade.priceFormula"
              disabled={isDisabled('trade.priceFormula')}
              fieldName={findFieldFromTradeSchema('title', 'priceFormula')}
              value={trade.priceFormula}
              fieldStyle={{
                ...FieldStyling,
                visibility: trade.priceOption === PriceOption.Floating ? 'inherit' : 'hidden'
              }}
              customStyle={{ visibility: trade.priceOption === PriceOption.Floating ? 'inherit' : 'hidden' }}
              component={GridTextController}
              error={isErrorActive('trade.priceFormula', formik.errors, formik.touched)}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Label>
              {trade.priceOption === PriceOption.Floating
                ? 'Indicative price'
                : findFieldFromTradeSchema('title', 'price')}{' '}
              per {findFieldFromTradeSchema('title', 'unit')}
            </Label>
            <Field
              name="trade.price"
              disabled={isDisabled('trade.price')}
              error={isErrorActive('trade.price', formik.errors, formik.touched)}
              formatAsString={formatToStringDecimalNumberWithDefaultNull}
              toValue={numberToValueWithDefaultNull}
              component={FormattedInputController}
              style={{ width: '275px' }}
              initialValue={initialData.trade.price}
              setFieldValue={formik.setFieldValue}
              setFieldTouched={formik.setFieldTouched}
            />
            <Field
              name="trade.currency"
              disabled={isDisabled('trade.currency')}
              style={{ margin: '0', marginLeft: '5px', width: '80px' }}
              selection={true}
              search={true}
              compact={true}
              options={enumToDropdownOptions(Currency, true)}
              component={DropdownController}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              name="trade.paymentTermsOption"
              disabled={isDisabled('trade.paymentTermsOption')}
              fieldStyle={FieldStyling}
              fieldName={findFieldFromTradeSchema('title', 'paymentTermsOption')}
              selection={true}
              search={true}
              error={isErrorActive('trade.paymentTermsOption', formik.errors, formik.touched)}
              options={withEmptyItem(enumToDropdownOptions(PaymentTermsOption), emptyDropdownItem)}
              customOnChange={(e: React.SyntheticEvent, prop) => {
                handlePaymentOptionsChange(prop.value, trade)
                formik.setFieldValue('trade.paymentTerms', trade.paymentTerms)
                formik.setFieldTouched('trade.paymentTerms', false)
                formik.setFieldTouched('trade.paymentTerms.time', true)
              }}
              component={GridDropdownController}
            />
          </FieldWithLabel>
          {trade.paymentTermsOption === PaymentTermsOption.Deferred ? (
            <>
              <MultiFieldWithOneLabel>
                <Label>{findFieldFromTradeSchema('title', 'paymentTerms')} *</Label>
                <Field
                  type="number"
                  name="trade.paymentTerms.time"
                  disabled={paymentTermsIsDisabled}
                  fieldName="paymentTerms.time"
                  component={FormattedInputController}
                  formatAsString={formatToIntegerWithDefaultNull}
                  toValue={numberToIntegerValueWithDefaultNull}
                  error={isErrorActive('trade.paymentTerms.time', formik.errors, formik.touched)}
                  style={{ width: '70px' }}
                />
                <Field
                  name="trade.paymentTerms.timeUnit"
                  disabled={paymentTermsIsDisabled}
                  style={dropdownStyling}
                  selection={true}
                  search={true}
                  compact={true}
                  options={enumToDropdownOptions(PaymentTermsTimeUnit, true)}
                  component={DropdownController}
                />
                <Field
                  name="trade.paymentTerms.dayType"
                  disabled={paymentTermsIsDisabled}
                  style={{ ...dropdownStyling, width: '143px' }}
                  selection={true}
                  search={true}
                  compact={true}
                  options={enumToDropdownOptions(PaymentTermsDayType, true)}
                  component={DropdownController}
                />
                <Field
                  name="trade.paymentTerms.when"
                  disabled={paymentTermsIsDisabled}
                  style={dropdownStyling}
                  selection={true}
                  search={true}
                  compact={true}
                  options={enumToDropdownOptions(PaymentTermsWhen, true)}
                  component={DropdownController}
                />
                <Field
                  name="trade.paymentTerms.eventBase"
                  disabled={paymentTermsIsDisabled}
                  style={{ ...dropdownStyling, width: '193px' }}
                  selection={true}
                  search={true}
                  options={enumToDropdownOptions(PaymentTermsEventBase)}
                  component={DropdownController}
                />
              </MultiFieldWithOneLabel>
              <FieldWithLabel>
                {trade.paymentTerms.eventBase === PaymentTermsEventBase.Other ? (
                  <Field
                    type="text"
                    name="eventBaseOther"
                    disabled={isDisabled('eventBaseOther')}
                    fieldStyle={FieldStyling}
                    fieldName="Other (please specify) *"
                    value={formik.values.eventBaseOther}
                    component={GridTextController}
                    error={isErrorActive('eventBaseOther', formik.errors, formik.touched)}
                  />
                ) : (
                  <Field style={{ visibility: 'hidden' }} name="hidden" />
                )}
              </FieldWithLabel>
            </>
          ) : (
            <>
              <MultiFieldWithOneLabel style={{ paddingBottom: '5px' }}>
                <Field style={{ visibility: 'hidden' }} name="hidden" />
              </MultiFieldWithOneLabel>
              <FieldWithLabel>
                <Field style={{ visibility: 'hidden' }} name="hidden" />
              </FieldWithLabel>
            </>
          )}
        </BasicPanel>
      </Accordion.Content>
    </React.Fragment>
  )
}

const MultiFieldWithOneLabel = styled.li`
  max-width: 826px;
  margin-bottom: 5px;
`

export default connect<CommodityAndPriceOwnProps, ICreateOrUpdateTrade>(CommodityAndPrice)
