import * as React from 'react'
import { shallow } from 'enzyme'
import { createMemoryHistory } from 'history'
import { Header, Modal } from 'semantic-ui-react'

import { LetterOfCreditApplication, LetterOfCreditApplicationProps } from './LetterOfCreditApplication'
import { Unauthorized, ErrorMessage, LoadingTransition, Wizard } from '../../../components'
import { Permission, tradeFinanceManager } from '@komgo/permissions'
import {
  initialLetterOfCreditValues,
  LetterOfCreditValues,
  TYPE_OPTIONS,
  BILL_OF_LADING_ENDORSEMENT_OPTIONS,
  FEES_PAYABLE_BY_OPTIONS,
  BENEFICIARY_BANK_ROLE_OPTIONS,
  APPLICABLE_RULES_OPTIONS,
  AVAILABLE_WITH_OPTIONS,
  AVAILABLE_BY_OPTIONS,
  TEMPLATE_TYPE_OPTIONS,
  INVOICE_REQUIREMENT_OPTIONS
} from '../constants'
import { fakeTrade, fakeCargo } from '../utils/faker'
import { Currency } from '@komgo/types'

const testProps: LetterOfCreditApplicationProps = {
  isAuthorized: () => true,
  company: 'company',
  history: createMemoryHistory(),
  location: {
    pathname: '',
    search: 'tradeId=123',
    state: '',
    hash: ''
  },
  match: {
    isExact: true,
    path: '',
    url: '',
    params: null
  },
  staticContext: undefined,
  applicantAddress: 'address',
  applicantCompanyName: 'company',
  applicantCountry: 'country',
  applicantId: 'us',
  fetchMembers: () => null,
  fetchConnectedCounterpartiesAsync: () => null,
  getTrade: () => null,
  fetchMovements: () => null,
  trade: fakeTrade({ _id: '123' }),
  tradeId: '123',
  error: null,
  submissionError: null,
  counterparties: [],
  members: [],
  issuingBankIdOptions: [],
  beneficiaryIdOptions: [],
  initialValues: initialLetterOfCreditValues,
  isFetching: false,
  submitLetterOfCredit: () => null,
  clearLetterOfCreditError: () => null,
  cargoMovements: [fakeCargo()]
}

