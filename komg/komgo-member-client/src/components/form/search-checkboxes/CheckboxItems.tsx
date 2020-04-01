import * as React from 'react'
import { Checkbox, CheckboxProps } from 'semantic-ui-react'
import styled from 'styled-components'
import { ICheckboxOption } from './SearchCheckboxes'

interface IProps {
  options: ICheckboxOption[]
  checked: string[]
  handleSelect(_: React.FormEvent<HTMLInputElement>, data: CheckboxProps): void
}

const CheckboxItems: React.FC<IProps> = (props: IProps) => {
  const { options, checked, handleSelect } = props
  return (
    <React.Fragment>
      {options.map(option => (
        <CheckboxItem key={option.name}>
          <Checkbox
            data-test-id={`select-${option.name}`}
            id={option.name}
            checked={checked.includes(option.value)}
            label={option.name}
            onChange={handleSelect}
            value={option.value}
          />
          {option.info ? <Info className="grey">{option.info}</Info> : null}
        </CheckboxItem>
      ))}
    </React.Fragment>
  )
}

export const CheckboxItem = styled.div`
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
`

export const Info = styled.small`
  margin-left: 5px;
  @media (max-width: 768px) {
    display: block;
    margin-left: 0;
  }
`

export default CheckboxItems
