import * as React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import { Search, Checkbox, CheckboxProps, Divider, SearchProps } from 'semantic-ui-react'
import { paleBlue, blueGrey } from '../../../styles/colors'
import CheckboxItems from './CheckboxItems'

const NO_RESULTS = 'No Results'

export interface ICheckboxOption {
  value: string
  name: string
  info?: string
}

export interface IChechboxOptionGroup {
  label: string
  options: ICheckboxOption[]
}

export interface IProps {
  name: string
  options?: ICheckboxOption[]
  optionsGroups?: IChechboxOptionGroup[]
  itemsToShow: number
  label?: string
  checked?: string[]
  noResultsMessage?: string
  onChange(name: string, value: string[]): void
  onTouched(name: string): void
}

interface IState {
  search: string
  checked: string[]
  searchedOptions?: ICheckboxOption[]
  searchedOptionsGroups?: IChechboxOptionGroup[]
}

class SearchCheckboxes extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      search: '',
      searchedOptions: props.options,
      searchedOptionsGroups: props.optionsGroups,
      checked: props.checked || []
    }
  }

  componentDidUpdate(prevProps: IProps) {
    if (!_.isEqual(prevProps.options, this.props.options)) {
      this.setState({
        searchedOptions: this.props.options,
        checked: [],
        search: ''
      })
    }
    if (!_.isEqual(prevProps.optionsGroups, this.props.optionsGroups)) {
      this.setState({
        searchedOptions: this.props.options,
        checked: [],
        search: ''
      })
    }
  }

  handleSearch = (_: React.MouseEvent<HTMLElement>, data: SearchProps) => {
    if (this.props.options) {
      this.handleSearchOptions(data.value)
    } else {
      this.handleSearchGroupOptions(data.value)
    }
  }

  handleSearchOptions = (search: string) => {
    const { options } = this.props
    const newSearchedOptions = search
      ? options.filter(option => option.name.toLowerCase().includes(search.toLowerCase()))
      : options
    this.setState({ search, searchedOptions: newSearchedOptions })
  }

  handleSearchGroupOptions = (search: string) => {
    const { optionsGroups } = this.props
    let newSearchedOptionsGroup = [...optionsGroups]
    if (search) {
      newSearchedOptionsGroup = optionsGroups.map(group => ({
        label: group.label,
        options: group.options.filter(option => option.name.toLowerCase().includes(search.toLowerCase()))
      }))
    }
    this.setState({ search, searchedOptionsGroups: newSearchedOptionsGroup })
  }

  getAllOptions = () => {
    const { options, optionsGroups } = this.props
    if (options) {
      return options.map(option => option.value)
    } else {
      return optionsGroups.reduce((optionsGroup, group) => {
        group.options.forEach(option => {
          optionsGroup.push(option.value)
        })
        return optionsGroup
      }, [])
    }
  }

  handleSelectAll = (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
    this.setState(
      {
        checked: data.checked ? this.getAllOptions() : []
      },
      this.handleOnChange
    )
  }

  handleSelect = (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
    const { checked } = this.state
    const newChecked = data.checked ? [...checked, data.value] : checked.filter(c => c !== data.value)
    this.setState(
      {
        checked: newChecked as string[]
      },
      this.handleOnChange
    )
  }

  handleOnChange = () => {
    this.props.onChange(this.props.name, this.state.checked)
    this.props.onTouched(this.props.name)
  }

  getNumberOfOptions = () => {
    const { options, optionsGroups } = this.props
    if (options) {
      return options.length
    }
    let numberOfOptions = 0
    optionsGroups.forEach(group => (numberOfOptions += group.options.length))
    return numberOfOptions
  }

  shouldPrintNoResultMessage = () => {
    const { options, optionsGroups } = this.props
    const { searchedOptions, searchedOptionsGroups } = this.state
    if (options && searchedOptions.length === 0) {
      return true
    } else if (optionsGroups) {
      let print = true
      searchedOptionsGroups.forEach(group => {
        if (group.options.length > 0) {
          print = false
        }
      })
      return print
    }
    return false
  }

  render() {
    const { search, checked, searchedOptions, searchedOptionsGroups } = this.state
    const { itemsToShow, label, noResultsMessage } = this.props

    return (
      <div>
        {label && <Label>{label}</Label>}
        <Wrapper data-test-id="search-checkboxes">
          <StyledSearch
            onSearchChange={this.handleSearch}
            open={false}
            input={{ icon: 'search', iconPosition: 'left' }}
            placeholder="Search"
            value={search}
            data-test-id="search-checkboxes"
          />
          <SelectAll
            data-test-id="select-all"
            id="select-all"
            checked={this.getNumberOfOptions() === checked.length && this.getNumberOfOptions() > 0}
            onChange={this.handleSelectAll}
            label="Select all"
            disabled={this.getNumberOfOptions() === 0}
          />
          <Divider />
          <CheckboxWrapper
            itemsToShow={itemsToShow}
            numberOfExistItems={this.getNumberOfOptions()}
            isGroup={searchedOptions === undefined}
          >
            {this.shouldPrintNoResultMessage() && (
              <NoResultMessage data-test-id="no-results-message">{noResultsMessage || NO_RESULTS}</NoResultMessage>
            )}
            {searchedOptions && (
              <CheckboxItems options={searchedOptions} checked={checked} handleSelect={this.handleSelect} />
            )}
            {searchedOptionsGroups &&
              searchedOptionsGroups.map(
                (group, i) =>
                  group.options.length > 0 && (
                    <CheckboxGroup key={group.label} data-test-id={`select-group-${i + 1}`}>
                      <CheckboxGroupLabel>{group.label}</CheckboxGroupLabel>
                      <CheckboxItems options={group.options} checked={checked} handleSelect={this.handleSelect} />
                    </CheckboxGroup>
                  )
              )}
          </CheckboxWrapper>
        </Wrapper>
      </div>
    )
  }
}

const Wrapper = styled.div`
  border: 1px solid ${paleBlue};
  border-radius: 3px;
  padding: 12px;
`

const StyledSearch = styled(Search)`
  &&& {
    .ui.input {
      display: flex;
    }
  }
`

export const SelectAll = styled(Checkbox)`
  &&&&& {
    margin-top: 15px;
    label {
      font-size: 12px;
      color: ${blueGrey};
    }
  }
`

const Label = styled.b`
  margin-bottom: 5px;
  display: inline-block;
`

interface ICheckboxWrapperProps {
  itemsToShow: number
  numberOfExistItems: number
  isGroup: boolean
}

export const CheckboxWrapper = styled.div`
  height: ${(props: ICheckboxWrapperProps) =>
    `${props.isGroup ? props.itemsToShow * 30 + 58 : props.itemsToShow * 30 - 12}px`};
  overflow: auto;
`

const CheckboxGroup = styled.div`
  margin-bottom: 20px;
  :last-child {
    margin-bottom: 0;
  }
`

export const CheckboxGroupLabel = styled.b`
  color: ${blueGrey};
  text-transform: uppercase;
  display: block;
  font-size: 11px;
  margin-bottom: 10px;
`

export const NoResultMessage = styled.p`
  text-align: center;
`

export default SearchCheckboxes
