import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const ButtonLink = styled(Link)`
  &&&& {
    border: 0;
    padding: 0;
    text-decoration: underline;
    &:hover,
    :active,
    :visited,
    :focus {
      box-shadow: none !important;
    }
  }
`
