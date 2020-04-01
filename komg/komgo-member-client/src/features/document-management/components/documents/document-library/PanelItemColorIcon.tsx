import styled from 'styled-components'

import { categoryToColor } from './categoryToColor'
interface Props {
  categoryId: string
}
export const PanelItemColorIcon = styled.div`
  height: 0.5em;
  width: 0.5em;
  background-color: ${(props: Props) => categoryToColor[props.categoryId]};
  border-radius: 2px;
  align-self: center;
`
