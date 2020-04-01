import * as React from 'react'
import { shallow } from 'enzyme'
import { ReviewRequestedDiscrepancies } from './ReviewRequestedDiscrepancies'
import { fakeLetterOfCreditEnriched, fakePresentation, fakeTask } from '../../utils/faker'
import { LetterOfCreditTaskType } from '../../constants/taskType'
import ReviewRequestedDiscrepanciesForm, {
  Response
} from '../../components/presentation/ReviewRequestedDiscrepanciesForm'

describe('ReviewRequestedDiscrepancies', () => {
  let defaultProps
  const task = fakeTask({
    context: { lcid: '123', lcPresentationStaticId: '1234' },
    type: LetterOfCreditTaskType.REVIEW_PRESENTATION_DISCREPANCIES
  })

  beforeEach(() => {
    defaultProps = {
      task,
      letterOfCredit: fakeLetterOfCreditEnriched(),
      presentation: fakePresentation({ staticId: '123' }),
      members: [],
      isSubmittingResponse: false,
      submittingResponseError: [],
      errors: [],
      isFetching: false,
      getLetterOfCredit: jest.fn(),
      setTaskInModal: jest.fn(),
      acceptRequestedDiscrepancies: jest.fn(),
      rejectRequestedDiscrepancies: jest.fn(),
      clearError: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepancies {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call getLetterOfCredit when task exists', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepancies {...defaultProps} />)

    expect(defaultProps.getLetterOfCredit).toHaveBeenCalled()
  })

  it('should not call getLetterOfCredit when task does not exist', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepancies {...defaultProps} task={null} />)

    expect(defaultProps.getLetterOfCredit).not.toHaveBeenCalled()
  })

  it('should call acceptRequestedDiscrepancies when discrepancies are accepted', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepancies {...defaultProps} task={null} />)

    const instance = wrapper.instance() as ReviewRequestedDiscrepancies

    instance.handleSubmit(Response.Accept, 'Test')

    expect(defaultProps.acceptRequestedDiscrepancies).toHaveBeenCalledWith(
      defaultProps.presentation,
      defaultProps.letterOfCredit._id,
      { comment: 'Test' }
    )
    expect(defaultProps.rejectRequestedDiscrepancies).not.toHaveBeenCalled()
  })

  it('should call rejectRequestedDiscrepancies when discrepancies are rejected', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepancies {...defaultProps} />)

    const instance = wrapper.instance() as ReviewRequestedDiscrepancies

    instance.handleSubmit(Response.Reject, 'Test')

    expect(defaultProps.rejectRequestedDiscrepancies).toHaveBeenCalledWith(
      defaultProps.presentation,
      defaultProps.letterOfCredit._id,
      { comment: 'Test' }
    )
    expect(defaultProps.acceptRequestedDiscrepancies).not.toHaveBeenCalled()
  })

  it('should call setTaskInModal when closeModal is called', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepancies {...defaultProps} />)

    const instance = wrapper.instance() as ReviewRequestedDiscrepancies

    instance.closeModal()

    expect(defaultProps.setTaskInModal).toHaveBeenCalledWith(null)
  })

  it('should call clearError when closeModal is called if error exists', () => {
    const wrapper = shallow(
      <ReviewRequestedDiscrepancies {...defaultProps} submittingResponseError={[{ message: 'Test' }]} />
    )

    const instance = wrapper.instance() as ReviewRequestedDiscrepancies

    instance.closeModal()

    expect(defaultProps.clearError).toHaveBeenCalledTimes(2)
  })
})
