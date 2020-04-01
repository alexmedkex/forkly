import { DocumentRequestNoteData } from './DocumentRequestNoteData'
import { Message } from './Message'

export enum NOTE_ORIGIN {
  IncomingRequest = 'FROM_INCOMING_REQ',
  OutgoingRequest = 'FROM_OUTGOING_REQ'
}

export class DocumentRequestNoteMessage extends Message {
  context: {
    productId: string
  }

  data: {
    requestId: string
    origin: NOTE_ORIGIN
    note: DocumentRequestNoteData
  }
}
