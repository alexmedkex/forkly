import { RDStatus, buildFakeQuote, IQuoteBase } from '@komgo/types'
import { shallow, ShallowWrapper } from 'enzyme'
import React from 'react'
import { ModalPrompt } from '../../../../../components/modal-prompt/ModalPrompt'
import { ReceivablesDiscountingRole } from '../../../../receivable-discounting-legacy/utils/constants'
import { fakeRdInfo } from '../../../../receivable-discounting-legacy/utils/faker'
import { IAcceptedQuoteDateContainerProps, AcceptedQuoteDataContainer } from './AcceptedQuoteDataContainer'
import { LoadingTransition } from '../../../../../components'
import AcceptedQuoteData from '../../../../receivable-discounting-legacy/components/AcceptedQuoteData'
import { CachedDataProvider } from '../../../../../components/cached-data-provider'

const QUOTE_ID = '123'
describe('AcceptedQuoteDataContainer', () => {
  let testProps: IAcceptedQuoteDateContainerProps

  const staticId: string = '123'

  describe('Trader', () => {
    let wrapper: ShallowWrapper<AcceptedQuoteDataContainer>
    beforeEach(() => {
      testProps = {
        role: ReceivablesDiscountingRole.Trader,
        discountingRequest: fakeRdInfo({ status: RDStatus.Requested, rd: { invoiceAmount: 1200, staticId } }),
        isAuthorized: jest.fn(() => true),
        submissionError: null,
        isSubmitting: false,
        clearError: jest.fn(),
        updateAcceptedQuote: jest.fn(),
        fetchSingleQuote: jest.fn(),
        comment: '',
        replyDate: new Date().toISOString(),
        quote: undefined,
        quoteId: QUOTE_ID,
        isFetching: false,
        agreedTermsHistory: {},
        fetchHistoryForAgreedTerms: jest.fn()
      }
    })

    it('will display a loading transition if the quote is not fetched', () => {
      wrapper = shallow(<AcceptedQuoteDataContainer {...testProps} />)
      expect(wrapper.find(LoadingTransition).exists()).toBeTruthy()
    })

    it('will display Quote details if the quote has been fetched', () => {
      const props = { ...testProps, quote: buildFakeQuote() }
      wrapper = shallow(<AcceptedQuoteDataContainer {...props} />)
      expect(wrapper.find(LoadingTransition).exists()).toBeFalsy()
      expect(findAcceptedQuoteData(wrapper).exists()).toBeTruthy()
    })

    it('is not editable in accepted state', () => {
      const props = { ...testProps, quote: buildFakeQuote() }
      props.discountingRequest.status = RDStatus.QuoteAccepted
      wrapper = shallow(<AcceptedQuoteDataContainer {...props} />)

      expectNotEditable(wrapper)
    })
  })

  describe('Bank', () => {
    let wrapper: ShallowWrapper<AcceptedQuoteDataContainer>
    beforeEach(() => {
      testProps = {
        role: ReceivablesDiscountingRole.Bank,
        discountingRequest: fakeRdInfo({ status: RDStatus.QuoteAccepted, rd: { invoiceAmount: 1200, staticId } }),
        isAuthorized: jest.fn(() => true),
        submissionError: null,
        isSubmitting: false,
        clearError: jest.fn(),
        updateAcceptedQuote: jest.fn(),
        fetchSingleQuote: jest.fn(),
        comment: '',
        replyDate: new Date().toISOString(),
        quote: buildFakeQuote(),
        quoteId: QUOTE_ID,
        isFetching: false,
        agreedTermsHistory: {},
        fetchHistoryForAgreedTerms: jest.fn()
      }
    })

    it('will display a loading transition if the quote is not fetched', () => {
      const props = { ...testProps, quote: undefined }
      wrapper = shallow(<AcceptedQuoteDataContainer {...props} />)
      expect(wrapper.find(LoadingTransition).exists()).toBeTruthy()
    })

    it('will display Quote details if the quote has been fetched', () => {
      wrapper = shallow(<AcceptedQuoteDataContainer {...testProps} />)

      expect(wrapper.find(LoadingTransition).exists()).toBeFalsy()
      expect(findAcceptedQuoteData(wrapper).exists()).toBeTruthy()
    })

    it('is editable in accepted state', () => {
      const props = { ...testProps, quote: buildFakeQuote() }
      props.discountingRequest.status = RDStatus.QuoteAccepted
      wrapper = shallow(<AcceptedQuoteDataContainer {...props} />)

      expectEditable(wrapper)
    })

    it('should open accordion when edit is clicked', () => {
      clickEdit(wrapper)
      toggleAccordion(wrapper)

      clickEdit(wrapper)

      expect(findAcceptedQuoteData(wrapper).prop('open')).toBeTruthy()
    })

    it('should remove edit mode when cancel is clicked if editing', () => {
      clickEdit(wrapper)

      clickCancel(wrapper)

      expect(findAcceptedQuoteData(wrapper).prop('isEditing')).toBeFalsy()
    })

    it('should show modal while submitting', () => {
      wrapper = shallow(<AcceptedQuoteDataContainer {...testProps} isSubmitting={true} />)

      expect(wrapper.find(ModalPrompt).prop('open')).toBeTruthy()
    })

    it('should show modal if an error occurs while submitting', () => {
      wrapper = shallow(<AcceptedQuoteDataContainer {...testProps} submissionError={'error occurred'} />)

      expect(wrapper.find(ModalPrompt).prop('open')).toBeTruthy()
    })

    it('should dispatch update quote', () => {
      wrapper = shallow(<AcceptedQuoteDataContainer {...testProps} />)
      const values = buildFakeQuote()
      clickEdit(wrapper)
      clickSubmit(wrapper, values)

      clickConfirmSubmit(wrapper)

      expect(testProps.updateAcceptedQuote).toHaveBeenCalledWith(values, QUOTE_ID)
    })
  })
})

function clickConfirmSubmit(wrapper: ShallowWrapper<AcceptedQuoteDataContainer>) {
  wrapper
    .find(ModalPrompt)
    .shallow()
    .find('[data-test-id="confirm-edit-request"]')
    .simulate('click')
}

function clickEdit(wrapper: ShallowWrapper<AcceptedQuoteDataContainer>) {
  findAcceptedQuoteData(wrapper).prop('handleEditClicked')()
}

function clickCancel(wrapper: ShallowWrapper<AcceptedQuoteDataContainer>) {
  findAcceptedQuoteData(wrapper).prop('handleCancelClicked')()
}

function clickSubmit(wrapper: ShallowWrapper<AcceptedQuoteDataContainer>, values: IQuoteBase) {
  findAcceptedQuoteData(wrapper).prop('handleSubmit')(values)
}

function toggleAccordion(wrapper: ShallowWrapper<AcceptedQuoteDataContainer>) {
  findAcceptedQuoteData(wrapper).prop('handleToggleAccordion')()
}

function findAcceptedQuoteData(wrapper: ShallowWrapper<AcceptedQuoteDataContainer>) {
  return wrapper
    .find(CachedDataProvider)
    .shallow()
    .find(AcceptedQuoteData)
}
function expectNotEditable(wrapper: ShallowWrapper<AcceptedQuoteDataContainer>) {
  expect(findAcceptedQuoteData(wrapper).prop('editable')).toBeFalsy()
}

function expectEditable(wrapper: ShallowWrapper<AcceptedQuoteDataContainer>) {
  expect(findAcceptedQuoteData(wrapper).prop('editable')).toBeTruthy()
}
