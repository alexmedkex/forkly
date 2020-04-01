import { IReceivablesDiscounting, IHistory, IHistoryChange } from '@komgo/types'
import React, { ReactNode } from 'react'
import { Popup } from 'semantic-ui-react'
import styled from 'styled-components'
import { grey } from '../../../../styles/colors'
import { Dimensions } from '../../resources/dimensions'
import { HistoryModal } from './HistoryModal'
import { StyledValue } from '../generics/StyledValue'

export interface IHistoryWrapperProps {
  value: React.ReactNode
  history: IHistory<IReceivablesDiscounting>
  buttonText: string
  header: string
  testId: string
  historyInModal?: boolean
  createHistoryContent: (props: any) => ReactNode
}

export const HistoryWrapper: React.FC<IHistoryWrapperProps> = props => {
  const { value, history, buttonText, header, historyInModal, createHistoryContent, testId } = props

  if (historyInModal) {
    return (
      <>
        <StyledValue data-test-id={testId}>{value}</StyledValue>
        <HistoryModal
          header={header}
          buttonText={buttonText}
          historyChange={history.historyEntry.comment as Array<IHistoryChange<string>>}
        />
      </>
    )
  } else {
    return (
      <Popup
        content={createHistoryContent(props)}
        trigger={<Note>{value}</Note>}
        inverted={true}
        position={'right center'}
      />
    )
  }
}

const Note = styled.p`
  &&& {
    border-bottom: 1px dashed ${grey};
    white-space: normal;
    margin-left: 20px;
    max-width: calc(100% - ${Dimensions.DiscountingRequestInfoFieldLabelWidth});
  }
`
