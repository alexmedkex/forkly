import styled from 'styled-components'
import { media } from '../../../../utils/media'

export const SidePanel = styled.div`
  flex: 1;
  padding: 20px;
  width: 100%;
  margin: 2px;
  box-shadow: 0 4px 2px -2px rgba(192, 207, 222, 0.51);
  ${(props: any) => media.desktop`
    scroll-behavior: smooth;
    height: calc(100vh - 65px);
    overflow: auto;
    margin: 0;
    box-shadow: none;
    width: 400px;
    max-width: 400px;
    min-width: 400px;
  `};
`
