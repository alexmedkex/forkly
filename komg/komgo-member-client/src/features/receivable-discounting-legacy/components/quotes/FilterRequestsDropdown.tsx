import React from 'react'
import { DropdownProps, Dropdown } from 'semantic-ui-react'
import styled from 'styled-components'

export interface IFilterReceivablesDiscountingRequestOption {
  text: string
  content: string
  value: string
}

export interface IFilterRequestsDropdownProps {
  onChange: (data: DropdownProps) => void
  options: IFilterReceivablesDiscountingRequestOption[]
}

const FilterRequestsDropdown: React.FC<IFilterRequestsDropdownProps> = (props: IFilterRequestsDropdownProps) => (
  <StyledDiv>
    <span>Filter by:</span>
    <StyledDropdown
      selection={true}
      compact={true}
      disabled={false}
      options={props.options}
      defaultValue={props.options[0].value}
      data-test-id="filter-by-status"
      onChange={(_: React.ChangeEvent<any>, data: DropdownProps) => props.onChange(data)}
    />
  </StyledDiv>
)

export const StyledDropdown = styled(Dropdown)`
  width: 200px;
`

const StyledDiv = styled.div`
  & span {
    margin-right: 10px;
  }
`

export default FilterRequestsDropdown
