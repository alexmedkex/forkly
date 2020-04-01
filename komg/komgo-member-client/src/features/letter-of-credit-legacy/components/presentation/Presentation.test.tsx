import * as React from 'react'
import { shallow } from 'enzyme'
import { List, Header } from 'semantic-ui-react'
import Presentation, { SubmittedLabel } from './Presentation'
import { fakePresentation, fakeDocument } from '../../utils/faker'
import SimpleButton from '../../../../components/buttons/SimpleButton'
import { LCPresentationStatus } from '../../store/presentation/types'
import DocumentsList from './DocumentsList'

describe('Presentation component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      presentation: fakePresentation({ staticId: '123', reference: '123' }),
      history: { push: jest.fn() },
      id: '123',
      readOnly: false,
      documents: [
        fakeDocument({ context: { productId: 'tradeFinance', subProductId: 'lc', lcPresentationStaticId: '123' } })
      ],
      toggleAddNewDocumentModal: jest.fn(),
      removePresentationHandle: jest.fn(),
      openDeleteDocumentConfirm: jest.fn(),
      toggleSubmitPresentationModal: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<Presentation {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find header component with appropriate text', () => {
    const wrapper = shallow(<Presentation {...defaultProps} />)

    const header = wrapper.find(Header).shallow()

    expect(header.text()).toBe(`Presentation #${defaultProps.presentation.staticId}`)
  })

  it('should not render list when documents do not exists', () => {
    const wrapper = shallow(<Presentation {...defaultProps} documents={[]} />)

    const list = wrapper.find(List)

    expect(list.length).toBe(0)
  })

  it('should not render list when documents do not exists', () => {
    const wrapper = shallow(<Presentation {...defaultProps} />)

    const list = wrapper.find(DocumentsList)

    expect(list.length).toBe(1)
  })

  it('should remove button with appropriate text', () => {
    const wrapper = shallow(<Presentation {...defaultProps} />)

    const removeButton = wrapper
      .find(SimpleButton)
      .first()
      .shallow()

    expect(removeButton.text()).toBe('Remove')
  })

  it('should call removePresentationHandle when remove button is clicked', () => {
    const wrapper = shallow(<Presentation {...defaultProps} />)

    const removeButton = wrapper.find(SimpleButton).first()
    removeButton.simulate('click')

    expect(defaultProps.removePresentationHandle).toHaveBeenCalled()
  })

  it('should not render remove button if presentation status is not draft', () => {
    const presentation = fakePresentation({
      staticId: '123',
      reference: '123',
      status: LCPresentationStatus.DocumentsPresented
    })
    const wrapper = shallow(<Presentation {...defaultProps} presentation={presentation} />)

    const removeButton = wrapper.find(SimpleButton)

    expect(removeButton.length).toBe(0)
  })

  it('should not find remove button when readOnly is true', () => {
    const wrapper = shallow(<Presentation {...defaultProps} readOnly={true} />)

    const removeButton = wrapper.find(SimpleButton)

    expect(removeButton.length).toBe(0)
  })

  it('should find submitted details if presentation status is submitted', () => {
    const presentation = fakePresentation({
      staticId: '123',
      reference: '123',
      status: LCPresentationStatus.DocumentsPresented
    })
    const wrapper = shallow(<Presentation {...defaultProps} presentation={presentation} />)

    const submittedDetailsWrapper = wrapper.find(SubmittedLabel)

    expect(submittedDetailsWrapper.exists()).toBe(true)
  })
})
