import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { DepositLoanType } from '@komgo/types'

import RequestInformationConfirmContent from './RequestInformationConfirmContent'
import { IRequestDepositLoanInformationForm } from '../../../store/types'

describe('RequestInformationConfirmContent', () => {
  it('should match snapshot', () => {
    const fakeValue: IRequestDepositLoanInformationForm = {
      type: DepositLoanType.Deposit,
      mailTo: false,
      comment: 'Test',
      requestForId: 'EUR/MONTHS/3',
      companyIds: ['123']
    }

    expect(
      renderer.create(<RequestInformationConfirmContent values={fakeValue} isUpdate={true} />).toJSON()
    ).toMatchSnapshot()
  })
})
