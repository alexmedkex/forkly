import { Reducer } from 'redux'
import {
  LCPresentationState,
  LCPresentationAction,
  LCPresentationActionType,
  LCPresentationDocumentStatus,
  LCPresentationStatus
} from './types'
import { fromJS, Map as ImmutableMap, List } from 'immutable'
import { ILCPresentation } from '../../types/ILCPresentation'

export const initialState: LCPresentationState = fromJS({
  byLetterOfCreditReference: ImmutableMap(),
  documentsByPresentationId: ImmutableMap(),
  vaktDocuments: ImmutableMap()
})

const resolveArray = (array: any) => {
  return array || []
}

const uploadPresentationDocumentSuccessfully = (
  state: LCPresentationState = initialState,
  action: LCPresentationAction
) => {
  const documents = state.get('documentsByPresentationId').toJS()
  const { document, presentationId, lcReference } = action.payload
  const presentationsByLC = state.get('byLetterOfCreditReference').toJS()
  documents[presentationId] ? documents[presentationId].push(document) : (documents[presentationId] = [document])
  const [presentation] = presentationsByLC[lcReference].filter(presentation => presentationId === presentation.staticId)
  presentation.documents.push({
    documentId: document.id,
    documentHash: document.hash,
    status: LCPresentationDocumentStatus.Draft,
    documentTypeId: 'tradeFinance',
    dateProvided: document.registrationDate
  })
  presentationsByLC[lcReference] = presentationsByLC[lcReference].map(
    item => (presentationId === item.staticId ? presentation : item)
  )
  return state
    .set('documentsByPresentationId', fromJS(documents))
    .set('byLetterOfCreditReference', fromJS(presentationsByLC))
}

const attachVaktDocumentsSuccessfully = (state: LCPresentationState = initialState, action: LCPresentationAction) => {
  const allDocuments = state.get('documentsByPresentationId').toJS()
  const { documents, presentationId, lcReference } = action.payload
  const presentationsByLC = state.get('byLetterOfCreditReference').toJS()
  allDocuments[presentationId]
    ? (allDocuments[presentationId] = allDocuments[presentationId].concat(documents))
    : (allDocuments[presentationId] = documents)
  const [presentation] = presentationsByLC[lcReference].filter(presentation => presentationId === presentation.staticId)
  documents.forEach(doc => {
    presentation.documents.push({
      documentId: doc.id,
      documentHash: doc.hash,
      status: LCPresentationDocumentStatus.Draft,
      documentTypeId: 'tradeFinance',
      dateProvided: doc.registrationDate
    })
  })
  presentationsByLC[lcReference] = presentationsByLC[lcReference].map(
    item => (presentationId === item.staticId ? presentation : item)
  )
  return state
    .set('documentsByPresentationId', fromJS(allDocuments))
    .set('byLetterOfCreditReference', fromJS(presentationsByLC))
}

const reducer: Reducer<LCPresentationState> = (
  state: LCPresentationState = initialState,
  action: LCPresentationAction
) => {
  switch (action.type) {
    case LCPresentationActionType.FETCH_PRESENTATIONS_SUCCESS: {
      const presentations = state.get('byLetterOfCreditReference').toJS()
      return state.set(
        'byLetterOfCreditReference',
        fromJS({ ...presentations, [action.payload.lcReference]: action.payload.presentations })
      )
    }

    case LCPresentationActionType.CREATE_PRESENTATION_SUCCESS: {
      const presentations = state
        .get('byLetterOfCreditReference')
        .updateIn([action.payload.LCReference], List([]), list => list.push(action.payload))

      return state.set('byLetterOfCreditReference', presentations)
    }

    case LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_SUCCESS: {
      const data = resolveArray(action.payload)
      const documents = state.get('documentsByPresentationId').mergeDeep(fromJS({ [action.presentationId]: data }))
      return state.set('documentsByPresentationId', documents)
    }

    case LCPresentationActionType.FETCH_VAKT_DOCUMENTS_SUCCESS: {
      const data = resolveArray(action.payload)
      const vaktDocuments = state.get('vaktDocuments').toJS()
      return state.set('vaktDocuments', fromJS({ ...vaktDocuments, [action.presentationId]: data }))
    }

    case LCPresentationActionType.REMOVE_PRESENTATION_SUCCESS: {
      const documents = state.get('documentsByPresentationId').toJS()
      const presentations = state.get('byLetterOfCreditReference').toJS()
      delete documents[action.payload.presentationId]
      presentations[action.payload.lcReference] = presentations[action.payload.lcReference].filter(
        presentation => presentation.staticId !== action.payload.presentationId
      )
      return state
        .set('documentsByPresentationId', fromJS(documents))
        .set('byLetterOfCreditReference', fromJS(presentations))
    }

    case LCPresentationActionType.REMOVE_PRESENTATION_DOCUMENT_SUCCESS: {
      const documents = state.get('documentsByPresentationId').toJS()
      const presentationsByLC = state.get('byLetterOfCreditReference').toJS()
      documents[action.payload.presentationId] = documents[action.payload.presentationId].filter(
        document => document.id !== action.payload.documentId
      )
      const [presentation] = presentationsByLC[action.payload.lcReference].filter(
        presentation => action.payload.presentationId === presentation.staticId
      )
      presentation.documents = presentation.documents.filter(
        document => document.documentId !== action.payload.documentId
      )
      presentationsByLC[action.payload.lcReference] = presentationsByLC[action.payload.lcReference].map(
        item => (action.payload.presentationId === item.staticId ? presentation : item)
      )
      return state
        .set('documentsByPresentationId', fromJS(documents))
        .set('byLetterOfCreditReference', fromJS(presentationsByLC))
    }

    case LCPresentationActionType.UPLOAD_PRESENTATION_DOCUMENT_SUCCESS: {
      return uploadPresentationDocumentSuccessfully(state, action)
    }

    case LCPresentationActionType.SUBMIT_PRESENTATION_SUCCESS: {
      const newPresentation: ILCPresentation = {
        ...action.payload,
        destinationState: LCPresentationStatus.DocumentsPresented
      }
      const presentationsByLC = state.get('byLetterOfCreditReference').toJS()
      presentationsByLC[newPresentation.LCReference] = presentationsByLC[newPresentation.LCReference].map(
        item => (newPresentation.staticId === item.staticId ? newPresentation : item)
      )
      return state.set('byLetterOfCreditReference', fromJS(presentationsByLC))
    }

    case LCPresentationActionType.ATTACH_VAKT_DOCUMENTS_SUCCESS: {
      return attachVaktDocumentsSuccessfully(state, action)
    }

    default:
      return state
  }
}

export default reducer
