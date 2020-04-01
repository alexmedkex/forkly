import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'

import DocumentsList from './DocumentsList'
import { Accordion, List } from 'semantic-ui-react'
import { DocumentType } from '../../../document-management/store/types/document-type'
import { mockProduct } from '../../../document-management/store/products/mock-data'
import { mockCategories } from '../../../document-management/store/categories/mock-data'
import { DocumentListItem } from '../DocumentListItem'
import Text from '../../../../components/text/Text'
import {
  fakeCommercialContractDocumentWithoutExtension,
  fakeCommercialContractDocumentTypes,
  fakeCommercialContractDocumentWithExtension
} from './faker'

describe('DocumentsList component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      documents: [fakeCommercialContractDocumentWithoutExtension],
      documentTypes: fakeCommercialContractDocumentTypes,
      inForm: true,
      removeDocument: jest.fn(),
      editDocument: jest.fn()
    }
  })

  it('should render DocumentsList component sucessfully', () => {
    const wrapper = shallow(<DocumentsList {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const tree = renderer.create(<DocumentsList {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should find the right number of documents', () => {
    const docName2 = 'secondDocument'
    const newDocuments = [
      fakeCommercialContractDocumentWithoutExtension,
      { ...fakeCommercialContractDocumentWithoutExtension, _id: 'document1', name: docName2 }
    ]
    const wrapper = shallow(<DocumentsList {...defaultProps} documents={newDocuments} />)

    const elements = wrapper
      .find(List)
      .shallow()
      .find(DocumentListItem)

    expect(elements.length).toBe(2)

    const getElement = (index: number) => {
      return elements
        .at(index)
        .shallow()
        .find(List.Item)
        .shallow()
        .find(List.Content)
        .at(1)
        .shallow()
        .find(Text)
        .shallow()
    }

    expect(getElement(0).contains(fakeCommercialContractDocumentWithoutExtension.name)).toBeTruthy()
    expect(getElement(1).contains(docName2)).toBeTruthy()
  })

  it('should add file extension', () => {
    const newDocuments = [fakeCommercialContractDocumentWithExtension]

    const elements = shallow(<DocumentsList {...defaultProps} documents={newDocuments} />)
      .find(List)
      .shallow()
      .find(DocumentListItem)

    expect(elements.length).toBe(1)

    const getElement = (index: number) => {
      return elements
        .at(index)
        .shallow()
        .find(List.Item)
        .shallow()
        .find(List.Content)
        .at(1)
        .shallow()
        .find(Text)
        .shallow()
    }

    expect(getElement(0).contains(`${fakeCommercialContractDocumentWithExtension.name}.pdf`)).toBeTruthy()
  })

  it('should not render edit in dropdown options in case editing trade (document.file = null)', () => {
    const documents = [
      {
        ...fakeCommercialContractDocumentWithoutExtension,
        file: null
      }
    ]

    const wrapper = shallow(<DocumentsList {...defaultProps} documents={documents} />)

    const instance = wrapper.instance() as DocumentsList

    const options = instance.renderDropdownOptions(0, documents[0])

    expect(options.length).toBe(1)
    expect(options[0].value).toBe('Delete')
  })
})
