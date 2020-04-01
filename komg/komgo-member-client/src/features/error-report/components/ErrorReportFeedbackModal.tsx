import { Button, Modal } from 'semantic-ui-react'
import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { ApplicationState } from '../../../store/reducers'
import { LoadingTransition } from '../../../components/loading-transition'
import { apiCallRequestRegexp } from '../../../store/common/loader'
import { failureRegexp } from '../../../store/common/reducers/errors'
import { ErrorReportActionType } from '../store/types'
import { darkBlueGrey, dark } from '../../../styles/colors'

interface Props {
  isOpenFeedbackModal: boolean
  error: any
  loader: any
}

const StyledModalContent = styled(Modal.Content)`
  &&& {
    width: 100%;
    height: 350px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`

const StyledHeader = styled.span`
  font-size: 24px;
  color: ${darkBlueGrey};
  margin-bottom: 6px;
`

const StyledText = styled.p`
  width: 400px;
  text-align: center;
  color: ${dark};
`

export const ErrorReportFeedbackModal: React.SFC<Props> = ({ isOpenFeedbackModal, error, loader }: Props) => {
  const [, requestType] = apiCallRequestRegexp.exec(ErrorReportActionType.CREATE_ERROR_REPORT_REQUEST)
  const [, failureType] = failureRegexp.exec(ErrorReportActionType.CREATE_ERROR_REPORT_FAILURE)

  const isFetching = !!loader.get(requestType)
  const isError = error.get(failureType)
  const errMessage = (isError && (typeof isError === 'string' ? isError : isError.get('message'))) || null

  return (
    <Modal open={isOpenFeedbackModal} onClose={() => window.close()} size="large">
      <StyledModalContent>
        {isFetching ? (
          <LoadingTransition marginTop="0" title="Loading data" />
        ) : (
          <React.Fragment>
            <StyledHeader>{isError ? 'System error not logged' : 'System error logged'}</StyledHeader>
            {isError ? (
              <StyledText>{errMessage}</StyledText>
            ) : (
              <StyledText>
                The error you encountered has been reported successfully.  Thank you for helping us improve komgo
              </StyledText>
            )}
            <Button primary={true} content="Close window" onClick={() => window.close()} />
          </React.Fragment>
        )}
      </StyledModalContent>
    </Modal>
  )
}

const mapStateToProps = (state: ApplicationState) => ({
  isOpenFeedbackModal: state.get('errorReport').get('isOpenFeedbackModal'),
  error: state.get('errors').get('byAction'),
  loader: state.get('loader').get('requests')
})

export default compose<React.ComponentType<Partial<Props>>>(connect(mapStateToProps, null))(ErrorReportFeedbackModal)
