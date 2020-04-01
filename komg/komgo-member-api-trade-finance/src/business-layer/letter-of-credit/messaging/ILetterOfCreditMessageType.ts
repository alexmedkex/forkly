import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

export enum MessageType {
  LetterOfCredit = 'KOMGO.LetterOfCredit'
}

interface ILetterOfCreditMessageType {
  messageType: MessageType
}

export type ILetterOfCreditMessagePayload = ILetterOfCredit<IDataLetterOfCredit> & ILetterOfCreditMessageType

export interface ILetterOfCreditMessage {
  payload: ILetterOfCreditMessagePayload
}
