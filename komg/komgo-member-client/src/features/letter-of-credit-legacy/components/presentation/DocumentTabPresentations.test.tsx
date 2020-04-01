import * as React from 'react'
import { shallow } from 'enzyme'
import { List } from 'semantic-ui-react'
import { fakePresentation, fakeDocument } from '../../utils/faker'
import DocumentTabPresentations, { StyledPresentation, StyledList, StyledListItem } from './DocumentTabPresentations'
import { LCPresentationStatus, LCPresentationDocumentStatus } from '../../store/presentation/types'

describe('DocumentTabPresentations', () => {
  let defaultProps

  beforeEach(() => {
    const document = fakeDocument({
      context: { productId: 'tradeFinance', subProductId: 'lc', lcPresentationStaticId: '123' }
    })
    defaultProps = {
      presentations: [
        fakePresentation({
          staticId: '123',
          reference: '123',
          status: LCPresentationStatus.DocumentsCompliantByNominatedBank,
          documents: [
            {
              documentId: document.id,
              documentHash: '111',
              status: LCPresentationDocumentStatus.Draft,
              documentTypeId: 'aml',
              dateProvided: new Date()
            }
          ]
        })
      ],
      documents: [document],
      itemToListItemContent: () => ({
        id: document.id,
        documentType: document.type.name,
        fileName: document.name,
        parcelId: '',
        registrationDate: document.registrationDate,
        controls: null
      }),
      lcId: '1'
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<DocumentTabPresentations {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find one presentation component', () => {
    const wrapper = shallow(<DocumentTabPresentations {...defaultProps} />)

    const presentation = wrapper.find(StyledPresentation)

    expect(presentation.length).toBe(1)
  })

  it('should find one document', () => {
    const wrapper = shallow(<DocumentTabPresentations {...defaultProps} />)

    const documentList = wrapper
      .find(StyledPresentation)
      .shallow()
      .find(StyledList)
      .shallow()
      .find(StyledListItem)

    expect(documentList.length).toBe(1)
  })
})
