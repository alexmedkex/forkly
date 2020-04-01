import styled from 'styled-components'
import { media } from '../../../utils/media'
import { paleGray, grey } from '@komgo/ui-components'

export const ViewContainer = styled.div`
  margin-top: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  overflow: auto;
  width: 100%;
  border-top: 1px solid ${grey};
  background-color: ${paleGray};
  ${(props: any) => media.desktop`
    flex-direction: row;
    height: 100%;
    overflow: none;
  `};
`
