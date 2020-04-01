import * as React from 'react'
import { Dropdown } from 'semantic-ui-react'

import { truncate } from '../../../../utils/casings'
import { FILTERS_NAME, DocumentsFilters } from '../../store'
import { Counterparty } from '../../../counterparties/store/types'

export interface Props {
  counterparties: Counterparty[]
  filters: DocumentsFilters
  disabled: boolean
  onCounterpartySelect(filter: string, value: string): void
}

export const SelectCounterpartyDropdown = (props: Props) => {
  return (
    <>
      <span>{getSharedWithText(props.filters[FILTERS_NAME.COUNTERPARTY])}</span>
      <Dropdown
        inline={true}
        onChange={(e: React.SyntheticEvent, { value }: any) => {
          props.onCounterpartySelect(FILTERS_NAME.COUNTERPARTY, value)
        }}
        options={counterpartiesToOptionsWithDefaults(props.counterparties)}
        defaultValue={props.filters.selectedCounterparty || 'all_documents'}
        value={props.filters.selectedCounterparty || 'all_documents'}
        button={true}
        disabled={props.disabled}
      />
    </>
  )
}

export const counterpartiesToOptionsWithDefaults = (counterparties: Counterparty[]) => {
  const defaultOptions = [
    {
      key: 'all_documents',
      text: 'All documents',
      value: 'all_documents',
      content: 'All documents'
    }
  ]

  return counterparties.reduce((acc, counterparty) => {
    const counterpartyOption = {
      key: counterparty.staticId,
      text: truncate(counterparty.x500Name.CN, 14),
      value: counterparty.staticId,
      content: counterparty.x500Name.CN
    }
    return [...acc, counterpartyOption]
  }, counterparties.length ? [...defaultOptions, <Dropdown.Divider key="tslint-super-useful" />, <Dropdown.Header key="sharedwith-label">Shared With</Dropdown.Header>] : defaultOptions)
}

export const getSharedWithText = (sharedCounterparty: string): string => {
  if (sharedCounterparty === 'none' || sharedCounterparty === '' || sharedCounterparty === 'all_documents') {
    return ''
  }
  return 'Shared with '
}
