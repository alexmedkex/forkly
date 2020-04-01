import { RDStatus } from '@komgo/types'
import { shallow } from 'enzyme'
import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { List } from 'semantic-ui-react'
import {
  fakeCommercialContractDocumentTypes,
  fakeCommercialContractDocumentWithoutExtension
} from '../../../../trades/components/documents-form-fields/faker'
import { DocumentListItem } from './DocumentListItem'
import DocumentsList from './DocumentsList'

describe('DocumentsList component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      documents: [fakeCommercialContractDocumentWithoutExtension],
      documentTypes: fakeCommercialContractDocumentTypes,
      documentItemSelection: fakeCommercialContractDocumentWithoutExtension,
      inForm: true,
      removeDocument: jest.fn(),
      editDocument: jest.fn(),
      rdStatus: RDStatus.QuoteSubmitted
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
    const testProps = {
      ...defaultProps,
      documents: [
        fakeCommercialContractDocumentWithoutExtension,
        { ...fakeCommercialContractDocumentWithoutExtension, _id: 'document1', name: docName2 }
      ]
    }

    const wrapper = shallow(<DocumentsList {...testProps} />)
    const elements = wrapper
      .find(List)
      .dive()
      .find(DocumentListItem)

    expect(elements.length).toBe(2)
  })

  it('should render View, Download, Delete in dropdown options if RDStatus is RDStatus.QuoteAccepted', () => {
    const testProps = {
      ...defaultProps,
      rdStatus: RDStatus.QuoteAccepted,
      documents: [
        {
          ...fakeCommercialContractDocumentWithoutExtension,
          file: null
        }
      ]
    }
    const wrapper = shallow(<DocumentsList {...testProps} />)
    const instance = wrapper.instance() as DocumentsList

    const options = instance.renderDropdownOptions(0, testProps.documents[0] as any)

    expect(options.length).toBe(3)
    expect(options[0].value).toBe('View')
    expect(options[1].value).toBe('Download')
    expect(options[2].value).toBe('Delete')
  })

  it('should render View and Download in dropdown options if RDStatus is not RDStatus.QuoteAccepted', () => {
    const props = {
      ...defaultProps,
      documents: [
        {
          ...fakeCommercialContractDocumentWithoutExtension,
          file: null
        }
      ]
    }
    const wrapper = shallow(<DocumentsList {...props} />)
    const instance = wrapper.instance() as DocumentsList

    const options = instance.renderDropdownOptions(0, props.documents[0] as any)

    expect(options.length).toBe(2)
    expect(options[0].value).toBe('View')
    expect(options[1].value).toBe('Download')
  })

  it('should not render edit in dropdown options in case editing trade (document.file = null)', () => {
    const props = {
      ...defaultProps,
      documents: [
        {
          ...[fakeCommercialContractDocumentWithoutExtension],
          file: null
        }
      ]
    }

    const wrapper = shallow(<DocumentsList {...props} />)

    const instance = wrapper.instance() as DocumentsList

    const options = instance.renderDropdownOptions(0, props.documents[0] as any)

    expect(options.length).toBe(2)
    expect(options[0].value).toBe('View')
    expect(options[1].value).toBe('Download')
  })

  it('should render View, Download, Delete without any being selected', () => {
    const testProps = {
      ...defaultProps,
      rdStatus: RDStatus.QuoteAccepted,
      documents: [
        {
          ...fakeCommercialContractDocumentWithoutExtension,
          file: null
        }
      ]
    }
    const wrapper = shallow(<DocumentsList {...testProps} />)
    const instance = wrapper.instance() as DocumentsList

    const options = instance.renderDropdownOptions(0, testProps.documents[0] as any)

    expect(options[0].selected).toBe(false)
    expect(options[1].selected).toBe(false)
    expect(options[2].selected).toBe(false)
  })
})
