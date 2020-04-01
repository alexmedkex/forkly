import styled from 'styled-components'
import { blueGrey } from '@komgo/ui-components'

interface IStatusTextStyleProps {
  width?: string
  textAlign?: string
  margin?: string
  fontSize?: string
}

export const StatusText = styled.p`
  &&& {
    color: ${blueGrey};
    font-size: ${(p: IStatusTextStyleProps) => p.fontSize || '11px'};
    font-weight: 600;
    line-height: 21px;
    width: ${(p: IStatusTextStyleProps) => p.width || 'auto'};
    text-align: ${(p: IStatusTextStyleProps) => p.textAlign || 'left'};
    margin: ${(p: IStatusTextStyleProps) => p.margin || '0 0 1rem 0'};
  }
`
