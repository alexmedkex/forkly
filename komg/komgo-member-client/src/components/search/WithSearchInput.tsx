import * as React from 'react'
import styled from 'styled-components'
import { SearchProps, Icon, Input } from 'semantic-ui-react'
import { blueGrey, grey } from '../../styles/colors'
import { ReactComponent as CloseIcon } from '../../styles/themes/komgo/assets/fonts/close.svg'
import { SPACES } from '@komgo/ui-components'

interface IProps {
  placeholder?: string
  render(search: string): React.ReactElement
  onSearchChange(search: string): void
}

interface IState {
  search: string
}

class WithSearchInput extends React.Component<IProps, IState> {
  static defaultProps = {
    placeholder: 'Search'
  }

  constructor(props) {
    super(props)
    this.state = {
      search: ''
    }

    this.setSearchState = this.setSearchState.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.resetSearch = this.resetSearch.bind(this)
  }

  setSearchState(newSearch: string) {
    this.setState({ search: newSearch }, () => this.props.onSearchChange(this.state.search))
  }

  handleSearch(_: React.MouseEvent<HTMLElement>, data: SearchProps) {
    this.setSearchState(data.value)
  }

  resetSearch() {
    this.setSearchState('')
  }

  render() {
    const { search } = this.state
    const { placeholder } = this.props
    return (
      <React.Fragment>
        <StyledSearch
          onChange={this.handleSearch}
          open={false}
          iconPosition="left"
          placeholder={placeholder}
          value={search}
          data-test-id="search"
        >
          <Icon name="search" />
          <input />
          {search !== '' && <StyledCloseIcon onClick={this.resetSearch} data-test-id="clear-search" />}
        </StyledSearch>
        {this.props.render(search)}
      </React.Fragment>
    )
  }
}

const StyledCloseIcon = styled(CloseIcon)`
  position: absolute;
  right: 2px;
  &:hover {
    #close-button {
      fill: ${blueGrey};
    }
  }
  #close-button {
    fill: ${grey};
  }
`

const StyledSearch = styled(Input)`
  &&& {
    width: 100%;
    input {
      padding-right: ${SPACES.LARGE} !important;
    }
    svg {
      top: 8px;
      right: 10px;
      &:hover {
        cursor: pointer;
      }
    }
  }
`

export default WithSearchInput
