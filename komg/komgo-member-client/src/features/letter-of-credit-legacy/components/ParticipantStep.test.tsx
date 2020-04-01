import * as React from 'react'
import { GridDropdownController, CheckboxController } from './'
import { shallow } from 'enzyme'
import { ParticipantsStep, ParticipantStepProps } from './ParticipantsStep'
import { initialLetterOfCreditValues, LetterOfCreditValues, TEMPLATE_TYPE_OPTIONS } from '../constants'
import { IMember } from '../../members/store/types'
import { FormikContext } from 'formik'
import { Counterparty } from '../../counterparties/store/types'
import { fakeCounterparty, fakeMember } from '../utils/faker'

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
const counterparties: Counterparty[] = [
  fakeCounterparty({
    staticId: 'notABankId',
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'Not A Bank'
  }),
  fakeCounterparty({
    staticId: myStaticId,
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'My Trading Co'
  }),
  fakeCounterparty({
    staticId: 'anotherId',
    isMember: false,
    isFinancialInstitution: true,
    commonName: 'A Bank'
  }),
  /*fakeCounterparty({
    staticId: 'yetAnotherId',
    isMember: true,
    isFinancialInstitution: true,
    commonName: 'A Member Bank'
  }),*/
  fakeCounterparty({
    staticId: 'notABankIdAndNotAMemberId',
    isMember: false,
    isFinancialInstitution: false,
    commonName: 'Not A Bank And Not A Member'
  })
]

export const formikTestProps: FormikContext<LetterOfCreditValues> = {
  values: initialLetterOfCreditValues,
  errors: {},
  touched: {},
  isValidating: false,
  isSubmitting: false,
  submitCount: 0,
  setStatus: () => null,
  setError: () => null,
  setErrors: () => null,
  setSubmitting: () => null,
  setTouched: () => null,
  setValues: () => null,
  setFieldValue: () => null,
  setFieldTouched: () => null,
  setFieldError: () => null,
  validateForm: async () => ({}),
  validateField: async () => ({}),
  resetForm: () => null,
  submitForm: () => null,
  setFormikState: () => null,
  handleSubmit: () => null,
  handleReset: () => null,
  handleBlur: () => () => null,
  handleChange: () => () => null,
  dirty: false,
  isValid: true,
  initialValues: {
    ...initialLetterOfCreditValues,
    applicantId: myStaticId,
    templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT
  },
  registerField: () => null,
  unregisterField: () => null
}

const testProps: ParticipantStepProps = {
  formik: formikTestProps,
  counterparties,
  members,
  isLicenseEnabledForCompany: jest.fn(() => true),
  isLicenseEnabled: jest.fn(() => true)
}

