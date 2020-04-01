import * as React from 'react'
import { shallow } from 'enzyme'
import SearchCheckboxes, {
  CheckboxWrapper,
  CheckboxGroupLabel,
  IProps as ISearchCheckboxesProps
} from './SearchCheckboxes'

describe('SearchCheckboxes', () => {
  const groupOptions = [
    {
      label: 'Group1',
      options: [{ name: 'ATest', value: 'Atest' }, { name: 'BTest', value: 'Btest' }]
    }
  ]

  const options = [
    { name: 'ATest', value: 'Atest' },
    { name: 'BTest', value: 'Btest' },
    { name: 'CTest', value: 'Ctest' }
  ]

  const defaultProps: ISearchCheckboxesProps = {
    itemsToShow: 8,
    name: 'Test',
    label: 'This is a test',
    onChange: jest.fn(),
    onTouched: jest.fn()
  }

  describe('Options without group', () => {
    it('should render component successfully', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={options} />)

      expect(wrapper.exists()).toBe(true)
    })

    it('should set predefined checked items', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={options} checked={['Atest']} />)

      expect(wrapper.state().checked).toEqual(['Atest'])
    })

    it('should find select all checkbox', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={options} />)

      const selectAll = wrapper.find('[data-test-id="select-all"]')

      expect(selectAll.length).toBe(1)
    })

    it('should check all when select all is clicked', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={options} />)

      const selectAll = wrapper.find('[data-test-id="select-all"]')

      selectAll.simulate('change', {}, { checked: true })

      expect(wrapper.state().checked.length).toBe(3)
    })

    it('should be disabled and not checked if number of options is 0', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={[]} />)

      const selectAll = wrapper.find('[data-test-id="select-all"]')

      expect(selectAll.props().disabled).toBe(true)
      expect(selectAll.props().checked).toBe(false)
    })

    it('should uncheck all when select all is clicked', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={options} />)
      wrapper.setState({
        checked: ['Atest']
      })

      const selectAll = wrapper.find('[data-test-id="select-all"]')

      selectAll.simulate('change', {}, { checked: false })

      expect(wrapper.state().checked.length).toBe(0)
    })

    it('should set state when handleSelect is called', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={options} />)

      const inacnce = wrapper.instance() as SearchCheckboxes

      inacnce.handleSelect({} as any, { checked: true, value: 'Atest' })

      expect(wrapper.state().checked).toEqual(['Atest'])
    })

    it('should remove from state when checkbox is unchecked', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={options} />)
      wrapper.setState({
        checked: ['Atest']
      })

      const inacnce = wrapper.instance() as SearchCheckboxes

      inacnce.handleSelect({} as any, { checked: false, value: 'Atest' })

      expect(wrapper.state().checked.length).toBe(0)
    })

    it('should filter values when search change callback is called', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={options} />)

      const instance = wrapper.instance() as SearchCheckboxes

      instance.handleSearch({} as React.MouseEvent<HTMLElement>, { value: 'Atest' })

      expect(wrapper.state().searchedOptions.length).toBe(1)
    })

    it('should find one CheckboxItems component', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={options} />)

      const checkboxItems = wrapper.find('CheckboxItems')

      expect(checkboxItems.length).toBe(1)
    })

    it('should find no result message when searchedOptions in state is empty array', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} options={options} />)
      wrapper.setState({
        searchedOptions: []
      })

      const noResults = wrapper.find('[data-test-id="no-results-message"]')

      expect(noResults.length).toBe(1)
      expect(noResults.shallow().text()).toBe('No Results')
    })

    it('should find custom no result message', () => {
      const wrapper = shallow(
        <SearchCheckboxes {...defaultProps} options={options} noResultsMessage="Custom not found message" />
      )
      wrapper.setState({
        searchedOptions: []
      })

      const noResults = wrapper.find('[data-test-id="no-results-message"]')

      expect(noResults.shallow().text()).toBe('Custom not found message')
    })
  })

  describe('Options with group', () => {
    it('should render component successfully', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} optionsGroups={groupOptions} />)

      expect(wrapper.exists()).toBe(true)
    })

    it('should find select all checkbox', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} optionsGroups={groupOptions} />)

      const selectAll = wrapper.find('[data-test-id="select-all"]')

      expect(selectAll.length).toBe(1)
    })

    it('should check all when select all is clicked', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} optionsGroups={groupOptions} />)

      const selectAll = wrapper.find('[data-test-id="select-all"]')

      selectAll.simulate('change', {}, { checked: true })

      expect(wrapper.state().checked.length).toBe(2)
    })

    it('should uncheck all when select all is clicked', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} optionsGroups={groupOptions} />)
      wrapper.setState({
        checked: ['Atest']
      })

      const selectAll = wrapper.find('[data-test-id="select-all"]')

      selectAll.simulate('change', {}, { checked: false })

      expect(wrapper.state().checked.length).toBe(0)
    })

    it('should find one CheckboxItems component', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} optionsGroups={groupOptions} />)

      const checkboxItems = wrapper.find('CheckboxItems')
      const checkboxGroupLabel = wrapper.find(CheckboxGroupLabel)

      expect(checkboxItems.length).toBe(1)
      expect(checkboxGroupLabel.length).toBe(1)
    })

    it('should set state when search is called', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} optionsGroups={groupOptions} />)

      const instance = wrapper.instance() as SearchCheckboxes

      instance.handleSearch({} as React.MouseEvent<HTMLElement>, { value: 'Atest' })
      expect(wrapper.state().searchedOptionsGroups[0].options.length).toBe(1)
    })

    it('should not find no result message', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} optionsGroups={groupOptions} />)

      const noResults = wrapper.find('[data-test-id="no-results-message"]')

      expect(noResults.length).toBe(0)
    })

    it('should find no result message when searchedOptionsGroups in state containes one item with empty array for options', () => {
      const wrapper = shallow(<SearchCheckboxes {...defaultProps} optionsGroups={groupOptions} />)
      wrapper.setState({
        searchedOptionsGroups: [
          {
            label: 'Group1',
            options: []
          }
        ]
      })

      const noResults = wrapper.find('[data-test-id="no-results-message"]')

      expect(noResults.length).toBe(1)
      expect(noResults.shallow().text()).toBe('No Results')
    })

    it('should find custom no result message', () => {
      const wrapper = shallow(
        <SearchCheckboxes {...defaultProps} optionsGroups={groupOptions} noResultsMessage="Custom not found message" />
      )
      wrapper.setState({
        searchedOptionsGroups: [
          {
            label: 'Group1',
            options: []
          }
        ]
      })

      const noResults = wrapper.find('[data-test-id="no-results-message"]')

      expect(noResults.shallow().text()).toBe('Custom not found message')
    })
  })
})
