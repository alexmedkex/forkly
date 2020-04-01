import { ActionCreator } from 'redux'
import { DocumentActionType, ResetLoadedDocument } from '../types'

export const resetLoadedDocument: ActionCreator<ResetLoadedDocument> = () => ({
  type: DocumentActionType.RESET_LOADED_DOCUMENT
})
