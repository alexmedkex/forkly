import * as React from 'react'
import styled from 'styled-components'
import SimpleButton from '../../../../components/buttons/SimpleButton'
import { ILCPresentation } from '../../types/ILCPresentation'
interface IProps {
  presentation: ILCPresentation
  toggleAddDocumentModal(): void
  toggleAttachDocumentModal(): void
}
const AddAndAttachDocumentButtons: React.FC<IProps> = (props: IProps) => {
  const { toggleAddDocumentModal, toggleAttachDocumentModal, presentation } = props
  if (presentation.documents && presentation.documents.length > 0) {
    return (
      <React.Fragment>
        <SimpleButton onClick={toggleAddDocumentModal} type="button" style={{ padding: '0' }}>
          + Add Document
        </SimpleButton>
        <br />
        <SimpleButton onClick={toggleAttachDocumentModal} type="button" style={{ padding: '0' }}>
          + Attach VAKT document(s)
        </SimpleButton>
      </React.Fragment>
    )
  }
  return (
    <AddFirstDocument>
      <p>
        Add / attach document(s) to include in <br /> the presentation
      </p>
      <SimpleButton onClick={toggleAddDocumentModal} type="button">
        + Add Document
      </SimpleButton>
      <br />
      <SimpleButton onClick={toggleAttachDocumentModal} type="button">
        + Attach VAKT document(s)
      </SimpleButton>
    </AddFirstDocument>
  )
}
export const AddFirstDocument = styled.div`
  text-align: center;
  p {
    margin-bottom: 0.2rem;
  }
`

export default AddAndAttachDocumentButtons
