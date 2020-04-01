import { FieldType } from '../../../FieldTypes'
import { EVENT_NAME, FEEDBACK_STATUS } from '../enums'

import { DocumentRequestMessage } from '.'
import { DocumentFeedbackMessage } from './DocumentFeedbackMessage'
import { DocumentRequestDismissTypeMessage } from './DocumentRequestDismissTypeMessage'
import { DocumentRequestNoteMessage, NOTE_ORIGIN } from './DocumentRequestNoteMessage'
import { SendDocumentsMessage } from './SendDocumentsMessage'

export const FILE_DATA = Buffer.from('BUIDL', 'utf8')
export const FILE_DATA_BASE64 = FILE_DATA.toString('base64')
export const MESSAGES_REGISTRATION_DATE = new Date(0)

const PRODUCT_ID = 'product-id'
const SUBPRODUCT_ID = 'subproduct-id'
const CATEGORY_ID = 'category-id'
const TYPE_ID = 'type-id'
export const FIELD_ID = 'field-id'
const DOCUMENT_ID = 'document-id'
const FILE_ID = 'file-id'
const REQUEST_ID = 'request-id'
const COMPANY_ID = 'company-id'
export const SHARE_ID = 'shared-documents-id'

export const CONTENT_TYPE = 'text/plain'

export function documentRequestMessage(): DocumentRequestMessage {
  return {
    version: 1,
    messageType: EVENT_NAME.RequestDocuments,
    context: {
      productId: PRODUCT_ID
    },
    data: {
      requestId: REQUEST_ID,
      companyId: COMPANY_ID,
      types: [
        {
          id: TYPE_ID,
          productId: PRODUCT_ID,
          categoryId: CATEGORY_ID,
          name: 'type-name',
          fields: [
            {
              id: FIELD_ID,
              name: 'field-name',
              type: FieldType.STRING,
              isArray: false
            }
          ],
          predefined: false
        }
      ]
    }
  }
}

export function sendDocumentsMessage(): SendDocumentsMessage {
  const wildcardName = 'Hidden'
  return {
    version: 1,
    messageType: EVENT_NAME.SendDocuments,
    context: {
      productId: PRODUCT_ID,
      requestId: REQUEST_ID
    },
    data: {
      context: undefined,
      shareId: SHARE_ID,
      documents: [
        {
          id: DOCUMENT_ID,
          context: {
            subProductId: SUBPRODUCT_ID
          },
          productId: PRODUCT_ID,
          categoryId: CATEGORY_ID,
          typeId: TYPE_ID,
          name: 'document-name',
          owner: {
            firstName: wildcardName,
            lastName: wildcardName,
            companyId: COMPANY_ID
          },
          metadata: [
            {
              name: 'key',
              value: 'value'
            }
          ],
          hash: 'merkle-hash',
          contentHash: 'content-hash',
          komgoStamp: false,
          registrationDate: MESSAGES_REGISTRATION_DATE,
          content: {
            id: FILE_ID,
            data: FILE_DATA_BASE64,
            contentType: CONTENT_TYPE,
            signature: 'signature'
          },
          notes: ''
        }
      ]
    }
  }
}

export function documentFeedbackMessage(status: FEEDBACK_STATUS): DocumentFeedbackMessage {
  return {
    version: 1,
    messageType: EVENT_NAME.SendDocumentFeedback,
    context: {
      productId: PRODUCT_ID
    },
    data: {
      requestId: REQUEST_ID,
      documents: [
        {
          id: DOCUMENT_ID,
          status,
          notes: '',
          newVersionRequested: false
        }
      ]
    }
  }
}

export function documentRequestDismissTypeMessage(
  content = 'this is a dimissed type message'
): DocumentRequestDismissTypeMessage {
  return {
    version: 1,
    messageType: EVENT_NAME.RequestDocumentsDismissedTypes,
    context: {
      productId: PRODUCT_ID
    },

    data: {
      requestId: REQUEST_ID,
      dismissedTypes: [
        {
          typeId: TYPE_ID,
          content,
          date: new Date(0)
        }
      ]
    }
  }
}

export function documentRequestNoteMessage(
  origin: NOTE_ORIGIN = NOTE_ORIGIN.IncomingRequest,
  content = 'this is a note'
): DocumentRequestNoteMessage {
  return {
    version: 1,
    messageType: EVENT_NAME.RequestDocumentsNote,
    context: {
      productId: PRODUCT_ID
    },
    data: {
      requestId: REQUEST_ID,
      origin,
      note: {
        date: new Date(0),
        sender: COMPANY_ID,
        content
      }
    }
  }
}
