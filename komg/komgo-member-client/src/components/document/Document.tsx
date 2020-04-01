import * as React from 'react'

export interface DocumentProps {
  base64Content: string
  contentType?: string
}

export const Document: React.SFC<DocumentProps> = ({ base64Content, contentType = 'application/pdf' }) => (
  <iframe src={`data:${contentType};base64, ${base64Content}`} width="100%" height="700px" />
)
