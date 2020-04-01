import styled from 'styled-components'

const StyledBooleanRadio = styled.div`
  &&& {
    .field {
      display: inline-block;
      margin-right: 15px;
      margin-bottom: 0;
      label {
        display: none;
      }
      .radio {
        label {
          display: block;
        }
      }
    }
  }
`

export default StyledBooleanRadio
