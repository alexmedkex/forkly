import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { IssueForm, IssueFormProps } from '.'
import { buildFakeStandByLetterOfCredit, StandbyLetterOfCreditTaskType } from '@komgo/types'
import { mount, ReactWrapper } from 'enzyme'

const testProps: IssueFormProps = {
  standbyLetterOfCredit: {
    ...buildFakeStandByLetterOfCredit(),
    issuingBankReference: '',
    issuingBankPostalAddress: 'address'
  },
  onChange: () => null,
  beneficiaryIsMember: true,
  taskType: StandbyLetterOfCreditTaskType.ReviewRequested
}

describe('IssueForm', () => {
  let wrapper: ReactWrapper
  beforeEach(() => {
    wrapper = mount(<IssueForm {...testProps} />)
  })
  it('matches snapshot', () => {
    // snapshot of just approve/reject fields shown
    expect(renderer.create(<IssueForm {...testProps} />).toJSON()).toMatchSnapshot()
  })
  it('calls onChange when a value is changed', () => {
    const onChange = jest.fn()

    wrapper = mount(<IssueForm {...testProps} onChange={onChange} />)

    wrapper
      .find('[label="Reject application"]')
      .first()
      .simulate('click')

    expect(onChange).toHaveBeenCalled()
  })
  it('shows reference field if the reject application option is chosen', () => {
    expect(wrapper.find('[name="rejectionReference"]').length).toEqual(0)
    wrapper
      .find('[label="Reject application"]')
      .first()
      .simulate('click')

    expect(wrapper.find('[name="rejectionReference"]').length).not.toEqual(0)
  })
  it('shows reference field by default', () => {
    expect(wrapper.find('[name="standbyLetterOfCredit.issuingBankReference"]').length).not.toEqual(0)
  })
  it('displays the address field by default', () => {
    expect(wrapper.find('[name="standbyLetterOfCredit.issuingBankPostalAddress"]').length).not.toEqual(0)
  })
  it('displays the file upload option if the beneficiary is not a member of komgo', () => {
    wrapper = mount(<IssueForm {...testProps} beneficiaryIsMember={false} />)

    expect(wrapper.find('[name="issuanceDocument"]').length).not.toEqual(0)
  })
  it('updates the right field when standbyLetterOfCredit.issuingBankReference field has an onChange event', () => {
    wrapper
      .find('[label="Approve application"]')
      .first()
      .simulate('click')

    wrapper
      .find('[name="standbyLetterOfCredit.issuingBankReference"]')
      .find('input')
      .simulate('change', { target: { value: 'change', name: 'standbyLetterOfCredit.issuingBankReference' } })

    expect(
      wrapper
        .find('[name="standbyLetterOfCredit.issuingBankReference"]')
        .find('input')
        .prop('value')
    ).toEqual('change')
  })
  it('hides the file upload option if the beneficiary is a member of komgo', () => {
    expect(wrapper.find({ name: 'issuanceDocument' }).length).toEqual(0)
    wrapper
      .find('[label="Approve application"]')
      .first()
      .simulate('click')

    expect(wrapper.find({ name: 'issuanceDocument' }).length).toEqual(0)
  })
})
