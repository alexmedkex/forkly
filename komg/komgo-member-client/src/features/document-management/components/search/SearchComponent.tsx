import * as React from 'react'
import { Search } from 'semantic-ui-react'

import * as _ from 'lodash'

interface Props {
  dataPoints: any[]
  handleSearch(results: any[]): void
}

interface State {
  isLoading: boolean
  results: any[]
  value: string
}

class SearchComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { isLoading: false, results: this.props.dataPoints, value: '' }
  }
  resetComponent = () => this.setState({ isLoading: false, results: this.props.dataPoints, value: '' })

  handleResultSelect = (e: any, obj: any) => {
    const result = obj.result
    this.setState({ value: result.name })
  }

  handleSearchChange = (e: any, obj: any) => {
    const value = obj.value
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) {
        this.resetComponent()
      }

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = (result: any) => re.test(result.name)

      this.setState({ isLoading: false, results: _.filter(this.props.dataPoints, isMatch) })
      this.props.handleSearch(_.filter(this.props.dataPoints, isMatch))
    }, 300)
  }

  render() {
    const { isLoading, results, value } = this.state
    return (
      <React.Fragment>
        <Search
          loading={isLoading}
          open={false}
          onResultSelect={this.handleResultSelect}
          onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
          results={results}
          value={value}
          {...this.props}
        />
      </React.Fragment>
    )
  }
}
export default SearchComponent
