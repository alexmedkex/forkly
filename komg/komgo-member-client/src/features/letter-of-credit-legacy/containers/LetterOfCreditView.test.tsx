import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { createMemoryHistory } from 'history'
import {
  LetterOfCreditView,
  LetterOfCreditViewProps
} from '../../letter-of-credit-legacy/containers/LetterOfCreditView'
import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { initialLetterOfCreditValues } from '../../letter-of-credit-legacy/constants'
import {
  fakeCounterparty,
  fakeLetterOfCredit,
  fakeLetterOfCreditEnriched,
  fakeMember
} from '../../letter-of-credit-legacy/utils/faker'
import {
  selectBeneficiaryIdOptions,
  selectInitialValuesFromLetterOfCredit,
  selectIssuingBankIdOptions
} from '../../letter-of-credit-legacy/utils/selectors'
import { STEP } from '../../letter-of-credit-legacy/constants'

const props: LetterOfCreditViewProps = {
  isAuthorized: () => true,
  isFetching: false,
  history: createMemoryHistory(),
  location: {
    pathname: '',
    search: 'tradeId=myTradeId',
    state: '',
    hash: ''
  },
  match: {
    isExact: true,
    path: '',
    url: '',
    params: {
      id: 1
    }
  },
  staticContext: undefined,
  letterOfCredit: fakeLetterOfCreditEnriched(),
  actions: {
    status: 'status',
    name: 'actionName'
  },
  applicantCompanyName: '',
  applicantCountry: '',
  applicantAddress: '',
  company: 'company',
  role: '',
  trade: undefined,
  tradeId: '1234',
  cargoMovements: [],
  getLetterOfCredit: () => null,
  getTasks: (params?: {}) => null,
  fetchMembers: (params?: {}) => null,
  fetchConnectedCounterpartiesAsync: (params?: {}) => null,
  createLetterOfCreditAsync: (uploadLCFormData, id) => null,
  rejectLetterOfCreditAsync: (RejectLCForm, letterOfCredit, task) => null,
  acceptLetterOfCreditAsync: letterOfCredit => null,
  clearLetterOfCreditError: () => null,
  error: null,
  counterparties: [],
  members: [],
  initialValues: initialLetterOfCreditValues,
  dispatch: jest.fn(),
  tasks: [],
  stateHistory: []
}

describe('LetterOfCreditView', () => {
  describe('renders', () => {
    it('without data', () => {
      expect(renderer.create(<LetterOfCreditView {...props} />).toJSON()).toMatchSnapshot()
    })

    it('should set default step for wizard when there is not step in url', () => {
      const wrapper = shallow(<LetterOfCreditView {...props} />)

      expect(wrapper.state('step')).toBe(STEP.SUMMARY_OF_TRADE)
    })

    it('should set default step for wizard from url', () => {
      const location = { ...props.location, search: `step=${STEP.LC_DOCUMENTS}` }
      const wrapper = shallow(<LetterOfCreditView {...props} location={location} />)

      expect(wrapper.state('step')).toBe(STEP.LC_DOCUMENTS)
    })

    it('should set default step for wizard when step is bad in url', () => {
      const location = { ...props.location, search: 'step=test' }
      const wrapper = shallow(<LetterOfCreditView {...props} location={location} />)

      expect(wrapper.state('step')).toBe(STEP.SUMMARY_OF_TRADE)
    })
  })

  describe('SummaryOfTrade step', () => {
    it('renders', () => {
      const applicant = fakeMember({ staticId: 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016', commonName: 'Applicant Name' })
      const beneficiary = fakeMember({
        staticId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c',
        commonName: 'Beneficiary Name'
      })
      const issuingBank = fakeMember({
        staticId: '1bc05a66-1eba-44f7-8f85-38204e4d3516',
        commonName: 'Issuing Bank',
        isFinancialInstitution: true
      })
      const beneficiaryBank = fakeMember({
        staticId: 'ecc3b179-00bc-499c-a2f9-f8d1cc58e9db',
        commonName: 'Beneficiary Bank',
        isFinancialInstitution: true
      })
      const members = [applicant, beneficiary, issuingBank, beneficiaryBank]

      const counterparties = [
        fakeCounterparty({ ...applicant, commonName: applicant.x500Name.CN }),
        fakeCounterparty({ ...beneficiary, commonName: beneficiary.x500Name.CN }),
        fakeCounterparty({ ...issuingBank, commonName: issuingBank.x500Name.CN }),
        fakeCounterparty({ ...beneficiaryBank, commonName: beneficiaryBank.x500Name.CN })
      ]

      const letterOfCredit = fakeLetterOfCredit({
        applicantId: applicant.staticId,
        beneficiaryId: beneficiary.staticId,
        issuingBankId: issuingBank.staticId,
        beneficiaryBankId: beneficiaryBank.staticId
      })

      const initialValues = selectInitialValuesFromLetterOfCredit(
        letterOfCredit,
        members,
        letterOfCredit.tradeAndCargoSnapshot!.trade._id!
      )

      expect(
        renderer
          .create(
            <LetterOfCreditView
              {...props}
              members={members}
              counterparties={counterparties}
              trade={letterOfCredit.tradeAndCargoSnapshot!.trade}
              initialValues={initialValues}
            />
          )
          .toJSON()
      ).toMatchSnapshot()
    })
  })
})
