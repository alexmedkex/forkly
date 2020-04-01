import styled from 'styled-components'
import { blueGrey, violetBlue } from '../../../../styles/colors'
import * as React from 'react'

export interface IFilterItemProps {
  filterKey: string
  title: string
  count: string
  activeKey: string
  onFilter: (key) => void
}

export const FilterItem: React.FC<IFilterItemProps> = (props: IFilterItemProps) => {
  return (
    <ItemWrap
      active={props.filterKey && props.activeKey === props.filterKey}
      onClick={() => props.onFilter(props.filterKey)}
    >
      {props.title}
      <CountWrap>({props.count})</CountWrap>
    </ItemWrap>
  )
}

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 30px;
`

export const CountWrap = styled.span`
  margin-left: 4px;
  font-weight: normal;
`

export const ItemWrap =
  styled.span <
  { active: boolean } >
  `
  text-align: center;
  margin: 0 10px;
  cursor: pointer;
  color: ${blueGrey};
  font-weight: bold;
  padding-bottom: 6px;

  &:hover {
    color: black;
  }

  ${props =>
    props.active
      ? `
        color: ${violetBlue}
        border-bottom: 2px solid ${violetBlue};
        &:hover {
          color: ${violetBlue};
        }
      `
      : ``};

`
