import * as React from 'react'
import { Dropdown } from 'semantic-ui-react'
import styled from 'styled-components'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import { FILTERS_NAME, Category, DocumentsFilters } from '../../../document-management/store'
import { SelectCategoryDropdown } from '../../../document-management/components/dropdowns/SelectCategoryDropdown'

interface IProps {
  filters: DocumentsFilters
  letterOfCredit: ILetterOfCredit
  categories?: Category[]
  enableSharedDropdown?: boolean
  filterDocuments(filter: string, value: string): void
}

const Filters: React.SFC<IProps> = (props: IProps) => {
  const shouldRenderParcelFilter = (): boolean => {
    const categoriesThatDoNotHaveParcel = ['trade-finance-documents', 'commercial-documents']
    return !categoriesThatDoNotHaveParcel.includes(props.filters.selectedCategoryId)
  }

  return (
    <StyledRightFilters>
      {props.categories && categoriesDropdown(props)}
      {props.enableSharedDropdown && sharedDropdown(props)}
      {shouldRenderParcelFilter() && parcelsDropdown(props)}
    </StyledRightFilters>
  )
}

const categoriesDropdown: React.SFC<IProps> = (props: IProps) => {
  return (
    <SelectCategoryDropdown
      categories={props.categories!}
      filters={props.filters}
      onCategorySelect={props.filterDocuments}
      disabled={false}
    />
  )
}

const sharedDropdown: React.SFC<IProps> = (props: IProps) => {
  const options = [
    { key: 'all', text: 'All', value: 'all' },
    { key: 'unshared', text: 'Unshared', value: 'unshared' },
    { key: 'shared', text: 'Shared', value: 'shared' }
  ]

  const handleChange = (event: React.SyntheticEvent, data: any) => {
    props.filterDocuments(FILTERS_NAME.SHARED, data.value)
  }

  return <Dropdown inline={true} options={options} defaultValue="all" button={true} onChange={handleChange} />
}

const parcelsDropdown: React.SFC<IProps> = (props: IProps) => {
  const parcels = props.letterOfCredit.tradeAndCargoSnapshot
    ? props.letterOfCredit.tradeAndCargoSnapshot.cargo.parcels
    : []

  const parcelOptions = [{ key: 'all', text: 'All Parcels', value: 'all' }]
  parcels.forEach(parcel => {
    parcelOptions.push({ key: parcel.id!, text: `Parcel ID: ${parcel.id!}`, value: parcel.id! })
  })

  const handleChange = (event: React.SyntheticEvent, data: any) => {
    props.filterDocuments(FILTERS_NAME.PARCEL, data.value)
  }
  return <Dropdown inline={true} options={parcelOptions} defaultValue="all" button={true} onChange={handleChange} />
}

const StyledRightFilters = styled.div`
  float: right;
`

export default Filters