describe('LetterOfCreditApplication', () => {
  it('renders the application form if authorised', () => {
    const lcApp = shallow(<LetterOfCreditApplication {...testProps} />)

    expect(lcApp.find(Unauthorized).length).toBe(0)
    expect(
      lcApp
        .find(Header)
        .dive()
        .text()
    ).toBe('LC application')
  })
  it('renders unauthorized if unauthorized', () => {
    const lcApp = shallow(<LetterOfCreditApplication {...testProps} isAuthorized={() => false} />)

    expect(lcApp.find(Unauthorized).length).toBe(1)
  })
  it('renders unauthorized if a trade id is specified but we are unauthorized to view trades', () => {
    const isAuthorized = (permission: Permission) => {
      if (permission === tradeFinanceManager.canReadTrades) {
        return false
      }
      return true
    }

    const lcApp = shallow(<LetterOfCreditApplication {...testProps} isAuthorized={isAuthorized} />)

    expect(lcApp.find(Unauthorized).length).toBe(1)
  })
  it('does not render unauthorized if a trade id is not specified and we are unauthorized to view trades', () => {
    const mockLocation = {
      pathname: '',
      search: ``,
      state: '',
      hash: ''
    }

    const isAuthorized = (permission: Permission) => {
      if (permission === tradeFinanceManager.canReadTrades) {
        return false
      }
      return true
    }

    const lcApp = shallow(
      <LetterOfCreditApplication {...testProps} location={mockLocation} isAuthorized={isAuthorized} tradeId={null} />
    )

    expect(lcApp.find(Unauthorized).length).toBe(0)
  })

  it('can handle no trade id', () => {
    const lcApp = shallow(<LetterOfCreditApplication {...testProps} tradeId={null} />)

    const lcInstance = lcApp.instance() as LetterOfCreditApplication
    expect(lcInstance.props.tradeId).toEqual(null)
    expect(lcApp.find(Wizard).length).toEqual(1)
  })

  it('clears form error on exit', () => {
    const clearLetterOfCreditFormError = jest.fn()
    const lcApp = shallow(
      <LetterOfCreditApplication {...testProps} clearLetterOfCreditError={clearLetterOfCreditFormError} />
    )

    lcApp.unmount()

    expect(clearLetterOfCreditFormError).toHaveBeenCalled()
  })

  it('displays form error message with wizard if a submission error occurred', () => {
    const lcApp = shallow(<LetterOfCreditApplication {...testProps} submissionError="oh no a submission error" />)

    expect(lcApp.find(Wizard).length).toEqual(1)
    expect(lcApp.find(ErrorMessage).length).toEqual(1)
  })
  describe('fetchMembers', () => {
    it('is called once when component is mounted', () => {
      const fetchConnectedCounterpartiesAsync = jest.fn()
      shallow<LetterOfCreditApplication>(
        <LetterOfCreditApplication
          {...testProps}
          fetchConnectedCounterpartiesAsync={fetchConnectedCounterpartiesAsync}
        />
      )

      expect(fetchConnectedCounterpartiesAsync).toHaveBeenCalledTimes(1)
    })
  })
  describe('fetchTrade', () => {
    it('is called if a tradeId is given', () => {
      const getTrade = jest.fn()
      shallow<LetterOfCreditApplication>(<LetterOfCreditApplication {...testProps} getTrade={getTrade} />)

      expect(getTrade).toHaveBeenCalledTimes(1)
      expect(getTrade).toHaveBeenCalledWith('123')
    })
    it('is not called without a tradeId', () => {
      const getTrade = jest.fn()

      shallow<LetterOfCreditApplication>(
        <LetterOfCreditApplication {...testProps} getTrade={getTrade} tradeId={null} />
      )

      expect(getTrade).not.toHaveBeenCalled()
    })
    it('is not called if not authorized to view trades', () => {
      const getTrade = jest.fn()

      const isAuthorized = (permission: Permission) => {
        if (permission === tradeFinanceManager.canReadTrades) {
          return false
        }
        return true
      }

      shallow(<LetterOfCreditApplication {...testProps} getTrade={getTrade} isAuthorized={isAuthorized} />)

      expect(getTrade).not.toHaveBeenCalled()
    })
    it('is not called if not authorized to create LCs', () => {
      const getTrade = jest.fn()

      const isAuthorized = (permission: Permission) => {
        if (permission === tradeFinanceManager.canManageLCRequests) {
          return false
        }
        return true
      }

      shallow(<LetterOfCreditApplication {...testProps} getTrade={getTrade} isAuthorized={isAuthorized} />)

      expect(getTrade).not.toHaveBeenCalled()
    })
  })
  describe('fetchMovements', () => {
    it('is called with trade Id if a tradeId is given and we are authorised to view trades', () => {
      const fetchMovements = jest.fn()

      shallow(<LetterOfCreditApplication {...testProps} fetchMovements={fetchMovements} />)

      expect(fetchMovements).toHaveBeenCalledWith(testProps.tradeId)
    })
  })
  describe('Loading transition', () => {
    it('is shown when fetching prop is non zero', () => {
      const lcApp = shallow<LetterOfCreditApplication>(<LetterOfCreditApplication {...testProps} isFetching={true} />)

      expect(lcApp.find(LoadingTransition).length).toEqual(1)
    })
  })
  describe('error', () => {
    it('shows an ErrorMessage if it is set', () => {
      const lcApp = shallow(<LetterOfCreditApplication {...testProps} error="oh no" />)

      expect(lcApp.find(ErrorMessage).length).toEqual(1)
    })
  })
  describe('submitting the letter of credit', () => {
    describe('on handleSubmit being called', () => {
      it('changes the showConfirmationModal state to true', () => {
        const lcApp = shallow(<LetterOfCreditApplication {...testProps} />)

        const lcAppInstance = lcApp.instance() as LetterOfCreditApplication

        lcAppInstance.wizardSubmitHandler(testProps.initialValues)

        expect(lcAppInstance.state.showConfirmationModal).toBeTruthy()
      })
      it('includes the buyer etrmid and not the vakt id', () => {
        const lcApp = shallow(<LetterOfCreditApplication {...testProps} />)

        const lcAppInstance = lcApp.instance() as LetterOfCreditApplication

        lcAppInstance.wizardSubmitHandler(testProps.initialValues)

        const submissionModalText = lcApp
          .find(Modal.Content)
          .dive()
          .text()

        expect(submissionModalText).not.toContain(testProps.trade!.sourceId)
        expect(submissionModalText).toContain(testProps.trade!.buyerEtrmId)
      })
    })
    describe('on cancelSubmit being called', () => {
      it('changes showConfirmationModal to false', () => {
        const lcApp = shallow(<LetterOfCreditApplication {...testProps} />)

        const lcAppInstance = lcApp.instance() as LetterOfCreditApplication

        lcAppInstance.cancelSubmit()

        expect(lcAppInstance.state.showConfirmationModal).toEqual(false)
      })
      it('calling clearLetterOfCreditFormError when cancel button from modal is clicked if error exists', () => {
        const clearLetterOfCreditFormError = jest.fn()
        const lcApp = shallow(
          <LetterOfCreditApplication
            {...testProps}
            submissionError="oh no a submission error"
            clearLetterOfCreditError={clearLetterOfCreditFormError}
          />
        )

        const lcAppInstance = lcApp.instance() as LetterOfCreditApplication

        lcAppInstance.cancelSubmit()

        expect(clearLetterOfCreditFormError).toHaveBeenCalled()
      })
    })
    describe('on submitLetterOfCredit being called', () => {
      it('changes isSubmitting to true', () => {
        const lcApp = shallow(<LetterOfCreditApplication {...testProps} />)

        const lcAppInstance = lcApp.instance() as LetterOfCreditApplication

        lcAppInstance.handleSubmitLetterOfCredit()

        expect(lcAppInstance.state.isSubmitting).toEqual(true)
      })
      describe('with formValues', () => {
        it('calls submitLetterOfCredit with the cleaned up values if komgo template selected', () => {
          const finalSubmit = jest.fn()

          const formValues: LetterOfCreditValues = {
            applicantId: 'a',
            beneficiaryId: 'b',
            issuingBankId: 'i',
            beneficiaryBankId: 'bb',
            type: TYPE_OPTIONS.IRREVOCABLE,
            direct: true,
            tradeId: '123',
            billOfLadingEndorsement: BILL_OF_LADING_ENDORSEMENT_OPTIONS.APPLICANT,
            currency: Currency.USD,
            amount: 9999.33,
            expiryDate: '2018-12-22',
            applicantAddress: '',
            beneficiaryAddress: '',
            applicantCountry: '',
            beneficiaryCountry: '',
            applicantContactPerson: '',
            beneficiaryContactPerson: '',
            issuingBankAddress: '',
            issuingBankCountry: '',
            issuingBankContactPerson: '',
            feesPayableBy: FEES_PAYABLE_BY_OPTIONS.SPLIT,
            beneficiaryBankAddress: '',
            beneficiaryBankCountry: '',
            beneficiaryBankContactPerson: '',
            beneficiaryBankRole: BENEFICIARY_BANK_ROLE_OPTIONS.ADVISING,
            applicableRules: APPLICABLE_RULES_OPTIONS.UCP_LATEST_VERSION,
            cargoIds: [],
            expiryPlace: 'London',
            availableWith: AVAILABLE_WITH_OPTIONS.ADVISING_BANK,
            availableBy: AVAILABLE_BY_OPTIONS.ACCEPTANCE,
            documentPresentationDeadlineDays: 21,
            templateType: TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET,
            partialShipmentAllowed: false,
            transhipmentAllowed: false,
            comments: 'a comment',
            invoiceRequirement: INVOICE_REQUIREMENT_OPTIONS.EXHAUSTIVE
          }

          const {
            applicantAddress,
            applicantCountry,
            beneficiaryAddress,
            beneficiaryCountry,
            issuingBankAddress,
            issuingBankCountry,
            beneficiaryBankAddress,
            beneficiaryBankCountry,
            beneficiaryBankId,
            beneficiaryBankContactPerson,
            beneficiaryBankRole,
            ...expectedSubmitValues
          } = formValues

          const lcApp = shallow(<LetterOfCreditApplication {...testProps} submitLetterOfCredit={finalSubmit} />)

          const lcAppInstance = lcApp.instance() as LetterOfCreditApplication
          lcAppInstance.setState({
            formValues
          })

          lcAppInstance.handleSubmitLetterOfCredit()

          expect(finalSubmit).toHaveBeenCalledWith(expectedSubmitValues)
        })

        it('calls submitLetterOfCredit with the free text template provided if free text selected', () => {
          const finalSubmit = jest.fn()

          const formValues: LetterOfCreditValues = {
            applicantId: 'a',
            beneficiaryId: 'b',
            issuingBankId: 'i',
            beneficiaryBankId: 'bb',
            type: TYPE_OPTIONS.IRREVOCABLE,
            direct: true,
            tradeId: '123',
            billOfLadingEndorsement: BILL_OF_LADING_ENDORSEMENT_OPTIONS.APPLICANT,
            currency: Currency.USD,
            amount: 2.1,
            expiryDate: '2018-12-22',
            applicantAddress: '',
            beneficiaryAddress: '',
            applicantCountry: '',
            beneficiaryCountry: '',
            applicantContactPerson: '',
            beneficiaryContactPerson: '',
            issuingBankAddress: '',
            issuingBankCountry: '',
            issuingBankContactPerson: '',
            feesPayableBy: FEES_PAYABLE_BY_OPTIONS.SPLIT,
            beneficiaryBankAddress: '',
            beneficiaryBankCountry: '',
            beneficiaryBankContactPerson: '',
            beneficiaryBankRole: BENEFICIARY_BANK_ROLE_OPTIONS.ADVISING,
            applicableRules: APPLICABLE_RULES_OPTIONS.UCP_LATEST_VERSION,
            cargoIds: [],
            expiryPlace: 'London',
            availableWith: AVAILABLE_WITH_OPTIONS.ADVISING_BANK,
            availableBy: AVAILABLE_BY_OPTIONS.ACCEPTANCE,
            documentPresentationDeadlineDays: 21,
            templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT,
            freeTextLc: 'free text template',
            partialShipmentAllowed: false,
            transhipmentAllowed: false,
            comments: 'a comment',
            invoiceRequirement: INVOICE_REQUIREMENT_OPTIONS.SIMPLE
          }

          const {
            applicantAddress,
            applicantCountry,
            beneficiaryAddress,
            beneficiaryCountry,
            issuingBankAddress,
            issuingBankCountry,
            beneficiaryBankAddress,
            beneficiaryBankCountry,
            beneficiaryBankId,
            beneficiaryBankContactPerson,
            beneficiaryBankRole,
            billOfLadingEndorsement,
            invoiceRequirement,
            ...expectedSubmitValues
          } = formValues

          const lcApp = shallow(<LetterOfCreditApplication {...testProps} submitLetterOfCredit={finalSubmit} />)

          const lcAppInstance = lcApp.instance() as LetterOfCreditApplication
          lcAppInstance.setState({
            formValues
          })

          lcAppInstance.handleSubmitLetterOfCredit()

          expect(finalSubmit).toHaveBeenCalledWith(expectedSubmitValues)
        })
        it('calls submitLetterOfCredit with any beneficiary bank information added if direct is false', () => {
          const finalSubmit = jest.fn()

          const formValues: LetterOfCreditValues = {
            applicantId: 'a',
            beneficiaryId: 'b',
            issuingBankId: 'i',
            beneficiaryBankId: 'bb',
            type: TYPE_OPTIONS.IRREVOCABLE,
            direct: false,
            tradeId: '123',
            billOfLadingEndorsement: BILL_OF_LADING_ENDORSEMENT_OPTIONS.APPLICANT,
            currency: Currency.USD,
            amount: 2.1,
            expiryDate: '2018-12-22',
            applicantAddress: '',
            beneficiaryAddress: '',
            applicantCountry: '',
            beneficiaryCountry: '',
            applicantContactPerson: '',
            beneficiaryContactPerson: '',
            issuingBankAddress: '',
            issuingBankCountry: '',
            issuingBankContactPerson: '',
            feesPayableBy: FEES_PAYABLE_BY_OPTIONS.SPLIT,
            beneficiaryBankAddress: '',
            beneficiaryBankCountry: '',
            beneficiaryBankContactPerson: 'contact',
            beneficiaryBankRole: BENEFICIARY_BANK_ROLE_OPTIONS.ADVISING,
            applicableRules: APPLICABLE_RULES_OPTIONS.UCP_LATEST_VERSION,
            cargoIds: [],
            expiryPlace: 'London',
            availableWith: AVAILABLE_WITH_OPTIONS.ADVISING_BANK,
            availableBy: AVAILABLE_BY_OPTIONS.ACCEPTANCE,
            documentPresentationDeadlineDays: 21,
            templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT,
            freeTextLc: 'free text template',
            partialShipmentAllowed: false,
            transhipmentAllowed: false,
            comments: 'a comment',
            invoiceRequirement: INVOICE_REQUIREMENT_OPTIONS.EXHAUSTIVE
          }

          const {
            applicantAddress,
            applicantCountry,
            beneficiaryAddress,
            beneficiaryCountry,
            issuingBankAddress,
            issuingBankCountry,
            beneficiaryBankAddress,
            beneficiaryBankCountry,
            billOfLadingEndorsement,
            invoiceRequirement,
            ...expectedSubmitValues
          } = formValues

          const lcApp = shallow(<LetterOfCreditApplication {...testProps} submitLetterOfCredit={finalSubmit} />)

          const lcAppInstance = lcApp.instance() as LetterOfCreditApplication
          lcAppInstance.setState({
            formValues
          })

          lcAppInstance.handleSubmitLetterOfCredit()

          expect(finalSubmit).toHaveBeenCalledWith(expectedSubmitValues)
        })
      })
    })
  })
})
