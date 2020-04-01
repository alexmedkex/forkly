import styled from 'styled-components'
import { paleGray } from '../../../../styles/colors'
import { media } from '../../../../utils/media'

export const Preview = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${paleGray};
  ${(props: any) => media.desktop`
    height: calc(100vh - 65px);
    overflow: auto;
  `};
`
