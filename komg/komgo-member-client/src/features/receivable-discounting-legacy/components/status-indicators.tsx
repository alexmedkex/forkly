import * as React from 'react'
import { Label } from 'semantic-ui-react'
import styled from 'styled-components'
import { sentenceCase } from '../../../utils/casings'
import {
  PARTICIPANT_RFP_STATUS_TO_COLOR,
  RD_STATUS_TO_COLOR
} from '../../receivable-finance/entities/rd/constants/status-to-color'
import { displayTradeStatus } from '../../trades/utils/displaySelectors'

interface IProps {
  status: string
}

export const RFPSummaryStatusIndicator: React.FC<IProps> = ({ status }) => {
  const color = (PARTICIPANT_RFP_STATUS_TO_COLOR as any)[status]

  const LabelWrapper = styled(Label)`
    &&& {
      background-color: ${color};
      border-color: ${color};
      color: white;
    }
  `
  return (
    <LabelWrapper as="span" data-test-id="rfp-summary-status-span">
      {sentenceCase(status)}
    </LabelWrapper>
  )
}

export const RDStatusIndicator: React.FC<IProps> = ({ status }) => {
  const color = (RD_STATUS_TO_COLOR as any)[status]

  const LabelWrapper = styled(Label)`
    &&& {
      background-color: ${color};
      border-color: ${color};
      color: white;
    }
  `
  return (
    <LabelWrapper as="span" data-test-id="rd-status-span">
      {sentenceCase(status)}
    </LabelWrapper>
  )
}

export const TopbarStatusIndicator: React.FC<IProps> = ({ status }) => {
  return (
    <>
      <p>STATUS: </p>
      <RDStatusIndicator status={displayTradeStatus(status)} />
    </>
  )
}
