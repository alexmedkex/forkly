import * as React from 'react'
import { shallow, mount } from 'enzyme'
import { ViewStandbyLetterOfCredit, IProps } from './ViewStandbyLetterOfCredit'
import { createMemoryHistory } from 'history'
import uuid from 'uuid'
import { buildFakeStandByLetterOfCredit, StandbyLetterOfCreditTaskType } from '@komgo/types'
import { fakeMember } from '../../letter-of-credit-legacy/utils/faker'
import { buildFakeError } from '../../../store/common/faker'
import { StandbyLetterOfCreditActionType } from '../store/types'
import { Formik } from 'formik'

const standbyLetterOfCreditId = uuid.v4()

const testProps: IProps = {
  history: createMemoryHistory(),
  location: {
    pathname: '',
    search: '',
    state: '',
    hash: ''
  },
  match: {
    isExact: true,
    path: '',
    url: '',
    params: { id: standbyLetterOfCreditId }
  },
  isAuthorized: () => true,
  isLicenseEnabled: () => true,
  isLicenseEnabledForCompany: () => true,
  staticContext: null,
  errors: [],
  isFetching: false,
  banks: [],
  standbyLetterOfCreditId,
  getStandbyLetterOfCredit: () => null,
  standbyLetterOfCredit: {
    ...buildFakeStandByLetterOfCredit(),
    issuingBankReference: '',
    issuingBankPostalAddress: 'abc'
  },
  issueStandbyLetterOfCredit: () => null,
  taskType: StandbyLetterOfCreditTaskType.ReviewRequested,
  getTasks: () => null,
  isSubmitting: false,
  submitErrors: [],
  clearError: () => null,
  applicant: fakeMember({ commonName: 'applicant' }),
  beneficiary: fakeMember({ commonName: 'beneficiary' }),
  documents: [],
  fetchSBLCDocuments: () => null,
  rejectStandbyLetterOfCreditRequest: () => null
}

