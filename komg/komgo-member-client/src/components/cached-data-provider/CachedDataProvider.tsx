import React from 'react'
import { ICacheOwnProps } from './types'
import { getItem, setItem } from '../../utils/user-storage'

export class CachedDataProvider<T extends string | object> extends React.Component<ICacheOwnProps<T>> {
  componentDidMount() {
    this.invalidate()
  }
  componentDidUpdate() {
    this.invalidate()
  }
  invalidate() {
    const { id, data } = this.props
    if (data) {
      setItem<T>(id, data)
    }
  }
  render() {
    const { children, id } = this.props
    return children({
      cached: getItem<T>(id)
    })
  }
}

export default CachedDataProvider
