import * as React from 'react'
import { Provider } from 'react-redux'
import { shallow } from 'enzyme'
import immutable from 'immutable'

import { makeTestStore } from '../../../utils/test-helpers'
import { fakeDocument } from '../utils/faker'
import withDocumentsByCategoryId from './withDocumentsByCategoryId'
import { Document, DocumentActionType } from '../store'
import { pickDocumentCategoryId } from '../utils/pickers'
import { onlyRegisteredDocuments } from '../utils/selectors'

interface MockComponentProps {
  documentsByCategoryId: Map<string, Set<Document>>
}
const DocumentsByCategoryLists: React.FunctionComponent<MockComponentProps> = (props: MockComponentProps) => {
  return (
    <>
      {Array.from(props.documentsByCategoryId.keys()).map(categoryId => {
        return (
          <ul key={categoryId}>
            {Array.from(props.documentsByCategoryId.get(categoryId)).map(doc => {
              return <li key={doc.id}>{doc.state}</li>
            })}
          </ul>
        )
      })}
    </>
  )
}

describe('withDocumentsByCategoryId', () => {
  let store = makeTestStore()

  const Connected = withDocumentsByCategoryId(DocumentsByCategoryLists)

  const addDocuments = (documents: Document[]) => {
    const fetchDocsSuccess = {
      type: DocumentActionType.FETCH_DOCUMENTS_SUCCESS,
      payload: documents
    }
    store.dispatch(fetchDocsSuccess)
  }

  const setDocumentRegistered = (doc: Document) => {
    const setRegistered = {
      type: DocumentActionType.SHOW_DOCUMENT_REGISTERED_SUCCESS,
      payload: {
        id: doc.id,
        name: doc.name,
        state: 'REGISTERED'
      }
    }
    store.dispatch(setRegistered)
  }

  beforeEach(() => {
    store = makeTestStore()
  }, 3000)

  it('store setup works as expexted', () => {
    const docs = [1, 2, 3].map(toString).map(id => fakeDocument({ id, registrationDate: new Date('1-1-2019') }))

    expect(
      store
        .getState()
        .get('documents')
        .get('documentsSet').size
    ).toEqual(0)
    addDocuments(docs)

    expect(
      store
        .getState()
        .get('documents')
        .get('documentsSet').size
    ).toEqual(docs.length)
  })

  it('provides documents grouped by categoryId as documentsByCategoryId', () => {
    const docs = [1, 2, 3].map(toString).map(id => fakeDocument({ id, registrationDate: new Date('1-1-2019') }))

    expect(
      store
        .getState()
        .get('documents')
        .get('documentsSet').size
    ).toEqual(0)
    addDocuments(docs)

    expect(
      store
        .getState()
        .get('documents')
        .get('documentsSet').size
    ).toEqual(docs.length)

    // Dive once since asserting HOC behavior against props of component one level under HOC
    const sut = shallow(
      <Provider store={store}>
        <Connected />
      </Provider>
    ).dive<MockComponentProps, null>()

    const expected = immutable.Set<Document>(docs).groupBy(pickDocumentCategoryId)
    const actual = sut.props()

    expect(actual).toHaveProperty('documentsByCategoryId')
    expect(actual.documentsByCategoryId).toEqual(expected)
  })

  it('causes re-render if props are updated', () => {
    const docs = [1, 2, 3].map(toString).map(id => fakeDocument({ id, registrationDate: new Date('1-1-2019') }))

    addDocuments(docs)

    // Dive once since asserting HOC behavior against props of component one level under HOC
    const sut = shallow(
      <Provider store={store}>
        <Connected />
      </Provider>
    ).dive<MockComponentProps, null>()

    setDocumentRegistered(docs[0])

    expect(sut.contains(<li key={docs[0].id}>{'REGISTERED'}></li>))
  })

  it('does not cause re-render if props are unchanged', () => {
    const docs = [1, 2, 3].map(toString).map(id => fakeDocument({ id, registrationDate: new Date('1-1-2019') }))

    addDocuments(docs)

    // Dive once since asserting HOC behavior against props of component one level under HOC
    const sut = shallow(
      <Provider store={store}>
        <Connected />
      </Provider>
    ).dive<MockComponentProps, null>()

    const initialProps = sut.props()

    addDocuments(docs)

    const equalProps = sut.props()
    expect(equalProps).toBe(initialProps)
  })
})
