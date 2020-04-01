import * as React from 'react'
import { shallow } from 'enzyme'
import AcceptLC from './AcceptLC'
import { fakeLetterOfCreditEnriched } from '../../../letter-of-credit-legacy/utils/faker'
import { mockDate } from '../../../letter-of-credit-legacy/utils/faker'
import { render } from '@testing-library/react'

// the magic https://github.com/Semantic-Org/Semantic-UI-React/issues/2454#issuecomment-373246622
jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

describe('AcceptLC component', () => {
  let defaultProps: any
  beforeEach(() => {
    mockDate().freeze('Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)')
    defaultProps = {
      show: false,
      actions: { status: '', name: '' },
      letterOfCredit: fakeLetterOfCreditEnriched(),
      handleToggleAcceptModal: jest.fn(),
      handleAcceptLC: jest.fn()
    }
  })

  afterEach(() => {
    mockDate().restore()
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<AcceptLC {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('Should match snapshot', () => {
    expect(render(<AcceptLC {...defaultProps} show={true} />).asFragment()).toMatchSnapshot()
  })
})
