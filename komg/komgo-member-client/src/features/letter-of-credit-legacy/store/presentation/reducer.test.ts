import reducer from './reducer'
import { fromJS } from 'immutable'
import { LCPresentationActionType, LCPresentationAction } from './types'
import { fakePresentation, fakeDocument } from '../../utils/faker'

describe('LCPresentation reducer', () => {
  let presentation
  let document

  beforeEach(() => {
    presentation = fakePresentation()
    document = fakeDocument()
  })

  describe('defaults', () => {
    it('returns the initial state', () => {
      expect(reducer(undefined as any, { type: 'NONE' })).toMatchSnapshot()
    })
  })

  describe(LCPresentationActionType.FETCH_PRESENTATIONS_SUCCESS, () => {
    it('should store presentations in reducer when presentations are fetched', () => {
      const action: LCPresentationAction = {
        type: LCPresentationActionType.FETCH_PRESENTATIONS_SUCCESS,
        payload: { presentations: [presentation], lcReference: presentation.LCReference }
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
    it('should find presentation which is stored in reducer state', () => {
      const action: LCPresentationAction = {
        type: LCPresentationActionType.FETCH_PRESENTATIONS_SUCCESS,
        payload: { presentations: [presentation], lcReference: presentation.LCReference }
      }
      const state = reducer(undefined as any, action)
      const currentPresentation = state
        .get('byLetterOfCreditReference')
        .get(presentation.LCReference)
        .toJS()

      expect(currentPresentation[0]).toEqual(presentation)
    })
  })

  describe(LCPresentationActionType.CREATE_PRESENTATION_SUCCESS, () => {
    it('should store presentation in reducer when presentation is created', () => {
      const action: LCPresentationAction = {
        type: LCPresentationActionType.CREATE_PRESENTATION_SUCCESS,
        payload: presentation
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
    it('should find presentation when presentation is created and stored in reducer state', () => {
      const action: LCPresentationAction = {
        type: LCPresentationActionType.CREATE_PRESENTATION_SUCCESS,
        payload: presentation
      }
      const state = reducer(undefined as any, action)
      const currentPresentation = state
        .get('byLetterOfCreditReference')
        .get(presentation.LCReference)
        .toJS()

      expect(currentPresentation[0]).toEqual(presentation)
    })
  })

  describe(LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_SUCCESS, () => {
    it('should store documents when they are loaded', () => {
      const action: LCPresentationAction = {
        type: LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_SUCCESS,
        payload: [document],
        presentationId: document.context.lcPresentationStaticId
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
    it('should find documents per presentation when they are loaded and stored in reducer state', () => {
      const action: LCPresentationAction = {
        type: LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_SUCCESS,
        payload: [document],
        presentationId: document.context.lcPresentationStaticId
      }
      const state = reducer(undefined as any, action)
      const currentDocuments = state
        .get('documentsByPresentationId')
        .get(document.context.lcPresentationStaticId)
        .toJS()

      expect(currentDocuments[0]).toEqual(document)
    })
  })
})
