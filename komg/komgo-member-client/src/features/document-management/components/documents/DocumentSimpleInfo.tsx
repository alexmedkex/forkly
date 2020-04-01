import * as React from 'react'
import styled from 'styled-components'
import { SPACES } from '@komgo/ui-components'

import { Document } from '../../store/types'
import EvaluationInfoTable from '../../../review-documents/containers/evaluation/EvaluationInfoTable'
import { paleBlue } from '../../../../styles/colors'
import { truncate } from '../../../../utils/casings'

interface Props {
  document: Document
}

const HeaderWrapper = styled.div`
  border-bottom: 1px solid ${paleBlue};
  padding-bottom: ${SPACES.SMALL};
`

const DocumentSimpleInfo: React.FC<Props> = (props: Props) => {
  const { document } = props
  const charactersToTruncate = 84
  return (
    <div>
      <HeaderWrapper>
        <h2>{truncate(document.name, charactersToTruncate)}</h2>
      </HeaderWrapper>
      <EvaluationInfoTable type={document.type.name} title={document.name} expiry={document.registrationDate} />
    </div>
  )
}

export default DocumentSimpleInfo
