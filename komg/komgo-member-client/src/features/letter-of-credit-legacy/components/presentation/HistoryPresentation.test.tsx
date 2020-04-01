import * as React from 'react'
import { shallow } from 'enzyme'
import { fakePresentation, fakeDocument, fakeMember } from '../../utils/faker'
import HistoryPresentation from './HistoryPresentation'
import { IMember } from '../../../members/store/types'

const myStaticId = 'myStaticId'
const members: IMember[] = [
  fakeMember({
    staticId: 'notABankId',
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'Not A Bank'
  }),
  fakeMember({
    staticId: myStaticId,
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'My Trading Co'
  }),
  fakeMember({
    staticId: 'anotherId',
    isMember: false,
    isFinancialInstitution: true,
    commonName: 'A Bank'
  }),
  fakeMember({
    staticId: 'yetAnotherId',
    isMember: true,
    isFinancialInstitution: true,
    commonName: 'A Member Bank'
  }),
  fakeMember({
    staticId: 'notABankIdAndNotAMemberId',
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'Not A Bank And Not A Member'
  })
]

describe('HistoryPresentation component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      documents: [
        fakeDocument({ context: { productId: 'tradeFinance', subProductId: 'lc', lcPresentationStaticId: '123' } })
      ],
      presentation: fakePresentation({ staticId: '123', reference: '123' }),
      showActions: true,
      members
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<HistoryPresentation {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })
})
