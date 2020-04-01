import * as React from 'react'
import { ReviewLcAmendmentTaskProps, ReviewLcAmendmentTask } from './ReviewLcAmendmentTask'
import { buildFakeAmendment } from '@komgo/types'
import { createMemoryHistory } from 'history'
import { MemoryRouter as Router } from 'react-router-dom'
import * as renderer from 'react-test-renderer'
import { shallow, mount } from 'enzyme'
import { Button, Checkbox } from 'semantic-ui-react'
import { LoadingTransition, ErrorMessage } from '../../../components'
import { LetterOfCreditAmendmentActionType } from '../store/amendments/types'

const testProps: ReviewLcAmendmentTaskProps = {
  clearError: () => null,
  amendment: buildFakeAmendment(),
  history: createMemoryHistory(),
  location: {
    pathname: '',
    search: '',
    state: '',
    hash: ''
  },
  getLetterOfCreditAmendment: () => null,
  rejectLetterOfCreditAmendmentRequest: () => null,
  issueLetterOfCreditAmendmentRequest: () => null,
  match: {
    isExact: false,
    path: '',
    url: '',
    params: { amendmentId: 'E1243' }
  },
  staticContext: undefined,
  errors: [],
  isFetching: false,
  requesting: false,
  decisionErrors: []
}
describe('LetterOfCreditAmendmentView', () => {
  it('shows an error if there is one', () => {
    expect(
      renderer
        .create(
          <Router>
            <ReviewLcAmendmentTask
              {...testProps}
              errors={[{ message: 'oh no', errorCode: '1', requestId: 'abc', origin: 'origin' }]}
            />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
  it('shows the loader if it is loading', () => {
    expect(
      renderer
        .create(
          <Router>
            <ReviewLcAmendmentTask {...testProps} isFetching={true} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
  it('shows the amendment summary when loaded', () => {
    const wrapper = mount(<ReviewLcAmendmentTask {...testProps} />)
    // react test renderer couldn't handle a modal
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('calls getLetterOfCreditAmendment with the id given in match params', () => {
    const getLetterOfCreditAmendment = jest.fn()
    shallow(<ReviewLcAmendmentTask {...testProps} getLetterOfCreditAmendment={getLetterOfCreditAmendment} />)

    expect(getLetterOfCreditAmendment).toHaveBeenCalledWith(testProps.match.params.amendmentId)
  })
  it('enables submit when deny option is chosen', () => {
    const wrapper = mount(<ReviewLcAmendmentTask {...testProps} />)

    wrapper
      .find({ 'data-test-id': 'decisionRadio' })
      .find({ label: 'Deny' })
      .find(Checkbox)
      .simulate('click')

    expect(
      wrapper
        .find({ 'data-test-id': 'submitDecision' })
        .find(Button)
        .prop('disabled')
    ).toEqual(false)
  })
  it('shows comment box when deny option is chosen', () => {
    const wrapper = mount(<ReviewLcAmendmentTask {...testProps} />)
    wrapper
      .find({ 'data-test-id': 'decisionRadio' })
      .find({ label: 'Deny' })
      .find(Checkbox)
      .simulate('click')

    expect(wrapper.find({ 'data-test-id': 'denyCommentBox' }).find('textarea').length).toEqual(1)
  })
  it('keeps submit disabled when accept option is chosen', () => {
    const wrapper = mount(<ReviewLcAmendmentTask {...testProps} />)
    wrapper
      .find({ 'data-test-id': 'decisionRadio' })
      .find({ label: 'Approve' })
      .find(Checkbox)
      .simulate('click')

    expect(
      wrapper
        .find({ 'data-test-id': 'submitDecision' })
        .find(Button)
        .prop('disabled')
    ).toEqual(true)
  })
  it('enables submit when accept option chosen and file added', () => {
    const wrapper = mount(<ReviewLcAmendmentTask {...testProps} />)
    wrapper
      .find({ 'data-test-id': 'decisionRadio' })
      .find({ label: 'Approve' })
      .find(Checkbox)
      .simulate('click')

    wrapper
      .find({ id: 'file-upload' })
      .find('input')
      .simulate('change', {
        target: {
          files: [{ name: 'dummyFile' }]
        }
      })

    expect(
      wrapper
        .find({ 'data-test-id': 'submitDecision' })
        .find(Button)
        .prop('disabled')
    ).toEqual(false)
  })
  it('calls rejectLetterOfCreditAmendmentRequest when deny option is chosen and submit is pressed', done => {
    const rejectLetterOfCreditAmendmentRequest = jest.fn()
    const wrapper = mount(
      <ReviewLcAmendmentTask
        {...testProps}
        rejectLetterOfCreditAmendmentRequest={rejectLetterOfCreditAmendmentRequest}
      />
    )

    wrapper
      .find({ 'data-test-id': 'decisionRadio' })
      .find({ label: 'Deny' })
      .find(Checkbox)
      .simulate('click')

    wrapper
      .find({ 'data-test-id': 'submitDecision' })
      .find('button')
      .simulate('click')

    setTimeout(() => {
      expect(rejectLetterOfCreditAmendmentRequest).toHaveBeenCalledWith(testProps.amendment.staticId, { comment: '' })
      done()
    })
  })
  it('calls rejectLetterOfCreditAmendmentRequest with comment when deny option is chosen and submit is pressed', done => {
    const rejectLetterOfCreditAmendmentRequest = jest.fn()
    const wrapper = mount(
      <ReviewLcAmendmentTask
        {...testProps}
        rejectLetterOfCreditAmendmentRequest={rejectLetterOfCreditAmendmentRequest}
      />
    )

    const comment = 'my comment'

    wrapper
      .find({ 'data-test-id': 'decisionRadio' })
      .find({ label: 'Deny' })
      .find(Checkbox)
      .simulate('click')

    wrapper
      .find('textarea')
      .find({ name: 'comment' })
      .simulate('change', { target: { value: comment, name: 'comment' } })

    wrapper
      .find({ 'data-test-id': 'submitDecision' })
      .find(Button)
      .simulate('click')

    setTimeout(() => {
      expect(rejectLetterOfCreditAmendmentRequest).toHaveBeenCalledWith(testProps.amendment.staticId, { comment })
      done()
    })
  })
  it('calls issueLetterOfCreditAmendmentRequest with file when accept option is chosen, file uploaded, and submit pressed', done => {
    const issueLetterOfCreditAmendmentRequest = jest.fn()

    const wrapper = mount(
      <ReviewLcAmendmentTask {...testProps} issueLetterOfCreditAmendmentRequest={issueLetterOfCreditAmendmentRequest} />
    )

    wrapper
      .find({ 'data-test-id': 'decisionRadio' })
      .find({ label: 'Approve' })
      .find(Checkbox)
      .simulate('click')

    const file = new File(['dummy content'], 'fakeFile.png', { type: 'image/png' })
    wrapper
      .find({ id: 'file-upload' })
      .find('input')
      .simulate('change', { target: { files: [file] } })

    wrapper
      .find({ 'data-test-id': 'submitDecision' })
      .find(Button)
      .simulate('click')

    setTimeout(() => {
      expect(issueLetterOfCreditAmendmentRequest.mock.calls[0][0]).toEqual(testProps.amendment.staticId)
      expect(issueLetterOfCreditAmendmentRequest.mock.calls[0][1]).toBeDefined()
      done()
    })
  })
  it('shows loader if requesting prop is true', () => {
    const wrapper = mount(<ReviewLcAmendmentTask {...testProps} requesting={true} />)

    expect(wrapper.find(LoadingTransition).length).toEqual(1)
  })
  it('shows decisionErrors if found', () => {
    const wrapper = mount(
      <ReviewLcAmendmentTask
        {...testProps}
        decisionErrors={[{ message: 'hi', errorCode: '1', requestId: 'abc', origin: 'home' }]}
      />
    )

    expect(wrapper.find(ErrorMessage).length).toEqual(1)
  })
  it('clears calls clearError for all submission errors on unmount', () => {
    const clearError = jest.fn()
    const wrapper = mount(<ReviewLcAmendmentTask {...testProps} clearError={clearError} />)

    expect(clearError).not.toHaveBeenCalled()
    wrapper.unmount()
    expect(clearError).toHaveBeenCalledTimes(2)
    expect(clearError).toHaveBeenCalledWith(LetterOfCreditAmendmentActionType.REJECT_AMENDMENT_REQUEST)
    expect(clearError).toHaveBeenCalledWith(LetterOfCreditAmendmentActionType.ISSUE_AMENDMENT_REQUEST)
  })
})
