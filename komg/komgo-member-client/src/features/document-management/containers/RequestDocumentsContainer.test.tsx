import { shallow } from 'enzyme'
import * as React from 'react'
import {
  RequestDocumentsContainer,
  IRequestDocumentForm,
  requestDocumentFormDefaultValue
} from './RequestDocumentsContainer'
import * as renderer from 'react-test-renderer'
import { createMemoryHistory } from 'history'
import { fakeFormikContext } from '../../../store/common/faker'

describe('RequestDocumentsContainer component', () => {
  const mockProps = {
    categories: [],
    documentTypes: [],
    counterparties: [],
    history: createMemoryHistory(),
    staticContext: undefined,
    location: {
      pathname: '',
      search: '',
      state: '',
      hash: ''
    },
    match: {
      isExact: true,
      path: '',
      url: '',
      params: {
        id: 'counterparty-id'
      }
    },
    allDocs: [],

    fetchDocumentsAsync: jest.fn(),
    fetchConnectedCounterpartiesAsync: jest.fn(),
    fetchCategoriesAsync: jest.fn(),
    fetchDocumentTypesAsync: jest.fn(),
    createDocumentAsync: jest.fn(),
    createRequestAsync: jest.fn(),
    resetLoadedDocument: jest.fn(),
    ...fakeFormikContext<IRequestDocumentForm>(requestDocumentFormDefaultValue)
  }
  it('should render an empty SectionCard item with props', () => {
    const wrapper = shallow(<RequestDocumentsContainer {...mockProps} />)
    expect(wrapper.exists()).toBe(true)
  })

  it('should not render DocumentViewContainer if previewDocumentId in state is empty string', () => {
    const wrapper = shallow(<RequestDocumentsContainer {...mockProps} />)

    expect(wrapper.find('[data-test-id="view-document-modal"]').exists()).toBe(false)
  })

  it('should set document id in state and render DocumentViewContainer once handleTogglePreviewDocument is called with id', () => {
    const wrapper = shallow(<RequestDocumentsContainer {...mockProps} />)

    const instance = wrapper.instance() as RequestDocumentsContainer

    instance.handleTogglePreviewDocument('123')

    expect(wrapper.state('previewDocumentId')).toBe('123')
    expect(wrapper.find('[data-test-id="view-document-modal"]').exists()).toBe(true)
  })
})
