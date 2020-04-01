import { RDStatus } from '@komgo/types'
import { shallow, ShallowWrapper } from 'enzyme'
import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { BottomSheetStatus } from '../../../../bottom-sheet/store/types'
import { Products } from '../../../../document-management/constants/Products'
import {
  fakeCommercialContractDocumentTypes,
  fakeCommercialContractDocumentWithExtension
} from '../../../../trades/components/documents-form-fields/faker'
import DiscountingDocuments, { DocumentsHeader } from './DiscountingDocuments'
import DocumentsList from './DocumentsList'
import { ReceivablesDiscountingRole } from '../../../utils/constants'
import { MinimalAccordionWrapper } from '../../../../../components/accordion/MinimalAccordionWrapper'

describe('DiscountingDocuments', () => {
  let defaultProps: any

  beforeEach(() => {
    const registeredDocuments = [
      {
        ...fakeCommercialContractDocumentWithExtension,
        state: BottomSheetStatus.REGISTERED,
        id: 'new-id'
      },
      {
        ...fakeCommercialContractDocumentWithExtension,
        state: BottomSheetStatus.REGISTERED,
        id: 'new-id-2'
      },
      {
        ...fakeCommercialContractDocumentWithExtension,
        state: BottomSheetStatus.REGISTERED,
        id: 'new-id-3'
      }
    ]
    defaultProps = {
      rdId: 'rdId123',
      isDocumentsAccordionOpen: true,
      role: ReceivablesDiscountingRole.Trader,
      registeredDocuments,
      documentTypes: fakeCommercialContractDocumentTypes,
      tradeSourceId: 'tradeSourceId123',
      rdStatus: RDStatus.QuoteAccepted,
      handleDocumentViewClick: jest.fn(),
      handleDocumentDeleteClick: jest.fn(),
      handleClick: jest.fn(),
      createDocumentAsync: jest.fn(),
      sendDocumentsAsync: jest.fn(),
      counterpartyId: 'test-counterparty-id',
      companyStaticId: 'test-company-static-id'
    }
  })

  it('renders correctly', () => {
    expect(renderer.create(<DiscountingDocuments {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should not render upload button if rdStatus is not RDStatus.QuoteAccepted', () => {
    const props = { ...defaultProps, rdStatus: RDStatus.QuoteSubmitted }
    const wrapper = shallow(<DiscountingDocuments {...props} />)
    const uploadButton = wrapper.find({ 'data-test-id': 'button-add-document' })

    expect(uploadButton.exists()).toBe(false)
  })

  it('should render upload button if rdStatus is RDStatus.QuoteAccepted', () => {
    const wrapper = shallow(<DiscountingDocuments {...defaultProps} />)
    const button = wrapper.find({ 'data-test-id': 'button-add-document' })

    expect(button.exists()).toBe(true)
  })

  it('should render upload text when no documents are present rdStatus is RDStatus.QuoteAccepted', () => {
    const wrapper = shallow(<DiscountingDocuments {...defaultProps} registeredDocuments={[]} />)

    expect(wrapper.find('p').text()).toEqual('Upload document(s) that you want to share with your counterparty')
  })

  it('should render select to share text when documents are present rdStatus is RDStatus.QuoteAccepted', () => {
    const wrapper = shallow(<DiscountingDocuments {...defaultProps} />)

    expect(wrapper.find('p').text()).toEqual(
      'Select document(s) you wish to share with your counterparty. Once document(s) are shared you will not be able to delete or unshare them'
    )
  })

  it('should render upload text when no documents are present rdStatus is NOT RDStatus.QuoteAccepted', () => {
    const props = { ...defaultProps, rdStatus: RDStatus.QuoteSubmitted }
    const wrapper = shallow(<DiscountingDocuments {...props} />)

    expect(wrapper.find('p').text()).toEqual('Document(s) have not been shared with any external parties')
  })

  it('should render upload text when role is BANK', () => {
    const props = { ...defaultProps, role: ReceivablesDiscountingRole.Bank }
    const wrapper = shallow(<DiscountingDocuments {...props} />)

    expect(wrapper.find('p').exists()).toBe(true)
  })

  it('should share selected documents', () => {
    const wrapper = shallow(<DiscountingDocuments {...defaultProps} />)

    clickCheckbox(wrapper, defaultProps.registeredDocuments[0].id)
    clickShareButton(wrapper)

    expect(defaultProps.sendDocumentsAsync).toHaveBeenCalledWith(
      [
        {
          companyId: defaultProps.counterpartyId,
          documents: [defaultProps.registeredDocuments[0].id],
          context: {
            reviewNotRequired: true
          }
        }
      ],
      Products.TradeFinance
    )
  })

  it('should select and share all documents', () => {
    const wrapper = shallow(<DiscountingDocuments {...defaultProps} />)

    clickCheckbox(wrapper, 'selectAll')
    clickShareButton(wrapper)

    expect(defaultProps.sendDocumentsAsync).toHaveBeenCalledWith(
      [
        {
          companyId: defaultProps.counterpartyId,
          documents: defaultProps.registeredDocuments.map(d => d.id),
          context: {
            reviewNotRequired: true
          }
        }
      ],
      Products.TradeFinance
    )
  })

  it('should exclude documents already shared or received', () => {
    // Shared
    defaultProps.registeredDocuments[0].sharedWith = [{ counterpartyId: defaultProps.counterpartyId }]
    // Received
    defaultProps.registeredDocuments[1].owner = { companyId: 'Not us' }
    const wrapper = shallow(<DiscountingDocuments {...defaultProps} />)

    clickCheckbox(wrapper, 'selectAll')
    clickShareButton(wrapper)

    expect(defaultProps.sendDocumentsAsync).toHaveBeenCalledWith(
      [
        {
          companyId: defaultProps.counterpartyId,
          documents: [defaultProps.registeredDocuments[2].id],
          context: {
            reviewNotRequired: true
          }
        }
      ],
      Products.TradeFinance
    )
  })

  it('should show share button if the user is a bank', () => {
    const wrapper = shallow(<DiscountingDocuments {...defaultProps} role={ReceivablesDiscountingRole.Bank} />)

    expect(wrapper.find({ 'data-test-id': 'select-all-checkbox-wrapper' }).exists()).toBeTruthy()
  })

  it('should highlight the accordion if it has changed', () => {
    const wrapper = shallow(<DiscountingDocuments {...defaultProps} changed={true} />)

    expect(wrapper.find(MinimalAccordionWrapper).prop('highlight')).toBeTruthy()
  })

  it('should match snapshot - TRADER', () => {
    const tree = renderer.create(<DiscountingDocuments {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match snapshot - BANK', () => {
    const tree = renderer
      .create(<DiscountingDocuments {...defaultProps} role={ReceivablesDiscountingRole.Bank} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  function clickShareButton(wrapper: ShallowWrapper) {
    const shareButton = wrapper.find({ 'data-test-id': 'share-documents' })
    shareButton.simulate('click')
  }

  function clickCheckbox(wrapper: ShallowWrapper, id: string) {
    const docList = wrapper.find({ 'data-test-id': 'document-list' }).at(0)
    docList.props().handleClickDocumentItemCheckbox(id, true, false)
  }
})
