import { IDocumentEventData } from './IDocumentEventData'

export interface IDocumentProcessor {
  processEvent(message: IDocumentEventData): Promise<boolean>
}
