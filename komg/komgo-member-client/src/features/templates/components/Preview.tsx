import styled from 'styled-components'
import { paleGray, SPACES } from '@komgo/ui-components'
import { media } from '../../../utils/media'

interface IProps {
  height?: string
}
export const Preview =
  styled.div <
  IProps >
  `
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background-color: ${paleGray};
  ${props => media.desktop`
    max-width: 990px;
    margin-left: auto;
    margin-right: auto;
    padding: ${SPACES.SMALL};
    height: calc(100vh - ${props.height || '98px'});
  `};
`
