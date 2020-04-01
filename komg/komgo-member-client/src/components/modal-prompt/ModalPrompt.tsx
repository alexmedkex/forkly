import * as React from 'react'
import { Modal } from 'semantic-ui-react'
import { LoadingTransition, ErrorMessage } from '..'

export interface IModalPromptProps {
  header: string
  open: boolean
  loading: boolean
  actions: React.ReactElement
  children?: JSX.Element | string | JSX.Element[]
  loadingTransitionTitle?: string
  error?: string
  errorTitle?: string
  size?: ModalSize
}

export enum ModalSize {
  Small = 'small',
  FullScreen = 'fullscreen',
  Large = 'large',
  Mini = 'mini',
  Tiny = 'tiny'
}

export const ModalPrompt: React.FC<IModalPromptProps> = (props: IModalPromptProps) => {
  const { open, actions, loading, error, header, loadingTransitionTitle, errorTitle, size, children } = props
  const guardedContent = content =>
    error ? (
      <ErrorMessage title={errorTitle || 'An error ocurred'} error={error} />
    ) : loading ? (
      <LoadingTransition title={loadingTransitionTitle || 'Loading...'} marginTop="0" />
    ) : (
      content || null
    )
  return (
    <Modal size={size || 'tiny'} open={open}>
      <Modal.Header>{header}</Modal.Header>
      <Modal.Content>{guardedContent(children)}</Modal.Content>
      {actions && <Modal.Actions>{actions}</Modal.Actions>}
    </Modal>
  )
}
