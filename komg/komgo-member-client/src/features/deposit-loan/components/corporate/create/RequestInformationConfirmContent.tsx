import * as React from 'react'

import { IRequestDepositLoanInformationForm } from '../../../store/types'
import { getCurrencyWithTenor } from '../../../utils/selectors'
import { createCurrencyAndPeriodObjFromString } from '../../../utils/formatters'

interface IProps {
  values: IRequestDepositLoanInformationForm
  isUpdate?: boolean
}

const RequestInformationConfirmContent: React.FC<IProps> = (props: IProps) => {
  const { isUpdate } = props
  return (
    <div>
      {!isUpdate
        ? 'Are you sure you want to send a new currency and tenor request? This will send a request to each bank selected.'
        : 'Are you sure you want to send an update currency and tenor request? This will send a request to each bank selected.'}
    </div>
  )
}

export default RequestInformationConfirmContent
