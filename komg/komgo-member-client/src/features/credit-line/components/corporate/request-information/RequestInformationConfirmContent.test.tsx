import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { fakeMember } from '../../../../letter-of-credit-legacy/utils/faker'
import RequestInformationConfirmContent from './RequestInformationConfirmContent'
import { CreditLineType } from '../../../store/types'

describe('SubmitConfirm', () => {
  const defaultProps = {
    member: fakeMember({ commonName: 'Member1' }),
    isUpdate: true,
    feature: CreditLineType.BankLine
  }

  it('should match snapshot', () => {
    expect(renderer.create(<RequestInformationConfirmContent {...defaultProps} />).toJSON()).toMatchSnapshot()
  })
})
