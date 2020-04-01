import * as React from 'react'
import { shallow } from 'enzyme'
import RejectModalLC from '../../components/actions/RejectModalLC'
import { fakeLetterOfCreditEnriched, fakeLetterOfCredit } from '../../utils/faker'
import { Formik } from 'formik'
import { Button, Form, TextArea } from 'semantic-ui-react'
import { render } from '@testing-library/react'

// the magic https://github.com/Semantic-Org/Semantic-UI-React/issues/2454#issuecomment-373246622
jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

const RealDate = Date

const mockDate = (isoDate: any) => {
  const _GLOBAL: any = global // we love typescript!
  _GLOBAL.Date = class extends RealDate {
    constructor(...args: any[]) {
      super()
      return new RealDate(isoDate)
    }
  }
}

describe('RejectModalLC component', () => {
  let defaultProps: any

  beforeEach(() => {
    mockDate('Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)')
    defaultProps = {
      show: true,
      letter: fakeLetterOfCredit(),
      actions: { status: null, name: null },
      participantsNames: { applicant: '', beneficiary: '', issuingBank: '', beneficiaryBank: '' },
      cancel: jest.fn()
    }
  })

  it('Should render RejectModalLC', () => {
    const wrapper = shallow(<RejectModalLC {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('Should call cancel when button close is clicked', () => {
    const wrapper = shallow(<RejectModalLC {...defaultProps} isOpenUploadModal={true} />)

    const button = wrapper
      .find(Formik)
      .shallow()
      .find(Button)
      .first()

    button.simulate('click')

    expect(defaultProps.cancel).toHaveBeenCalled()
  })

  it('Should find two button', () => {
    const wrapper = shallow(<RejectModalLC {...defaultProps} isOpenUploadModal={true} />)

    const buttons = wrapper
      .find(Formik)
      .shallow()
      .find(Button)

    expect(buttons.length).toBe(2)
  })

  it('Should match snapshot', () => {
    expect(render(<RejectModalLC {...defaultProps} isOpenUploadModal={true} />).asFragment()).toMatchSnapshot()
  })
})
