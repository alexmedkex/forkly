import * as React from 'react'
import { Modal, Transition, Grid } from 'semantic-ui-react'
import styled from 'styled-components'

interface Props {
  className?: string
  open: boolean
  children?: React.ReactNode
  header(): JSX.Element
  content?(): JSX.Element
  left?(): JSX.Element
  onClose?(): void
}

export const FullpageModal: React.FC<Props> = (props: Props) => {
  return (
    <Transition duration={{ hide: 225, show: 225 }} visible={props.open}>
      <StyledFullpageModal
        size="large"
        closeOnDimmerClick={true}
        centered={true}
        open={props.open}
        onClose={props.onClose ? props.onClose : noop}
      >
        <StyledFullpageModalHeader>{props.header()}</StyledFullpageModalHeader>
        {/*TODO LS remove in document view content and pass children */}
        <StyledFullpageModalContent style={props.children ? {} : { marginTop: '16px' }}>
          {props.children ? (
            props.children
          ) : (
            <Grid divided={false}>
              <ScrollableGridColumn
                width={bodyFitsFullScreen(!props.left)}
                style={{ backgroundColor: '#f2f5f8', padding: '30px' }}
              >
                {props.content()}
              </ScrollableGridColumn>
              {props.left && (
                <Grid.Column width={6} style={{ padding: '30px' }}>
                  {props.left()}
                </Grid.Column>
              )}
            </Grid>
          )}
        </StyledFullpageModalContent>
      </StyledFullpageModal>
    </Transition>
  )
}

const bodyFitsFullScreen = (fullScreen: boolean) => {
  return fullScreen ? 16 : 10
}

const noop = () => void 0

const StyledFullpageModal = styled(Modal)`
  &&&& {
    height: 100vh;
    width: 100vw;
    top: unset;
    border-radius: 0;
  }
`

const StyledFullpageModalHeader = styled(Modal.Header)`
  &&&& {
    padding: 0;
    box-shadow: 0 4px 2px -2px rgba(192, 207, 222, 0.51);
  }
`

const StyledFullpageModalContent = styled(Modal.Content)`
  &&&& {
    padding: 0;
  }
`

const ScrollableGridColumn = styled(Grid.Column)`
  &&&&{
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh
    overflow-y: auto;
  }
`
