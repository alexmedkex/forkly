import React from 'react'
import styled from 'styled-components'
import { IFormattedValues } from '../../selectors/historySelectors'

export interface IHistoryProps {
  fieldName: string
  history: IFormattedValues[]
}

export const History: React.FC<IHistoryProps> = ({ fieldName, history }) => (
  <PopupContents>
    <p className={'popup-heading'}>History</p>
    <hr />
    <table data-test-id="tooltipHistory">
      <tbody>
        {history.map((change, index) => (
          <tr key={`${fieldName}-${index}`}>
            <td>{change.updatedAt}</td>
            {change.values.map((value, i) => <td key={`${fieldName}-${index}-${i}`}>{value}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </PopupContents>
)

const PopupContents = styled.div`
  &&& {
    p.popup-heading {
      margin: 3px 0 0 0;
      font-weight: 600;
    }
    tbody > tr > td:nth-child(1) {
      font-weight: 600;
    }
    tbody > tr > td:nth-child(2) {
      padding-left: 15px;
    }
  }
`
