import * as React from 'react'
import _ from 'lodash'
import { Order } from '../../store/common/types'
import { sortPerNumber, sortPerBoolean, sortPerString, sortPerDate } from './sorting'

interface IState<T> {
  sortedItems: T[]
  column: string
  direction: Order
}

interface SortingOption {
  [column: string]: string
}

export interface ISortableProps<T> {
  items: T[]
  column: string
  direction: Order
  handleSort(newColumn: string): void
}

const withSort = <TItems extends {}>(defaultColumn: string, defaultOrder: Order, sortingOption: SortingOption) => {
  return (Component: new (props: any) => React.Component<ISortableProps<TItems>>) => {
    return class WithSort<TProps extends { items: TItems[] }> extends React.Component<TProps, IState<TItems>, {}> {
      static getSortedItems = (column: string, direction: Order, sortedItems: TItems[]) => {
        switch (sortingOption[column]) {
          case 'string':
            return sortPerString(column, direction, sortedItems)
          case 'boolean':
            return sortPerBoolean(column, direction, sortedItems)
          case 'date':
            return sortPerDate(column, direction, sortedItems)
          default:
            return sortPerNumber(column, direction, sortedItems)
        }
      }

      constructor(props: TProps) {
        super(props)
        this.state = {
          sortedItems: WithSort.getSortedItems(defaultColumn, Order.Asc, props.items),
          column: defaultColumn,
          direction: defaultOrder
        }
      }

      componentDidUpdate(prevProps: TProps) {
        if (!_.isEqual(prevProps.items, this.props.items)) {
          this.setState({
            sortedItems: WithSort.getSortedItems(this.state.column, this.state.direction, this.props.items)
          })
        }
      }

      handleSort = (newColumn: string): void => {
        const newDirection = this.getNewDirection(newColumn)
        const { sortedItems } = this.state
        const newSortedItems = WithSort.getSortedItems(newColumn, newDirection, sortedItems)
        this.setState({
          sortedItems: newSortedItems,
          column: newColumn,
          direction: newDirection
        })
      }

      getNewDirection = (newColumn: string) => {
        const { column, direction } = this.state
        let newDirection = Order.Desc
        if (newColumn === column) {
          newDirection = direction === Order.Desc ? Order.Asc : Order.Desc
        }
        return newDirection
      }

      render() {
        const { sortedItems, column, direction } = this.state
        const sortProps: ISortableProps<TItems> = {
          items: sortedItems,
          column,
          direction,
          handleSort: this.handleSort
        }
        return <Component {...this.props} {...sortProps} />
      }
    }
  }
}

export default withSort
