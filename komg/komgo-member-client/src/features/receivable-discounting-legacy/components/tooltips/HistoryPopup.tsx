import React from 'react'
import { Popup } from 'semantic-ui-react'
import { IFormattedValues } from '../../selectors/historySelectors'
import styled from 'styled-components'
import { History } from './History'
import { grey } from '../../../../styles/colors'

export interface IHistoryPopupProps {
  fieldName: string
  currentFieldValue: string
  historyValues: IFormattedValues[]
}

export const HistoryPopup: React.FC<IHistoryPopupProps> = ({ fieldName, currentFieldValue, historyValues }) => (
  <Popup
    content={<History fieldName={fieldName} history={historyValues} />}
    trigger={<Note>{currentFieldValue}</Note>}
    inverted={true}
    position={'right center'}
  />
)

const Note = styled.span`
  &&& {
    border-bottom: 1px dashed ${grey};
    padding-bottom: 3px;
  }
`
