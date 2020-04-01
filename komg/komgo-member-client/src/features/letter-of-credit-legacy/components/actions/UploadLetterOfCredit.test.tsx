import * as React from 'react'
import { shallow } from 'enzyme'
import UploadLetterOfCredit from './UploadLetterOfCredit'
import { fakeLetterOfCreditEnriched, mockDate } from '../../utils/faker'
import { Button } from 'semantic-ui-react'
import { Formik } from 'formik'
import { render } from '@testing-library/react'

// the magic https://github.com/Semantic-Org/Semantic-UI-React/issues/2454#issuecomment-373246622
jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

describe('UploadLC component', () => {
  let defaultProps: any

  beforeEach(() => {
    mockDate().freeze('Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)')
    defaultProps = {
      isOpenUploadModal: false,
      letterOfCredit: fakeLetterOfCreditEnriched(),
      actions: { status: null, name: null },
      participantsNames: { applicant: '', beneficiary: '', issuingBank: '', beneficiaryBank: '' },
      handleToggleUploadModal: jest.fn(),
      create: jest.fn()
    }
  })

  afterEach(() => {
    mockDate().restore()
  })

  it('Should render component successfully', () => {
    const wrapper = shallow(<UploadLetterOfCredit {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('Should find two button', () => {
    const wrapper = shallow(<UploadLetterOfCredit {...defaultProps} isOpenUploadModal={true} />)

    const buttons = wrapper
      .find(Formik)
      .shallow()
      .find(Button)

    expect(buttons.length).toBe(2)
  })

  it('Should call handleToggleUploadModal when button cancel is clicked', () => {
    const wrapper = shallow(<UploadLetterOfCredit {...defaultProps} isOpenUploadModal={true} />)

    const button = wrapper
      .find(Formik)
      .shallow()
      .find(Button)
      .first()

    button.simulate('click')

    expect(defaultProps.handleToggleUploadModal).toHaveBeenCalled()
  })

  it('Should match snapshot', () => {
    expect(render(<UploadLetterOfCredit {...defaultProps} isOpenUploadModal={true} />).asFragment()).toMatchSnapshot()
  })
})
