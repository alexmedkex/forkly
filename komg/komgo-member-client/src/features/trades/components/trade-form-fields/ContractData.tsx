import * as React from 'react'
import { Accordion } from 'semantic-ui-react'
import { Field, FormikContext, connect } from 'formik'
import { PANELS } from '../TradeViewData'
import { FieldWithLabel } from '../Field'
import { CapitalizedHeader } from '../../../letter-of-credit-legacy/components/CapitalizedHeader'
import { ICreateOrUpdateTrade } from '../../store/types'
import {
  GridTextController,
  enumToDropdownOptions,
  GridDropdownController,
  DropdownOptions
} from '../../../letter-of-credit-legacy/components/InputControllers'
import { findFieldFromTradeSchema } from '../../utils/displaySelectors'
import { FieldStyling } from './TradeData'
import { isErrorActive } from '../../utils/isErrorActive'
import { Law, ITradeBase } from '@komgo/types'
import { getFieldConfiguration } from '../../utils/getFieldConfiguration'
import BasicPanel from './../BasicPanel'

interface IContractDataOwnProps {
  isDisabled(field: string): boolean
}

const ContractData: React.FC<
  IContractDataOwnProps & {
    formik: FormikContext<ICreateOrUpdateTrade>
  }
> = ({ isDisabled, formik: { touched, errors, values } }) => {
  // Dropdown list of Law options
  const lawDropdownOptions: DropdownOptions[] = enumToDropdownOptions(Law)
  // Put the blank option at the end of the list
  lawDropdownOptions.unshift({
    value: '',
    content: '(none)',
    text: '(none)'
  })
  return (
    <React.Fragment>
      <Accordion.Title active={true} index={PANELS.Contract}>
        <CapitalizedHeader block={true}>Contract Data</CapitalizedHeader>
      </Accordion.Title>
      <Accordion.Content active={true}>
        <BasicPanel>
          <FieldWithLabel>
            <Field
              type="text"
              name="trade.contractReference"
              disabled={isDisabled('trade.contractReference')}
              fieldName={findFieldFromTradeSchema('title', 'contractReference')}
              value={values.trade.contractReference}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={isErrorActive('trade.contractReference', errors, touched)}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              name="trade.contractDate"
              disabled={isDisabled('trade.contractDate')}
              fieldName={findFieldFromTradeSchema('title', 'contractDate')}
              error={isErrorActive('trade.contractDate', errors, touched)}
              type="date"
              fieldStyle={FieldStyling}
              customStyle={{ width: '175px' }}
              component={GridTextController}
              value={values.trade.contractDate}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              type="text"
              name="trade.generalTermsAndConditions"
              disabled={isDisabled('trade.generalTermsAndConditions')}
              fieldName={findFieldFromTradeSchema('title', 'generalTermsAndConditions')}
              value={values.trade.generalTermsAndConditions}
              fieldStyle={FieldStyling}
              component={GridTextController}
              error={isErrorActive('trade.generalTermsAndConditions', errors, touched)}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            <Field
              name="trade.law"
              disabled={isDisabled('trade.law')}
              fieldName={findFieldFromTradeSchema('title', 'law')}
              fieldStyle={FieldStyling}
              selection={true}
              search={true}
              options={lawDropdownOptions}
              component={GridDropdownController}
              value={values.trade.law}
            />
          </FieldWithLabel>
          <FieldWithLabel>
            {values.trade.law === Law.Other ? (
              <Field
                type="text"
                name="lawOther"
                disabled={isDisabled('lawOther')}
                fieldStyle={FieldStyling}
                fieldName="Other (please specify) *"
                value={values.lawOther}
                component={GridTextController}
                error={isErrorActive('lawOther', errors, touched)}
              />
            ) : (
              <Field style={{ visibility: 'hidden' }} name="hidden" />
            )}
          </FieldWithLabel>
        </BasicPanel>
      </Accordion.Content>
    </React.Fragment>
  )
}

export default connect<IContractDataOwnProps, ICreateOrUpdateTrade>(ContractData)
