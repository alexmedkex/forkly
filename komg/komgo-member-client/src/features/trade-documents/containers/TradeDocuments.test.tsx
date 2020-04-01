import * as React from 'react'
import { mount } from 'enzyme'
import { TradeDocuments, Props } from './TradeDocuments'

const props: Props = {
  isFetching: false,
  documents: [],
  categories: [],
  documentTypes: [],
  fetchTradeDocumentsAsync: jest.fn(),
  fetchCategoriesAsync: jest.fn(),
  fetchDocumentTypesAsync: jest.fn(),
  createTradeDocumentAsync: jest.fn(),
  counterparties: [],
  documentListFilter: null,
  fetchConnectedCounterpartiesAsync: jest.fn(),
  setDocumentListFilter: jest.fn()
}

describe('TradeDocuments', () => {
  it('should get documents', () => {
    mount(<TradeDocuments {...props} />)
    expect(props.fetchTradeDocumentsAsync).toHaveBeenCalledWith()
  })
})
