import * as React from 'react'
import { shallow } from 'enzyme'
import { fakeLetterOfCreditEnriched, fakePresentation, fakeDocument } from '../../utils/faker'
import { LetterOfCreditPresentation } from './LetterOfCreditPresentation'
import { LoadingTransition } from '../../../../components'
import { Header } from 'semantic-ui-react'
import NoPresentationExists from '../../components/presentation/NoPresentationExists'
import Presentation from '../../components/presentation/Presentation'
import SimpleButton from '../../../../components/buttons/SimpleButton'

describe('LetterOfCreditPresentation component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      categories: [],
      documentTypes: [],
      letterOfCredit: fakeLetterOfCreditEnriched(),
      presentations: [fakePresentation({ staticId: '123' })],
      isFetching: false,
      documents: {
        '123': fakeDocument({
          context: { productId: 'tradeFinance', subProductId: 'lc', lcPresentationStaticId: '123' }
        })
      },
      match: {
        isExact: true,
        path: '',
        url: '',
        params: {}
      },
      readOnly: false,
      getLetterOfCredit: jest.fn(),
      createPresentation: jest.fn(),
      fetchCategoriesAsync: jest.fn(),
      fetchDocumentTypesAsync: jest.fn(),
      createLCDocumentAsync: jest.fn(),
      getTasks: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<LetterOfCreditPresentation {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find loading component', () => {
    const wrapper = shallow(<LetterOfCreditPresentation {...defaultProps} isFetching={true} />)

    const loader = wrapper.find(LoadingTransition).first()

    expect(loader.exists()).toBe(true)
  })

  it('should find header component with appropriate text', () => {
    const wrapper = shallow(<LetterOfCreditPresentation {...defaultProps} />)

    const header = wrapper
      .find(Header)
      .first()
      .shallow()

    expect(header.text()).toBe('Documents Presentation')
  })

  it('should find header component with appropriate text', () => {
    const wrapper = shallow(<LetterOfCreditPresentation {...defaultProps} />)

    const header = wrapper
      .find(Header)
      .at(1)
      .shallow()

    expect(header.text()).toBe(defaultProps.letterOfCredit.reference)
  })

  it('should find no presentation exists component', () => {
    const wrapper = shallow(<LetterOfCreditPresentation {...defaultProps} presentations={[]} />)

    const noPresentationExists = wrapper.find(NoPresentationExists).first()

    expect(noPresentationExists.exists()).toBe(true)
  })

  it('should find one presentation component', () => {
    const wrapper = shallow(<LetterOfCreditPresentation {...defaultProps} />)

    const presentations = wrapper.find(Presentation)

    expect(presentations.length).toBe(1)
  })

  it('should find first simple button with add new presentation text', () => {
    const wrapper = shallow(<LetterOfCreditPresentation {...defaultProps} />)

    const simpleButton = wrapper.find(SimpleButton).shallow()

    expect(simpleButton.text()).toBe('+ Add new presentation')
  })

  it('should not find simple button for adding presentation if readOnly is true', () => {
    const wrapper = shallow(<LetterOfCreditPresentation {...defaultProps} readOnly={true} />)

    const simpleButton = wrapper.find(SimpleButton)

    expect(simpleButton.length).toBe(0)
  })

  it('should call createPresentation when add new presentation button is clicked', () => {
    const wrapper = shallow(<LetterOfCreditPresentation {...defaultProps} />)

    const addNewPresentationButton = wrapper.find(SimpleButton).first()

    addNewPresentationButton.simulate('click')

    expect(defaultProps.createPresentation).toHaveBeenCalled()
  })
})
