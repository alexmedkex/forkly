import * as React from 'react'
import { IMember } from '../../../../members/store/types'
import { dictionary } from '../../../dictionary'
import { CreditLineType } from '../../../store/types'

interface IProps {
  member: IMember
  isUpdate?: boolean
  feature: CreditLineType
}

const RequestInformationConfirmContent: React.FC<IProps> = (props: IProps) => {
  const { isUpdate, feature } = props
  return (
    <div>
      Are you sure you want to send an {!isUpdate ? 'new' : 'update'}{' '}
      {dictionary[feature].financialInstitution.createOrEdit.counterpartyRole} request? This will send a request to each
      bank selected.
    </div>
  )
}

export default RequestInformationConfirmContent
