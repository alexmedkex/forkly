import styled from 'styled-components'
import { media } from '../../../../utils/media'

export const ViewContainer = styled.div`
  margin-top: 2px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  height: calc(100vh - 65px);
  overflow: auto;

  ${(props: any) => media.desktop`
    flex-direction: row;
    height: auto;
    overflow: none;
  `};
`
