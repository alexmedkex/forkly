import styled from 'styled-components'

import { categoryToColor } from './categoryToColor'

export interface Props {
  categoryId: string
  borderStyle?: string
}

export const ListItemBorderLeft = styled.div`
  height: 100%;
  min-width: 3.99px;
  transform: scaleX(-1);
  background-color: ${(props: Props) => categoryToColor[props.categoryId]};
  border-radius: ${(props: Props) => (props.borderStyle ? props.borderStyle : `0 4px 4px 0;`)};
`
