import styled from 'styled-components'

export const LightHeaderWrapper = styled.div`
  h3 {
    margin-bottom: 0px;
  }
  p {
    font-style: italic;
    width: 80%;
  }
`

export const BoldHeaderWrapper = styled(LightHeaderWrapper)`
  &&&& {
    h3 {
      font-weight: bold;
    }
  }
`
