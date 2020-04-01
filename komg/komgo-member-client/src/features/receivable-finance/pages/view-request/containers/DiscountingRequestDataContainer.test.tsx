import { buildFakeReceivablesDiscountingBase, IReceivablesDiscountingBase, RDStatus } from '@komgo/types'
import { shallow, ShallowWrapper } from 'enzyme'
import React from 'react'
import { ModalPrompt } from '../../../../../components/modal-prompt/ModalPrompt'
import DiscountingRequestData from '../../../../receivable-discounting-legacy/components/DiscountingRequestData'
import { ReceivableDiscountingApplicationActionType } from '../../../../receivable-discounting-legacy/store/application/types'
import { v4 as uuid4 } from 'uuid'
import { CachedDataProvider } from '../../../../../components/cached-data-provider'
import { ReceivablesDiscountingRole } from '../../../../receivable-discounting-legacy/utils/constants'
import { fakeRdInfo } from '../../../../receivable-discounting-legacy/utils/faker'
import {
  DiscountingRequestDataContainer,
  IDiscountingRequestDataContainerProps
} from './DiscountingRequestDataContainer'

describe('DiscountingRequestDataContainer', () => {
  let testProps: IDiscountingRequestDataContainerProps
  let wrapper: ShallowWrapper<DiscountingRequestDataContainer>
  let staticId: string

  describe('Cached DiscountingRequestData', () => {
    beforeEach(() => {
      staticId = uuid4()
      testProps = {
        role: ReceivablesDiscountingRole.Bank,
        discountingRequest: fakeRdInfo({ status: RDStatus.Requested, rd: { invoiceAmount: 1200, staticId } }),
        isAuthorized: jest.fn(() => true),
        submissionError: null,
        isSubmitting: false,
        clearError: jest.fn(),
        updateReceivablesDiscountingApplication: jest.fn(),
        fetchHistoryForRDData: jest.fn(),
        history: {},
        isLoadingHistory: false
      }
    })

    it('should not indicate a change if model is seen for the first time', () => {
      testProps.discountingRequest.rd.createdAt = '2019-01-01'
      wrapper = shallow(<DiscountingRequestDataContainer {...testProps} />)
      mountCache(wrapper)

      const rd = findRdData(wrapper)

      expect(rd.prop('open')).toBeTruthy()
      expect(rd.prop('changed')).toBeFalsy()
    })

    it('should indicate a change if model is seen and then changes', () => {
      testProps.discountingRequest.rd.createdAt = '2019-01-01'
      wrapper = shallow(<DiscountingRequestDataContainer {...testProps} />)
      mountCache(wrapper)

      wrapper.setProps({
        ...testProps,
        discountingRequest: fakeRdInfo({ rd: { createdAt: '2019-01-02', staticId } })
      } as any)
      const rd = findRdData(wrapper)

      expect(rd.prop('open')).toBeTruthy()
      expect(rd.prop('changed')).toBeTruthy()
    })

    it('should not indicate a change if model is seen and then seen again', () => {
      testProps.discountingRequest.rd.createdAt = '2019-01-01'
      wrapper = shallow(<DiscountingRequestDataContainer {...testProps} />)
      mountCache(wrapper)

      wrapper.setProps({
        ...testProps
      } as any)
      updateCache(wrapper)
      const rd = findRdData(wrapper)

      expect(rd.prop('open')).toBeTruthy()
      expect(rd.prop('changed')).toBeFalsy()
    })
  })

  describe('Bank', () => {
    beforeEach(() => {
      testProps = {
        role: ReceivablesDiscountingRole.Bank,
        discountingRequest: fakeRdInfo({
          status: RDStatus.Requested,
          rd: { invoiceAmount: 1200 }
        }),
        isAuthorized: jest.fn(() => true),
        submissionError: null,
        isSubmitting: false,
        clearError: jest.fn(),
        updateReceivablesDiscountingApplication: jest.fn(),
        history: {},
        isLoadingHistory: false,
        fetchHistoryForRDData: jest.fn()
      }
      wrapper = shallow(<DiscountingRequestDataContainer {...testProps} />)
    })

    it('opens the accordion if status is requested', () => {
      expect(findRdData(wrapper).prop('open')).toBeTruthy()
    })

    it('toggles accordion when clicked', () => {
      toggleAccordion(wrapper)

      expect(findRdData(wrapper).prop('open')).toBeFalsy()
    })

    it('is not editable', () => {
      expectNotEditable(wrapper)
    })
  })

  describe('Trader', () => {
    beforeEach(() => {
      testProps = {
        role: ReceivablesDiscountingRole.Trader,
        discountingRequest: fakeRdInfo({
          status: RDStatus.Requested,
          rd: { invoiceAmount: 1200 }
        }),
        isAuthorized: jest.fn(() => true),
        submissionError: null,
        isSubmitting: false,
        clearError: jest.fn(),
        updateReceivablesDiscountingApplication: jest.fn(),
        history: {},
        isLoadingHistory: false,
        fetchHistoryForRDData: jest.fn()
      }
      wrapper = shallow(<DiscountingRequestDataContainer {...testProps} />)
    })

    it('opens the accordion if status is requested', () => {
      expect(findRdData(wrapper).prop('open')).toBeTruthy()
    })

    it('opens the accordion if status is quote submitted', () => {
      testProps.discountingRequest.status = RDStatus.QuoteSubmitted

      wrapper = shallow(<DiscountingRequestDataContainer {...testProps} />)

      expect(findRdData(wrapper).prop('open')).toBeTruthy()
    })

    it('is not editable for RDStatus Requested', () => {
      expectNotEditable(wrapper)
    })

    it('is not editable for RDStatus QuoteSubmitted', () => {
      testProps.discountingRequest.status = RDStatus.QuoteSubmitted

      wrapper = shallow(<DiscountingRequestDataContainer {...testProps} />)

      expectNotEditable(wrapper)
    })

    it('is editable for RDStatus QuoteAccepted', () => {
      testProps.discountingRequest.status = RDStatus.QuoteAccepted

      wrapper = shallow(<DiscountingRequestDataContainer {...testProps} />)

      expectEditable(wrapper)
    })

    it('should swap to edit mode when edit is clicked', () => {
      clickEdit(wrapper)

      expect(findRdData(wrapper).prop('isEditing')).toBeTruthy()
    })

    it('should open accordion when edit is clicked', () => {
      clickEdit(wrapper)
      toggleAccordion(wrapper)

      clickEdit(wrapper)

      expect(findRdData(wrapper).prop('open')).toBeTruthy()
    })

    it('should remove edit mode when cancel is clicked if editing', () => {
      clickEdit(wrapper)

      clickCancel(wrapper)

      expect(findRdData(wrapper).prop('isEditing')).toBeFalsy()
    })

    it('should show modal while submitting', () => {
      wrapper = shallow(<DiscountingRequestDataContainer {...testProps} isSubmitting={true} />)

      expect(wrapper.find(ModalPrompt).prop('open')).toBeTruthy()
    })

    it('should show modal if an error occurs while submitting', () => {
      wrapper = shallow(<DiscountingRequestDataContainer {...testProps} submissionError={'error occurred'} />)

      expect(wrapper.find(ModalPrompt).prop('open')).toBeTruthy()
    })

    it('should show close modal and clear errors if confirm cancelled', () => {
      clickEdit(wrapper)
      clickCancelConfirm(wrapper)

      expect(wrapper.find(ModalPrompt).prop('open')).toBeFalsy()
      expect(testProps.clearError).toHaveBeenCalledTimes(2)
      expect(testProps.clearError).toHaveBeenCalledWith(
        ReceivableDiscountingApplicationActionType.SHARE_APPLICATION_REQUEST
      )
      expect(testProps.clearError).toHaveBeenCalledWith(
        ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_REQUEST
      )
    })

    it('should show close modal and clear errors if edit confirmed', () => {
      clickEdit(wrapper)
      clickConfirmSubmit(wrapper)

      expect(wrapper.find(ModalPrompt).prop('open')).toBeFalsy()
      expect(testProps.clearError).toHaveBeenCalledTimes(2)
      expect(testProps.clearError).toHaveBeenCalledWith(
        ReceivableDiscountingApplicationActionType.SHARE_APPLICATION_REQUEST
      )
      expect(testProps.clearError).toHaveBeenCalledWith(
        ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_REQUEST
      )
    })

    it('should dispatch updateRD', () => {
      const values = buildFakeReceivablesDiscountingBase()
      clickEdit(wrapper)
      clickSubmit(wrapper, values)

      clickConfirmSubmit(wrapper)

      expect(testProps.updateReceivablesDiscountingApplication).toHaveBeenCalledWith(
        values,
        testProps.discountingRequest.rd.staticId
      )
    })
  })
  function mountCache(wrapper: ShallowWrapper<DiscountingRequestDataContainer>) {
    wrapper
      .find(CachedDataProvider)
      .shallow()
      .instance()
      .componentDidMount()
  }
  function updateCache(wrapper: ShallowWrapper<DiscountingRequestDataContainer>) {
    const cache = wrapper.find(CachedDataProvider).shallow()
    cache.instance().componentDidUpdate(cache.state(), cache.props())
  }
  function findRdData(wrapper: ShallowWrapper<DiscountingRequestDataContainer>) {
    return wrapper
      .find(CachedDataProvider)
      .shallow()
      .find(DiscountingRequestData)
  }
  function clickCancel(wrapper: ShallowWrapper<DiscountingRequestDataContainer>) {
    findRdData(wrapper).prop('handleCancelClicked')()
  }
  function clickCancelConfirm(wrapper: ShallowWrapper<DiscountingRequestDataContainer>) {
    wrapper
      .find(ModalPrompt)
      .shallow()
      .find('[data-test-id="cancel-edit-request"]')
      .simulate('click')
  }
  function clickConfirmSubmit(wrapper: ShallowWrapper<DiscountingRequestDataContainer>) {
    wrapper
      .find(ModalPrompt)
      .shallow()
      .find('[data-test-id="confirm-edit-request"]')
      .simulate('click')
  }
  function clickEdit(wrapper: ShallowWrapper<DiscountingRequestDataContainer>) {
    findRdData(wrapper).prop('handleEditClicked')()
  }
  function clickSubmit(wrapper: ShallowWrapper<DiscountingRequestDataContainer>, values: IReceivablesDiscountingBase) {
    findRdData(wrapper).prop('handleSubmit')(values)
  }
  function expectNotEditable(wrapper: ShallowWrapper<DiscountingRequestDataContainer>) {
    expect(findRdData(wrapper).prop('editable')).toBeFalsy()
  }
  function expectEditable(wrapper: ShallowWrapper<DiscountingRequestDataContainer>) {
    expect(findRdData(wrapper).prop('editable')).toBeTruthy()
  }
  function toggleAccordion(wrapper: ShallowWrapper<DiscountingRequestDataContainer>) {
    findRdData(wrapper).prop('handleToggleAccordion')()
  }
})