describe('ParticipantStep', () => {
  describe('beneficiary name', () => {
    it('is a dropdown', () => {
      const participantStep = shallow(<ParticipantsStep {...testProps} />)

      expect(participantStep.find({ name: 'beneficiaryId' }).prop('component')).toEqual(GridDropdownController)
    })
  })
  describe('direct', () => {
    it('is a checkbox', () => {
      const participantStep = shallow(<ParticipantsStep {...testProps} />)

      expect(participantStep.find({ name: 'direct' }).prop('component')).toEqual(CheckboxController)
    })
  })
  describe('beneficiaryBankCountry', () => {
    it('is not shown initially', () => {
      const participantStep = shallow(<ParticipantsStep {...testProps} />)
      expect(participantStep.find({ name: 'beneficiaryBankCountry' }).length).toEqual(0)
    })
    it('is shown if direct is false', () => {
      const participantStep = shallow(
        <ParticipantsStep
          {...testProps}
          formik={{ ...testProps.formik, values: { ...testProps.formik.values, direct: false } }}
        />
      )
      expect(participantStep.find({ name: 'beneficiaryBankCountry' }).length).toEqual(1)
    })
  })
  describe('applicantAddress', () => {
    it('is disabled for editing on the letter of credit form', () => {
      const participantStep = shallow(<ParticipantsStep {...testProps} />)

      expect(participantStep.find({ name: 'applicantAddress' }).prop('disabled')).toEqual(true)
    })
  })
  describe('beneficiaryCountry', () => {
    it('is disabled for editing on the letter of credit form', () => {
      const participantStep = shallow(<ParticipantsStep {...testProps} />)

      expect(participantStep.find({ name: 'beneficiaryCountry' }).prop('disabled')).toEqual(true)
    })
  })
  describe('beneficiaryId', () => {
    it('is disabled for edit if an initial value is given', () => {
      const participantStep = shallow(
        <ParticipantsStep
          {...testProps}
          formik={{ ...testProps.formik, initialValues: { ...testProps.formik.initialValues, beneficiaryId: '123' } }}
        />
      )
      expect(participantStep.find({ name: 'beneficiaryId' }).prop('disabled')).toEqual(true)
    })
    it('is enabled if initial value is empty string', () => {
      const participantStep = shallow(<ParticipantsStep {...testProps} />)
      expect(participantStep.find({ name: 'beneficiaryId' }).prop('disabled')).toEqual(undefined)
    })
  })
  describe('applicantAddress', () => {
    it('is disabled for editing on the letter of credit form', () => {
      const participantStep = shallow(<ParticipantsStep {...testProps} />)

      expect(participantStep.find({ name: 'applicantAddress' }).prop('disabled')).toEqual(true)
    })
  })
  describe('beneficiaryCountry', () => {
    it('is disabled for editing on the letter of credit form', () => {
      const participantStep = shallow(<ParticipantsStep {...testProps} />)

      expect(participantStep.find({ name: 'beneficiaryCountry' }).prop('disabled')).toEqual(true)
    })
  })
  describe('beneficiaryId', () => {
    it('is disabled for edit if an initial value is given', () => {
      const participantStep = shallow(
        <ParticipantsStep
          {...testProps}
          formik={{ ...testProps.formik, initialValues: { ...testProps.formik.initialValues, beneficiaryId: '123' } }}
        />
      )
      expect(participantStep.find({ name: 'beneficiaryId' }).prop('disabled')).toEqual(true)
    })
    it('is enabled if initial value is undefined', () => {
      const participantStep = shallow(<ParticipantsStep {...testProps} />)
      expect(participantStep.find({ name: 'beneficiaryId' }).prop('disabled')).toEqual(undefined)
    })
  })
  describe('beneficiaryBankId', () => {
    describe('dropdown options', () => {
      it('only consists of banks which are komgo counterparties if beneficiary is a komgo member', () => {
        const participantStep = shallow(
          <ParticipantsStep
            {...testProps}
            formik={{
              ...testProps.formik,
              values: { ...testProps.formik.values, beneficiaryId: 'notABankId', direct: false }
            }}
          />
        )
        expect(participantStep.find({ name: 'beneficiaryBankId' }).prop('options')).toEqual([
          { content: 'A Bank', text: 'A Bank', value: 'anotherId' },
          { content: 'A Member Bank', text: 'A Member Bank', value: 'yetAnotherId' }
        ])
      })
      it('contains all banks if beneficiary is not a komgo member', () => {
        const participantStep = shallow(
          <ParticipantsStep
            {...testProps}
            formik={{
              ...testProps.formik,
              values: { ...testProps.formik.values, beneficiaryId: 'notABankIdAndNotAMemberId', direct: false }
            }}
          />
        )
        expect(participantStep.find({ name: 'beneficiaryBankId' }).prop('options').length).toEqual(2)
      })
    })
  })
  describe('issuingBankId', () => {
    describe('dropdown options', () => {
      describe('filling in the form (e.g. fields not disabled)', () => {
        it('comes from counterparties if set', () => {
          const participantStep = shallow(
            <ParticipantsStep
              {...testProps}
              disabled={false}
              counterparties={[
                fakeCounterparty({
                  staticId: '123',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'A Counterparty Bank'
                }),
                fakeCounterparty({
                  staticId: '1234',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'Another Counterparty Bank'
                })
              ]}
              members={[
                fakeMember({
                  staticId: '123',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'A Member Bank'
                }),
                fakeMember({
                  staticId: '1234',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'A Member Bank'
                }),
                fakeMember({
                  staticId: '12345',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'A Member Bank'
                })
              ]}
            />
          )

          expect(participantStep.find({ name: 'issuingBankId' }).prop('options')).toEqual([
            { content: 'A Counterparty Bank', text: 'A Counterparty Bank', value: '123' },
            { content: 'Another Counterparty Bank', text: 'Another Counterparty Bank', value: '1234' }
          ])
        })
        it('does not come from members', () => {
          const participantStep = shallow(
            <ParticipantsStep
              {...testProps}
              disabled={false}
              members={[
                fakeMember({
                  staticId: '123',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'A Member Bank'
                }),
                fakeMember({
                  staticId: '1234',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'A Member Bank'
                })
              ]}
            />
          )

          expect(participantStep.find({ name: 'issuingBankId' }).prop('options')).toEqual([])
        })
      })
      describe('viewing the form (e.g. fields are disabled)', () => {
        it('does come from members', () => {
          const participantStep = shallow(
            <ParticipantsStep
              {...testProps}
              disabled={true}
              members={[
                fakeMember({
                  staticId: '123',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'A Member Bank'
                }),
                fakeMember({
                  staticId: '1234',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'Another Member Bank'
                })
              ]}
              counterparties={[
                fakeCounterparty({
                  staticId: '123',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'A Counterparty Bank'
                }),
                fakeCounterparty({
                  staticId: '1234',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'A Counterparty Bank'
                }),
                fakeCounterparty({
                  staticId: '12345',
                  isMember: true,
                  isFinancialInstitution: true,
                  commonName: 'A Counterparty Bank'
                })
              ]}
            />
          )

          expect(participantStep.find({ name: 'issuingBankId' }).prop('options')).toEqual([
            { content: 'A Member Bank', text: 'A Member Bank', value: '123' },
            { content: 'Another Member Bank', text: 'Another Member Bank', value: '1234' }
          ])
        })
      })
      describe('GridTextController fields should have a value set', () => {
        const wrapper = shallow(<ParticipantsStep {...testProps} />)
        expect(wrapper.find({ name: 'applicantCN' }).prop('value')).toBeDefined()
        expect(wrapper.find({ name: 'applicantAddress' }).prop('value')).toBeUndefined()
        expect(wrapper.find({ name: 'beneficiaryAddress' }).prop('value')).toBeDefined()
        expect(wrapper.find({ name: 'beneficiaryCountry' }).prop('value')).toBeDefined()
        expect(wrapper.find({ name: 'applicantContactPerson' }).prop('value')).toBeDefined()
        expect(wrapper.find({ name: 'beneficiaryContactPerson' }).prop('value')).toBeDefined()
        expect(wrapper.find({ name: 'issuingBankAddress' }).prop('value')).toBeDefined()
        expect(wrapper.find({ name: 'issuingBankCountry' }).prop('value')).toBeDefined()
        expect(wrapper.find({ name: 'issuingBankContactPerson' }).prop('value')).toBeDefined()
        expect(wrapper.find({ name: 'issuingBankCountry' }).prop('value')).toBeDefined()
      })
    })
  })
})