describe('ViewStandbyLetterOfCredit', () => {
  // it('matches snapshot') RR TODO LATER - right now would be v annyoing to update

  it('should render Unauthorized', () => {
    const wrapper = shallow(<ViewStandbyLetterOfCredit {...testProps} isAuthorized={jest.fn(() => false)} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should render LoadingTransition', () => {
    const wrapper = shallow(<ViewStandbyLetterOfCredit {...testProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')

    expect(loadingTransition.length).toBe(1)
  })

  it('should find FullpageModal', () => {
    const wrapper = shallow(<ViewStandbyLetterOfCredit {...testProps} />)

    const fullPageModal = wrapper.find('FullpageModal')

    expect(fullPageModal.length).toBe(1)
  })

  it('should find StandbyLetterOfCreditDetails', () => {
    const wrapper = shallow(<ViewStandbyLetterOfCredit {...testProps} />)

    const fullPageModal = wrapper.find('StandbyLetterOfCreditDetails')

    expect(fullPageModal.length).toBe(1)
  })

  it('should set sblc in preview', () => {
    const wrapper = shallow(<ViewStandbyLetterOfCredit {...testProps} />)

    expect(wrapper.state('values').standbyLetterOfCredit).toEqual(testProps.standbyLetterOfCredit)
  })
  it('calls getStandbyLetterOfCredit getTasks props with the correct args when mounted', () => {
    const getStandbyLetterOfCredit = jest.fn()
    const getTasks = jest.fn()
    shallow(
      <ViewStandbyLetterOfCredit
        {...testProps}
        getStandbyLetterOfCredit={getStandbyLetterOfCredit}
        getTasks={getTasks}
      />
    )

    expect(getStandbyLetterOfCredit).toHaveBeenCalledWith(standbyLetterOfCreditId)
    expect(getTasks).toHaveBeenCalled()
  })
  it('calls clearErrors with submission actions when component unmounted', () => {
    const clearError = jest.fn()
    const wrapper = shallow(<ViewStandbyLetterOfCredit {...testProps} clearError={clearError} />)
    expect(clearError).not.toHaveBeenCalled()

    wrapper.unmount()

    expect(clearError).toHaveBeenCalledTimes(2)
    expect(clearError).toHaveBeenCalledWith(StandbyLetterOfCreditActionType.ISSUE_STANDBY_LETTER_OF_CREDIT_REQUEST)
    expect(clearError).toHaveBeenCalledWith(StandbyLetterOfCreditActionType.REJECT_STANDBY_LETTER_OF_CREDIT_REQUEST)
  })

  describe('without task', () => {
    it('shows a close button instead of submit response', () => {
      const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} taskType={null} />)

      expect(wrapper.find('button[data-test-id="submit-application-button"]').length).toEqual(0)
      expect(wrapper.find('button[data-test-id="close-view-sblc"]').length).toEqual(1)
    })
    it('does not have a formik object', () => {
      const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} taskType={null} />)

      expect(wrapper.find(Formik).length).toEqual(0)
    })
    it('displays the issuing bank address if there is one', () => {
      const issuingBankPostalAddress = uuid.v4()
      const wrapper = mount(
        <ViewStandbyLetterOfCredit
          {...testProps}
          taskType={null}
          standbyLetterOfCredit={buildFakeStandByLetterOfCredit({ issuingBankPostalAddress })}
        />
      )

      expect(wrapper.find('span[data-test-id="interactive_field_issuingBankPostalAddress"]').text()).toEqual(
        issuingBankPostalAddress
      )
    })
    it('displays the issuing bank reference if there is one', () => {
      const issuingBankReference = uuid.v4()

      const wrapper = mount(
        <ViewStandbyLetterOfCredit
          {...testProps}
          taskType={null}
          standbyLetterOfCredit={buildFakeStandByLetterOfCredit({ issuingBankReference })}
        />
      )

      expect(wrapper.find('span[data-test-id="interactive_field_issuingBankReference"]').text()).toEqual(
        issuingBankReference
      )
    })
  })
  describe('for StandbyLetterOfCreditTaskType.ReviewRequested task', () => {
    it('disables submit response button by default', () => {
      const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} />)

      expect(wrapper.find('button[data-test-id="submit-application-button"]').prop('disabled')).toEqual(true)
    })
    describe('rejection flow', () => {
      it('enables submit response button when rejection is chosen and reference is entered', () => {
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} />)

        wrapper
          .find({ label: 'Reject application' })
          .first()
          .simulate('click')

        wrapper
          .find('input[name="rejectionReference"]')
          .simulate('change', { target: { value: 'id-123', name: 'rejectionReference' } })

        expect(
          wrapper
            .find('[data-test-id="submit-application-button"]')
            .first()
            .prop('disabled')
        ).toEqual(false)
      })
      it('enables submit response button when no reference entered', () => {
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} />)

        wrapper
          .find({ label: 'Reject application' })
          .first()
          .simulate('click')

        expect(
          wrapper
            .find('[data-test-id="submit-application-button"]')
            .first()
            .prop('disabled')
        ).toEqual(false)
      })
      it('does not update the document preview when internal reference is updated', () => {
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} />)
        wrapper
          .find({ label: 'Reject application' })
          .first()
          .simulate('click')
        const issuingBankReference = uuid.v4()
        wrapper.find('input[name="rejectionReference"]').simulate('change', {
          target: { value: issuingBankReference, name: 'rejectionReference' }
        })

        setTimeout(() => {
          expect(wrapper.find('a[id="preview_issuingBankReference"]').text()).toEqual(issuingBankReference)
        }, 0)
      })
    })

    it('calls rejectStandbyLetterOfCreditRequest with correct args when you click submit response', () => {
      const rejectStandbyLetterOfCreditRequest = jest.fn()
      const wrapper = mount(
        <ViewStandbyLetterOfCredit
          {...testProps}
          rejectStandbyLetterOfCreditRequest={rejectStandbyLetterOfCreditRequest}
        />
      )
      wrapper
        .find('[label="Reject application"]')
        .first()
        .simulate('click')

      wrapper
        .find('[data-test-id="submit-application-button"]')
        .first()
        .simulate('click')
      wrapper
        .find('[data-test-id="submit-confirm-button"]')
        .first()
        .simulate('click')

      expect(rejectStandbyLetterOfCreditRequest).toHaveBeenCalledWith(testProps.standbyLetterOfCredit.staticId, '')
    })
    it('calls rejectStandbyLetterOfCreditRequest with optional ref when you add it', () => {
      const rejectStandbyLetterOfCreditRequest = jest.fn()
      const wrapper = mount(
        <ViewStandbyLetterOfCredit
          {...testProps}
          rejectStandbyLetterOfCreditRequest={rejectStandbyLetterOfCreditRequest}
        />
      )
      wrapper
        .find({ label: 'Reject application' })
        .first()
        .simulate('click')

      const rejectionReference = uuid.v4()

      wrapper.find('input[name="rejectionReference"]').simulate('change', {
        target: { value: rejectionReference, name: 'rejectionReference' }
      })

      wrapper
        .find('[data-test-id="submit-application-button"]')
        .first()
        .simulate('click')
      wrapper
        .find('[data-test-id="submit-confirm-button"]')
        .first()
        .simulate('click')

      expect(rejectStandbyLetterOfCreditRequest).toHaveBeenCalledWith(
        testProps.standbyLetterOfCredit.staticId,
        rejectionReference
      )
    })

    describe('approval flow for a member beneficiary', () => {
      it('does not enable submit response button when no reference entered', () => {
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} />)

        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')

        expect(
          wrapper
            .find('[data-test-id="submit-application-button"]')
            .first()
            .prop('disabled')
        ).toEqual(true)
      })
      it('disables submit response button if postal address is empty', () => {
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} />)

        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')

        wrapper
          .find('input[name="standbyLetterOfCredit.issuingBankReference"]')
          .simulate('change', { target: { value: 'id-123', name: 'standbyLetterOfCredit.issuingBankReference' } })

        wrapper.find('textarea[name="standbyLetterOfCredit.issuingBankPostalAddress"]').simulate('change', {
          target: { value: '', name: 'standbyLetterOfCredit.issuingBankPostalAddress' }
        })

        expect(
          wrapper
            .find('[data-test-id="submit-application-button"]')
            .first()
            .prop('disabled')
        ).toEqual(true)
      })
      it('enables submit response button when rejection is chosen and reference is entered', () => {
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} />)

        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')

        wrapper
          .find('input[name="standbyLetterOfCredit.issuingBankReference"]')
          .simulate('change', { target: { value: 'id-123', name: 'standbyLetterOfCredit.issuingBankReference' } })

        expect(
          wrapper
            .find('[data-test-id="submit-application-button"]')
            .first()
            .prop('disabled')
        ).toEqual(false)
      })
      it('calls issueStandbyLetterOfCredit when you click submit response without a document', () => {
        const issueStandbyLetterOfCredit = jest.fn()
        const wrapper = mount(
          <ViewStandbyLetterOfCredit {...testProps} issueStandbyLetterOfCredit={issueStandbyLetterOfCredit} />
        )
        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')
        const issuingBankReference = uuid.v4()
        wrapper.find('input[name="standbyLetterOfCredit.issuingBankReference"]').simulate('change', {
          target: { value: issuingBankReference, name: 'standbyLetterOfCredit.issuingBankReference' }
        })
        wrapper
          .find('[data-test-id="submit-application-button"]')
          .first()
          .simulate('click')
        wrapper
          .find('[data-test-id="submit-confirm-button"]')
          .first()
          .simulate('click')
        expect(issueStandbyLetterOfCredit.mock.calls[0][0]).toEqual({
          ...testProps.standbyLetterOfCredit,
          issuingBankReference
        })
        expect(issueStandbyLetterOfCredit.mock.calls[0][1]).toEqual(null)
      })
      it('updates the document preview when internal reference is updated', () => {
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} />)
        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')
        const issuingBankReference = uuid.v4()
        wrapper.find('input[name="standbyLetterOfCredit.issuingBankReference"]').simulate('change', {
          target: { value: issuingBankReference, name: 'standbyLetterOfCredit.issuingBankReference' }
        })

        setTimeout(() => {
          expect(wrapper.find('a[id="preview_issuingBankReference"]').text()).toEqual(issuingBankReference)
        }, 0)
      })
      it('starts the issuing bank postal address with the value from the standbyLetterOfCredit.issuingBankPostalAddress field', () => {
        const issuingBankPostalAddress = uuid.v4()
        const sblc = buildFakeStandByLetterOfCredit({ issuingBankPostalAddress })
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} standbyLetterOfCredit={sblc} />)
        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')

        expect(wrapper.find('textarea[name="standbyLetterOfCredit.issuingBankPostalAddress"]').text()).toEqual(
          issuingBankPostalAddress
        )
        setTimeout(() => {
          expect(wrapper.find('label[id="preview_issuingBankPostalAddress"]').text()).toEqual(issuingBankPostalAddress)
        }, 0)
      })
      it('updates the document preview when issuing bank postal address is updated', () => {
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} />)
        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')
        const postalAddress = uuid.v4()

        wrapper.find('textarea[name="standbyLetterOfCredit.issuingBankPostalAddress"]').simulate('change', {
          target: { value: postalAddress, name: 'standbyLetterOfCredit.issuingBankPostalAddress' }
        })

        setTimeout(() => {
          expect(wrapper.find('label[id="preview_issuingBankPostalAddress"]').text()).toEqual(postalAddress)
        }, 0)
      })
    })

    describe('approval flow for a non-member beneficiary', () => {
      it('disables submit without a file provided', () => {
        const wrapper = mount(
          <ViewStandbyLetterOfCredit {...testProps} beneficiary={fakeMember({ isMember: false })} />
        )

        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')

        wrapper
          .find({ name: 'standbyLetterOfCredit.issuingBankReference' })
          .first()
          .simulate('change', { target: { value: 'id-123', name: 'standbyLetterOfCredit.issuingBankReference' } })

        expect(
          wrapper
            .find('[data-test-id="submit-application-button"]')
            .first()
            .prop('disabled')
        ).toEqual(true)
      })
      it('disables submit response button if postal address is empty', () => {
        const wrapper = mount(
          <ViewStandbyLetterOfCredit {...testProps} beneficiary={fakeMember({ isMember: false })} />
        )

        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')

        wrapper
          .find('input[name="standbyLetterOfCredit.issuingBankReference"]')
          .simulate('change', { target: { value: 'id-123', name: 'standbyLetterOfCredit.issuingBankReference' } })

        const file = new File(['dummy content'], 'fakeFile.png', { type: 'image/png' })
        wrapper
          .find({ id: 'file-upload' })
          .find('input')
          .simulate('change', { target: { files: [file] } })

        wrapper.find('textarea[name="standbyLetterOfCredit.issuingBankPostalAddress"]').simulate('change', {
          target: { value: '', name: 'standbyLetterOfCredit.issuingBankPostalAddress' }
        })

        expect(
          wrapper
            .find('[data-test-id="submit-application-button"]')
            .first()
            .prop('disabled')
        ).toEqual(true)
      })
      it('enables submit with a file provided', () => {
        const wrapper = mount(
          <ViewStandbyLetterOfCredit {...testProps} beneficiary={fakeMember({ isMember: false })} />
        )

        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')

        wrapper
          .find('input[name="standbyLetterOfCredit.issuingBankReference"]')
          .simulate('change', { target: { value: 'id-123', name: 'standbyLetterOfCredit.issuingBankReference' } })

        const file = new File(['dummy content'], 'fakeFile.png', { type: 'image/png' })
        wrapper
          .find({ id: 'file-upload' })
          .find('input')
          .simulate('change', { target: { files: [file] } })

        expect(
          wrapper
            .find('[data-test-id="submit-application-button"]')
            .first()
            .prop('disabled')
        ).toEqual(false)
      })
      it('opens the confirmation modal when you click submit response', () => {
        const wrapper = mount(
          <ViewStandbyLetterOfCredit {...testProps} beneficiary={fakeMember({ isMember: false })} />
        )
        expect(wrapper.find('[data-test-id="submit-confirm-button"]').length).toEqual(0)
        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')
        wrapper
          .find('input[name="standbyLetterOfCredit.issuingBankReference"]')
          .simulate('change', { target: { value: 'id-123', name: 'standbyLetterOfCredit.issuingBankReference' } })
        const file = new File(['dummy content'], 'fakeFile.png', { type: 'image/png' })
        wrapper
          .find({ id: 'file-upload' })
          .find('input')
          .simulate('change', { target: { files: [file] } })
        wrapper
          .find('[data-test-id="submit-application-button"]')
          .first()
          .simulate('click')
        expect(wrapper.find('[data-test-id="submit-confirm-button"]').length).not.toEqual(0)
      })
      it('calls issueStandbyLetterOfCredit when you click submit response with a document', () => {
        const issueStandbyLetterOfCredit = jest.fn()
        const wrapper = mount(
          <ViewStandbyLetterOfCredit
            {...testProps}
            beneficiary={fakeMember({ isMember: false })}
            issueStandbyLetterOfCredit={issueStandbyLetterOfCredit}
          />
        )
        wrapper
          .find({ label: 'Approve application' })
          .first()
          .simulate('click')
        const issuingBankReference = uuid.v4()
        wrapper.find('input[name="standbyLetterOfCredit.issuingBankReference"]').simulate('change', {
          target: { value: issuingBankReference, name: 'standbyLetterOfCredit.issuingBankReference' }
        })
        const file = new File(['dummy content'], 'fakeFile.png', { type: 'image/png' })
        wrapper
          .find({ id: 'file-upload' })
          .find('input')
          .simulate('change', { target: { files: [file] } })
        wrapper
          .find('[data-test-id="submit-application-button"]')
          .first()
          .simulate('click')
        wrapper
          .find('[data-test-id="submit-confirm-button"]')
          .first()
          .simulate('click')
        expect(issueStandbyLetterOfCredit.mock.calls[0][0]).toEqual({
          ...testProps.standbyLetterOfCredit,
          issuingBankReference
        })
        expect(issueStandbyLetterOfCredit.mock.calls[0][1]).toBeDefined()
      })
    })
    describe('confirm modal', () => {
      it('shows loading if we are submitting', () => {
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} isSubmitting={true} />)

        wrapper
          .find({ label: 'Reject application' })
          .first()
          .simulate('click')

        expect(wrapper.find('[data-test-id="loadingTransition"]').length).toEqual(0)

        wrapper
          .find('[data-test-id="submit-application-button"]')
          .first()
          .simulate('click')

        expect(wrapper.find('[data-test-id="loadingTransition"]').length).not.toEqual(0)
      })
      it('shows error if we return submision error', () => {
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} submitErrors={[buildFakeError()]} />)

        wrapper
          .find({ label: 'Reject application' })
          .first()
          .simulate('click')

        expect(wrapper.find('[data-test-id="errorMessage"]').length).toEqual(0)

        wrapper
          .find('[data-test-id="submit-application-button"]')
          .first()
          .simulate('click')

        expect(wrapper.find('[data-test-id="errorMessage"]').length).not.toEqual(0)
      })
      it('calls clearErrors with submission actions when submission modal closed', () => {
        const clearError = jest.fn()
        const wrapper = mount(<ViewStandbyLetterOfCredit {...testProps} clearError={clearError} />)

        wrapper
          .find({ label: 'Reject application' })
          .first()
          .simulate('click')

        wrapper
          .find('[data-test-id="submit-application-button"]')
          .first()
          .simulate('click')

        expect(clearError).not.toHaveBeenCalled()

        wrapper
          .find('[data-test-id="submit-cancel-button"]')
          .first()
          .simulate('click')

        expect(clearError).toHaveBeenCalledTimes(2)
        expect(clearError).toHaveBeenCalledWith(StandbyLetterOfCreditActionType.ISSUE_STANDBY_LETTER_OF_CREDIT_REQUEST)
        expect(clearError).toHaveBeenCalledWith(StandbyLetterOfCreditActionType.REJECT_STANDBY_LETTER_OF_CREDIT_REQUEST)
      })
    })
  })
})
