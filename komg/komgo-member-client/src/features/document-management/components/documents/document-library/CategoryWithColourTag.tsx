import * as React from 'react'
import styled from 'styled-components'
import { PanelItemColorIcon } from './PanelItemColorIcon'
import { Category } from '../../../store'

interface CategoryProps {
  category: Category
  style?: any
}

export const CategoryWithColourTag: React.SFC<CategoryProps> = (props: CategoryProps) => (
  <>
    <PanelItemColorIcon categoryId={props.category.id} />
    <CategoryName style={props.style}>{props.category.name}</CategoryName>
  </>
)

const CategoryName = styled.div`
  margin: 0 8px;
  color: black;
  font-size: 11px;
  font-weight: 600;
  line-height: 21px;
  text-transform: uppercase;
`
