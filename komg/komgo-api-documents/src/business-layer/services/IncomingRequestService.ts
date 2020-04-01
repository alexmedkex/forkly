import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import * as _ from 'lodash'

import IncomingRequestDataAgent from '../../data-layer/data-agents/IncomingRequestDataAgent'
import { IIncomingRequest, IFullIncomingRequest } from '../../data-layer/models/incoming-request'
import { INote } from '../../data-layer/models/requests/INote'
import { CONFIG_KEYS } from '../../inversify/config_keys'
import { TYPES } from '../../inversify/types'
import { Note } from '../../service-layer/request/outgoing-request/Note'
import { EVENT_NAME } from '../messaging/enums'
import { DocumentRequestDismissTypeMessage } from '../messaging/messages/DocumentRequestDismissTypeMessage'
import { DocumentRequestNoteMessage, NOTE_ORIGIN } from '../messaging/messages/DocumentRequestNoteMessage'
import { RequestClient } from '../messaging/RequestClient'

@injectable()
export class IncomingRequestService {
  private readonly logger = getLogger('IncomingRequestService')

  constructor(
    @inject(CONFIG_KEYS.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.RequestClient) private readonly requestClient: RequestClient,
    @inject(TYPES.IncomingRequestDataAgent) private readonly incomingRequestDataAgent: IncomingRequestDataAgent
  ) {}

  async getById(productId: string, requestId: string): Promise<IFullIncomingRequest> {
    return this.incomingRequestDataAgent.getById(productId, requestId)
  }

  async getBareById(productId: string, requestId: string): Promise<IIncomingRequest> {
    return this.incomingRequestDataAgent.getBareById(productId, requestId)
  }

  async getAllByProduct(productId: string): Promise<IFullIncomingRequest[]> {
    return this.incomingRequestDataAgent.getAllByProduct(productId)
  }

  async sendDismissedType(productId: string, request: IIncomingRequest) {
    const dismissalMessage: DocumentRequestDismissTypeMessage = {
      context: {
        productId
      },
      data: {
        requestId: request.id,
        dismissedTypes: request.dismissedTypes
      },
      version: 1,
      messageType: EVENT_NAME.RequestDocumentsDismissedTypes
    }

    this.logger.info('Sending dismissed types message', dismissalMessage)

    await this.requestClient.sendDocumentRequestDismissType(request.companyId, dismissalMessage)
  }

  async sendNote(productId: string, request: IIncomingRequest, noteFromController: Note) {
    const { date, content } = noteFromController
    const sender = this.companyStaticId
    const note: INote = {
      date,
      sender,
      content
    }

    // avoid duplicated notes
    const notes: INote[] = request.notes || []
    if (_.find(notes, { date: note.date, content: note.content })) {
      this.logger.info(`Duplicated note, ignoring it`, {
        note: { ...note, content: '[retracted]' }
      })
      return
    }

    // persist message
    await this.incomingRequestDataAgent.findAndUpdate(productId, request.id, {
      $push: { notes: note }
    })

    // send via rabbit mq
    const recipient = request.companyId
    const noteToSend: DocumentRequestNoteMessage = {
      version: 1,
      messageType: EVENT_NAME.RequestDocumentsNote,
      context: {
        productId
      },
      data: {
        requestId: request.id,
        origin: NOTE_ORIGIN.IncomingRequest,
        note: {
          date,
          sender,
          content
        }
      }
    }
    await this.requestClient.sendDocumentRequestNote(recipient, noteToSend)
  }
}
