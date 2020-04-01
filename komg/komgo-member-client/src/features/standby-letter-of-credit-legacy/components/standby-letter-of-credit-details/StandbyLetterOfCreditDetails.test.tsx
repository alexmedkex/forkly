import * as React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import StandbyLetterOfCreditDetails, { AdditionalInfo, SblcInfoGroup } from './StandbyLetterOfCreditDetails'
import { buildFakeStandByLetterOfCredit } from '@komgo/types'
import { fakeMember, fakeDocument } from '../../../letter-of-credit-legacy/utils/faker'
import { Document } from '../../../document-management'

jest.mock('../../../document-management/utils/downloadDocument', () => ({
  initiateFileDownload: jest.fn()
}))

import { initiateFileDownload } from '../../../document-management/utils/downloadDocument'

describe('StandbyLetterOfCreditDetails', () => {
  let defaultProps
  beforeEach(() => {
    const beneficiary = fakeMember({ staticId: '123' })
    const applicant = fakeMember({ staticId: '1234' })
    defaultProps = {
      standbyLetterOfCredit: buildFakeStandByLetterOfCredit({ beneficiaryId: '123', applicantId: '1234' }),
      applicant,
      beneficiary,
      documents: []
    }
  })

  it('should match snapshot when beneficiary is komgo member', () => {
    const tree = renderer.create(<StandbyLetterOfCreditDetails {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match snapshot when beneficiary is not komgo member', () => {
    const members = [{ ...defaultProps.beneficiary, isMember: false }]
    const tree = renderer.create(<StandbyLetterOfCreditDetails {...defaultProps} members={members} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should find AdditionalInfo when additionalInformation exits', () => {
    const wrapper = shallow(<StandbyLetterOfCreditDetails {...defaultProps} />)

    const additionalInfo = wrapper.find(AdditionalInfo)

    expect(additionalInfo.length).toBe(1)
  })

  it('should not find AdditionalInfo when additionalInformation do not exits', () => {
    const sblc = { ...defaultProps.standbyLetterOfCredit, additionalInformation: '' }
    const wrapper = shallow(<StandbyLetterOfCreditDetails {...defaultProps} standbyLetterOfCredit={sblc} />)

    const additionalInfo = wrapper.find(AdditionalInfo)

    expect(additionalInfo.length).toBe(0)
  })

  it('should find 3 SblcInfoGroup when issuingBankReference exists', () => {
    const wrapper = shallow(<StandbyLetterOfCreditDetails {...defaultProps} />)

    const sblcInfoGroup = wrapper.find(SblcInfoGroup)

    expect(sblcInfoGroup.length).toBe(3)
  })

  it('should find 2 SblcInfoGroup when issuingBankReference exists', () => {
    const sblc = { ...defaultProps.standbyLetterOfCredit, issuingBankReference: '' }
    const wrapper = shallow(<StandbyLetterOfCreditDetails {...defaultProps} standbyLetterOfCredit={sblc} />)

    const sblcInfoGroup = wrapper.find(SblcInfoGroup)

    expect(sblcInfoGroup.length).toBe(2)
  })

  it('should find sblc document if exists', () => {
    const sblc = buildFakeStandByLetterOfCredit({ beneficiaryId: '123', applicantId: '1234', documentHash: '222' })
    const document = { hash: '222', name: 'Test' } as Document
    const wrapper = shallow(
      <StandbyLetterOfCreditDetails
        {...defaultProps}
        beneficiary={{ ...defaultProps.beneficiary, isMember: false }}
        standbyLetterOfCredit={sblc}
        documents={[document]}
      />
    )

    const sblcDocument = wrapper.find({ 'data-test-id': 'issuanceDocument' })

    expect(sblcDocument.length).toBe(1)
  })

  it('should download document when button is clicked', () => {
    const sblc = buildFakeStandByLetterOfCredit({ beneficiaryId: '123', applicantId: '1234', documentHash: '222' })
    const document = { ...fakeDocument(), hash: '222' }
    const wrapper = shallow(
      <StandbyLetterOfCreditDetails
        {...defaultProps}
        beneficiary={{ ...defaultProps.beneficiary, isMember: false }}
        standbyLetterOfCredit={sblc}
        documents={[document]}
      />
    )

    const sblcDocument = wrapper.find({ 'data-test-id': 'issuanceDocument' })
    sblcDocument.simulate('click')

    expect(initiateFileDownload).toHaveBeenCalled()
  })
})
