import { JWT } from '../../../utils/jwt-storage'
import { toast } from 'react-toastify'

import { DOCUMENTS_BASE_ENDPOINT, TRADE_FINANCE_BASE_ENDPOINT } from '../../../utils/endpoints'

import { Document, ProductId } from '../store'

export type DownloadActionWithDispatch = (documentId: string, productId: ProductId) => void

export const downloadSelectedDocuments = (
  downloadDocumentAction: DownloadActionWithDispatch,
  extSharedDocumentId?: string
) => (documents: Document[]): void => {
  for (const document of documents) {
    downloadDocumentAction(extSharedDocumentId || document.id, document.product.id)
    initiateDownload(document, extSharedDocumentId)
  }
  return
}

export function initiateDocumentsDownload(documents: Document[]) {
  for (const document of documents) {
    initiateDownload(document)
  }
  return
}

/**
 * IMPORTANT:
 * If you need file which is not from kyc, please use
 * `initiateFileDownload` since that function can accept contentUrl
 * TODO: move lc download from here to initiateFileDownload function
 */
export function initiateDownload(document: Document, extSharedDocumentId?: string) {
  const anchor = window.document.createElement('a')
  window.document.body.appendChild(anchor)
  anchor.style.display = 'none'
  const file = getFileContent(document, extSharedDocumentId) // TODO: make this generic
  const headers = new Headers()

  headers.append('Authorization', `Bearer ${JWT.token}`)

  fetch(file, { headers })
    .then(response => response.blob())
    .then(blobby => {
      const objectUrl = window.URL.createObjectURL(blobby)
      anchor.href = objectUrl
      anchor.download = `${document.name}`
      anchor.click()
      window.URL.revokeObjectURL(objectUrl)
      window.document.body.removeChild(anchor)
    })
}

function getFileContent(document: Document, extSharedDocumentId?: string) {
  if (extSharedDocumentId) {
    return `${process.env.REACT_APP_API_GATEWAY_URL}/api${DOCUMENTS_BASE_ENDPOINT}/products/${
      document.product.id
    }/ext-shared-documents/${extSharedDocumentId}/content/`
  }

  let file = `${process.env.REACT_APP_API_GATEWAY_URL}/api${DOCUMENTS_BASE_ENDPOINT}/products/${
    document.product.id
  }/documents/${document.id}/content/`

  if (document.product.id === 'tradeFinance') {
    file = `${process.env.REACT_APP_API_GATEWAY_URL}/api${TRADE_FINANCE_BASE_ENDPOINT}/lc/documents/${
      document.id
    }/content/`
  }

  return file
}

/**
 * This function should be generic without product id dependency
 * contentUrl is url for getting document content for example:
 * `${process.env.REACT_APP_API_GATEWAY_URL}/api${TRADE_FINANCE_BASE_ENDPOINT}/lc/documents/${document.id}/content/`
 */
export function initiateFileDownload(
  document: Document,
  contentUrl: string,
  onDocumentDownloaded: () => void = () => undefined
) {
  const anchor = window.document.createElement('a')
  window.document.body.appendChild(anchor)
  anchor.style.display = 'none'
  const headers = new Headers()

  headers.append('Authorization', `Bearer ${JWT.token}`)

  fetch(contentUrl, { headers })
    .then(response => response.blob())
    .then(blobby => {
      const objectUrl = window.URL.createObjectURL(blobby)
      anchor.href = objectUrl
      anchor.download = `${document.name}`
      anchor.click()
      window.URL.revokeObjectURL(objectUrl)
      window.document.body.removeChild(anchor)

      onDocumentDownloaded()
    })
}
