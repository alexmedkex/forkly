import { css } from 'glamor'
import React from 'react'
import { toast } from 'react-toastify'
import { ToastContainerIds, ToastIds } from '../../utils/toast'
import Toast, { ToastAnimation } from './containers/Toast'

export enum TOAST_TYPE {
  Ok = 0,
  Error = 1
}

export const displayToast = (msg: string, status: TOAST_TYPE = TOAST_TYPE.Ok) => {
  const closeTimeoutMs = 5000
  if (toast.isActive(ToastIds.CustomToast)) {
    toast.update(ToastIds.CustomToast, {
      render: <Toast text={msg} closeToast={() => undefined} />,
      autoClose: closeTimeoutMs,
      containerId: ToastContainerIds.Custom
    })
  } else {
    toast(<Toast text={msg} closeToast={() => undefined} isError={!!status.valueOf()} />, {
      className: css({
        background: '#1c2936',
        padding: '0px !important',
        minHeight: '0px !important',
        marginBottom: 'unset !important'
      }),
      position: toast.POSITION.BOTTOM_LEFT,
      hideProgressBar: true,
      autoClose: closeTimeoutMs,
      transition: ToastAnimation,
      closeOnClick: false,
      draggable: false,
      toastId: ToastIds.CustomToast,
      containerId: ToastContainerIds.Custom
    })
  }
}
