import * as React from 'react'
import { Search, SearchProps } from 'semantic-ui-react'
import styled from 'styled-components'

interface Props {
  isLoading?: boolean
  className?: string
  value?: string
  disabled?: boolean
  handleSearch(event: React.MouseEvent<HTMLElement>, data: SearchProps): void
}

const StyledWrapper = styled.div`
  text-align: right;
  display: inline-block;
`

const StyledSearch: any = styled(Search)`
  display: inline-block;
  margin-right: 5px;
`

const CustomSearch: React.SFC<Props> = (props: Props) => {
  const { value, handleSearch, isLoading, className } = props
  return (
    <StyledWrapper className={className}>
      <StyledSearch
        loading={isLoading || false}
        onSearchChange={handleSearch}
        open={false}
        input={{ icon: 'search', iconPosition: 'left' }}
        placeholder="Search"
        value={value}
        disabled={props.disabled || false}
      />
    </StyledWrapper>
  )
}

export default CustomSearch
