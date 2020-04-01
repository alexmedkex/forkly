import React from 'react'
import { render } from '@testing-library/react'
import { IHistoryModalProps, HistoryModal } from './HistoryModal'

describe('HistoryModal', () => {
  let testProps: IHistoryModalProps
  beforeEach(() => {
    testProps = {
      header: 'my header',
      buttonText: 'my button text',
      historyChange: [
        { updatedAt: new Date().toISOString(), value: 'my value 0' },
        { updatedAt: new Date().toISOString(), value: 'my value 1' },
        { updatedAt: new Date().toISOString(), value: 'my value 2' }
      ]
    }
  })

  it('should render correctly', () => {
    expect(render(<HistoryModal {...testProps} />).asFragment()).toMatchSnapshot()
  })
})
