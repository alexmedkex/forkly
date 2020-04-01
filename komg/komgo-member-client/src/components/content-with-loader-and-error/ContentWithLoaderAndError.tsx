import * as React from 'react'
import { LoadingTransition, LoadingTransitionProps } from '../loading-transition/LoadingTransition'
import { ErrorMessage, ErrorMessageProps } from '../error-message/ErrorMessage'
import { ServerError } from '../../store/common/types'

interface IProps {
  isLoading: boolean
  loadingProps: LoadingTransitionProps
  errors: ServerError[]
  errorTitle?: string
  children: React.ReactChild
}

const ContentWithLoaderAndError: React.FC<IProps> = (props: IProps) => {
  const { isLoading, loadingProps, errors, errorTitle, children } = props
  if (isLoading) {
    return <LoadingTransition {...loadingProps} />
  } else if (errors && errors.length > 0) {
    return <ErrorMessage title={errorTitle || 'Error'} error={errors[0].message} />
  }
  return <React.Fragment>{children}</React.Fragment>
}

export default ContentWithLoaderAndError
