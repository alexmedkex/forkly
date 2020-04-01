import * as React from 'react'
import { Accordion, Radio } from 'semantic-ui-react'
import { Field, FormikContext, connect } from 'formik'
import { PANELS } from '../TradeViewData'
import { FieldWithLabel } from '../Field'
import { CapitalizedHeader } from '../../../letter-of-credit-legacy/components/CapitalizedHeader'
import { ICreateOrUpdateTrade } from '../../store/types'
import {
  GridTextController,
  fieldColumnStyling,
  DropdownOptions,
  GridDropdownController,
  enumToDropdownOptions
} from '../../../letter-of-credit-legacy/components/InputControllers'
import { findFieldFromTradeSchema } from '../../utils/displaySelectors'
import { isErrorActive } from '../../utils/isErrorActive'
import { getFieldConfiguration } from '../../utils/getFieldConfiguration'
import BasicPanel from './../BasicPanel'
import { TRADING_ROLE_OPTIONS } from '../../constants'
import Label from '../Label'
import { Value } from '../Field'
import { sentenceCase } from '../../../../utils/casings'
import { CreditRequirementsBuyer, CreditRequirementsSeller } from '@komgo/types'
import { addMandatoryFieldNameForBuyer, addMandatoryFieldNameForSeller } from '../../utils/getFormFieldName'

export interface TradeDataOwnProps {
  initialData: ICreateOrUpdateTrade
  tradingMembersDropdownOptions: DropdownOptions[]
  tradingRole: string
  canSwitchTradingRole: boolean
  isDisabled(field: string): boolean
  switchToTradingRole(tradingRole: string, formik: FormikContext<ICreateOrUpdateTrade>): void
}

export const FieldStyling = { ...fieldColumnStyling, display: 'inherit', justifyContent: 'unset' }

const TradeData: React.FC<
  TradeDataOwnProps & {
    formik: FormikContext<ICreateOrUpdateTrade>
  }
> = ({
  formik,
  initialData,
  tradingRole,
  tradingMembersDropdownOptions,
  switchToTradingRole,
  canSwitchTradingRole,
  isDisabled
}) => {
  const isBuyerTrade = tradingRole === TRADING_ROLE_OPTIONS.BUYER
  const isSellerTrade = tradingRole === TRADING_ROLE_OPTIONS.SELLER

  return (
    <React.Fragment>
      <Accordion.Title active={true} index={PANELS.Basic}>
        <CapitalizedHeader block={true}>Trade data</CapitalizedHeader>
      </Accordion.Title>
      <Accordion.Content active={true}>
        <BasicPanel>
          {canSwitchTradingRole && (
            <div style={{ display: '-webkit-box', paddingBottom: '8px' }}>
              <Label>Your role *</Label>
              <div
                style={{ display: 'flex', flexDirection: 'column', height: '50px', justifyContent: 'space-between' }}
              >
                <Radio
                  label={sentenceCase(TRADING_ROLE_OPTIONS.BUYER)}
                  checked={tradingRole === TRADING_ROLE_OPTIONS.BUYER}
                  onClick={() => switchToTradingRole(TRADING_ROLE_OPTIONS.BUYER, formik)}
                />
                <Radio
                  label={sentenceCase(TRADING_ROLE_OPTIONS.SELLER)}
                  checked={tradingRole === TRADING_ROLE_OPTIONS.SELLER}
                  onClick={() => switchToTradingRole(TRADING_ROLE_OPTIONS.SELLER, formik)}
                />
              </div>
            </div>
          )}
          <FieldWithLabel>
            <Label>{findFieldFromTradeSchema('title', 'source')} *</Label>
            <Value style={{ fontWeight: 'bold' }}>{sentenceCase(formik.initialValues.trade.source)}</Value>
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              name="trade.buyer"
              disabled={isDisabled('trade.buyer')}
              type="text"
              error={isErrorActive('trade.buyer', formik.errors, formik.touched)}
              value={isBuyerTrade ? initialData.trade.buyer : formik.values.trade.buyer}
              fieldStyle={FieldStyling}
              component={isBuyerTrade ? GridTextController : GridDropdownController}
              options={tradingMembersDropdownOptions}
              fieldName={addMandatoryFieldNameForSeller('buyer', isBuyerTrade)}
              search={isBuyerTrade ? undefined : true}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              type="text"
              name="trade.buyerEtrmId"
              disabled={isDisabled('trade.buyerEtrmId')}
              fieldName={addMandatoryFieldNameForBuyer('buyerEtrmId', isBuyerTrade)}
              value={formik.values.trade.buyerEtrmId}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={isErrorActive('trade.buyerEtrmId', formik.errors, formik.touched)}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              name="trade.seller"
              disabled={isDisabled('trade.seller')}
              type="text"
              error={isErrorActive('trade.seller', formik.errors, formik.touched)}
              value={isSellerTrade ? initialData.trade.seller : formik.values.trade.seller}
              fieldStyle={FieldStyling}
              component={isSellerTrade ? GridTextController : GridDropdownController}
              options={tradingMembersDropdownOptions}
              fieldName={addMandatoryFieldNameForBuyer('seller', isBuyerTrade)}
              search={isSellerTrade ? undefined : true}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              type="text"
              name="trade.sellerEtrmId"
              disabled={isDisabled('trade.sellerEtrmId')}
              fieldName={addMandatoryFieldNameForSeller('sellerEtrmId', isBuyerTrade)}
              value={formik.values.trade.sellerEtrmId}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={isErrorActive('trade.sellerEtrmId', formik.errors, formik.touched)}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              name="trade.creditRequirement"
              disabled={isDisabled('trade.creditRequirement')}
              fieldStyle={FieldStyling}
              fieldName={`${findFieldFromTradeSchema('title', 'creditRequirement')} *`}
              selection={true}
              search={true}
              error={isErrorActive('trade.creditRequirement', formik.errors, formik.touched)}
              options={enumToDropdownOptions(isBuyerTrade ? CreditRequirementsBuyer : CreditRequirementsSeller)}
              component={GridDropdownController}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              name="trade.dealDate"
              disabled={isDisabled('trade.dealDate')}
              fieldName={`${findFieldFromTradeSchema('title', 'dealDate')} *`}
              error={isErrorActive('trade.dealDate', formik.errors, formik.touched)}
              type="date"
              fieldStyle={FieldStyling}
              customStyle={{ width: '175px' }}
              component={GridTextController}
              value={formik.values.trade.dealDate}
            />
          </FieldWithLabel>
        </BasicPanel>
      </Accordion.Content>
    </React.Fragment>
  )
}

export default connect<TradeDataOwnProps, ICreateOrUpdateTrade>(TradeData)
