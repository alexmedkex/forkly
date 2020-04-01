import { useState, useEffect } from 'react'

import { Document } from '../../../store'

export interface Props {
  disabled: boolean
  attachedDocument: Document
}
export const useAttachDocumentDropdownState = (props: Props) => {
  const { attachedDocument, disabled } = props
  const [dropdownDisabled, setDropdownDisabled] = useState(disabled)

  useEffect(
    () => {
      function setDisabledStateByAttachedFormState() {
        setDropdownDisabled(attachedDocument && attachedDocument.state === 'PENDING')
      }
      setDisabledStateByAttachedFormState()
    },
    [props.attachedDocument]
  )

  return dropdownDisabled
}
