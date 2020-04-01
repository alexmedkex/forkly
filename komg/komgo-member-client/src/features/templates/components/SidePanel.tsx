import styled from 'styled-components'
import { paleGray, grey, SPACES } from '@komgo/ui-components'
import { media } from '../../../utils/media'

export const SidePanel = styled.div`
  width: 100%;
  background-color: ${paleGray};
  box-shadow: 0 4px 2px -2px rgba(192, 207, 222, 0.51);
  ${(props: any) => media.desktop`
    padding: ${SPACES.SMALL} 0 ${SPACES.SMALL} ${SPACES.SMALL};
    scroll-behavior: smooth;
    height: calc(100vh - 80px);
    margin: 0;
    box-shadow: none;
    width: 400px;
    max-width: 400px;
    min-width: 400px;
  `};
`

export const SidePanelInner = styled.div`
  padding: ${SPACES.SMALL};
  overflow: auto;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  border: 1px solid ${grey};
  box-shadow: 0 4px 2px -2px rgba(192, 207, 222, 0.51);
`
