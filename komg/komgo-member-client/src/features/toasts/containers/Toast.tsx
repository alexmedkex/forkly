import React from 'react'
import { cssTransition } from 'react-toastify'
import { Icon } from 'semantic-ui-react'
import styled from 'styled-components'
import { CustomCloseToastIcon } from '../../../components/custom-icon/CustomCloseToastIcon'

interface Props {
  text: string
  isError?: boolean
  closeToast(): void
}

const Toast: React.SFC<Props> = (props: Props) => {
  let checkIcon
  if (!props.isError) {
    checkIcon = <Icon name="check" data-test-id="toast-icon" />
  }
  return (
    <StyledToast>
      {checkIcon}
      <p className="Text-in-toast" data-test-id="toast-message">
        {props.text}
      </p>
      <CustomCloseToastIcon
        onClick={props.closeToast}
        data-test-id="toast-close-button"
        style={{
          position: 'absolute',
          right: '15px',
          top: '15px',
          cursor: 'pointer'
        }}
      />
    </StyledToast>
  )
}

const StyledToast = styled.button`
   {
    background-color: #1c2936 !important;
    min-height: 40px !important;
    border-radius: 2px !important;
    border: none;
    display: flex !important;
    align-items: center !important;
  }

  i.icon {
    display: flex !important;
    align-items: center !important;
    margin: 0px 5px 0px;
    color: white;
  }

  p {
    text-align: left;
  }

  .Text-in-toast {
    color: #ffffff !important;
    font-size: 14px !important;
    line-height: 21px !important;
    text-overflow: ellipsis !important;
    max-width: 33vw !important;
    padding: 10px 35px 10px 0px !important;
    font-family: LotaGrotesque;
    display: flex !important;
    align-items: center !important;
    margin: unset !important;
  }
`

const enterTimeout = 1000
const exitTimeout = 1000

export const ToastAnimation = cssTransition({
  enter: 'fadeIn',
  exit: 'fadeOut',
  duration: [enterTimeout, exitTimeout],
  appendPosition: false
})

export default Toast
