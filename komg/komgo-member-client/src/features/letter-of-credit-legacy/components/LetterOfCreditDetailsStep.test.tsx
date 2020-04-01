import * as React from 'react'
import LetterOfCreditDetails, {
  LetterOfCreditDetailsStep,
  LetterOfCreditDetailsStepProps
} from './LetterOfCreditDetailsStep'
import { formikTestProps } from './ParticipantStep.test'
import * as renderer from 'react-test-renderer'
import { mount, shallow } from 'enzyme'
import { TEMPLATE_TYPE_OPTIONS, LOI_TYPE_OPTIONS, initialLetterOfCreditValues, STEP } from '../constants'
import { Checkbox } from 'semantic-ui-react'
import { Formik, Form, Field, ErrorMessage, FormikProvider } from 'formik'
import { Roles } from '../constants/roles'
import { LOIText } from '../constants/LetterOfIndemnityTemplate'
import { LetterOfCreditValues } from '../constants'
import { TRANSITION, Wizard, WizardStateMachine, WizardStateMachineEvent } from '../../../components/wizard'
import { findLabel } from '../constants/fieldsByStep'
import { initialStateMachineStates } from '../state-machines/ApplicationStateMachine'
import { LetterOfCreditViewStateMachine } from '../state-machines/ViewStateMachine'
import { render } from '@testing-library/react'

const testProps: LetterOfCreditDetailsStepProps = {
  formik: formikTestProps
}

describe('LetterOfCreditDetailsStep', () => {
  const originScrollTo = (global as any).scrollTo

  beforeEach(() => {
    ;(global as any).scrollTo = jest.fn()
  })

  afterEach(() => {
    ;(global as any).scrollTo = originScrollTo
  })
  describe('onChange', () => {
    it('sets expiryDate', () => {
      ;(global as any).scrollTo = jest.fn()

      const onSubmit = jest.fn()
      const onNext = jest.fn(() => ({}))
      const validator = jest.fn()
      const wrapper = mount(
        <Wizard
          initialValues={initialLetterOfCreditValues}
          onSubmit={onSubmit}
          onNext={onNext}
          validator={validator}
          validationSchemaKeyRef="http://komgo.io/letter-of-credit"
          fieldToLabel={findLabel}
          initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.LC_DETAILS })}
        >
          <Wizard.Page step={STEP.LC_DETAILS}>
            <LetterOfCreditDetails />
          </Wizard.Page>
        </Wizard>
      )
      const today = '2019-04-01'
      wrapper.find('input[name="expiryDate"]').simulate('change', { target: { value: today, name: 'expiryDate' } })
      expect(wrapper.find('input[name="expiryDate"]').prop('value')).toEqual(today)
      wrapper.find('button[name="next"]').simulate('click')
      const [[values, step]] = onNext.mock.calls as any
      expect(values).toEqual({
        LOI: LOIText,
        LOIAllowed: true,
        LOIType: 'KOMGO_LOI',
        amount: 0,
        applicableRules: 'UCP_LATEST_VERSION',
        applicantContactPerson: '',
        applicantId: '',
        availableBy: 'DEFERRED_PAYMENT',
        availableWith: 'IssuingBank',
        beneficiaryBankContactPerson: '',
        beneficiaryBankRole: 'AdvisingBank',
        beneficiaryContactPerson: '',
        billOfLadingEndorsement: 'IssuingBank',
        cargoIds: [],
        currency: 'USD',
        direct: true,
        documentPresentationDeadlineDays: 21,
        expiryPlace: 'IssuingBank',
        expiryDate: '2019-04-01',
        feesPayableBy: 'SPLIT',
        invoiceRequirement: 'EXHAUSTIVE',
        issueDueDateActive: false,
        issuingBankContactPerson: '',
        partialShipmentAllowed: true,
        templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT,
        transhipmentAllowed: false,
        type: 'IRREVOCABLE'
      })
      expect(step).toEqual(STEP.LC_DETAILS)
    })
  })

  it('disables Place of expiry if Komgo BFOET template is selected', () => {
    const wrapper = shallow(
      <LetterOfCreditDetailsStep
        formik={{
          ...testProps.formik,
          values: { ...testProps.formik.values, templateType: TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET }
        }}
      />
    )
    expect(wrapper.find({ name: 'expiryPlace' }).prop('disabled')).toEqual(true)
  })
  it('disables Available with if Komgo BFOET template is selected', () => {
    const wrapper = shallow(
      <LetterOfCreditDetailsStep
        formik={{
          ...testProps.formik,
          values: { ...testProps.formik.values, templateType: TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET }
        }}
      />
    )
    expect(wrapper.find({ name: 'availableWith' }).prop('disabled')).toEqual(true)
  })
  it('disables Available by if Komgo BFOET template is selected', () => {
    const wrapper = shallow(
      <LetterOfCreditDetailsStep
        formik={{
          ...testProps.formik,
          values: { ...testProps.formik.values, templateType: TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET }
        }}
      />
    )
    expect(wrapper.find({ name: 'availableBy' }).prop('disabled')).toEqual(true)
  })
  it('enables availableBy, expiryPlace, availableWith by default', () => {
    const wrapper = shallow(
      <LetterOfCreditDetailsStep
        formik={{
          ...testProps.formik,
          values: { ...testProps.formik.values, templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT }
        }}
      />
    )
    expect(wrapper.find({ name: 'availableBy' }).prop('disabled')).not.toEqual(true)
    expect(wrapper.find({ name: 'expiryPlace' }).prop('disabled')).not.toEqual(true)
    expect(wrapper.find({ name: 'availableWith' }).prop('disabled')).not.toEqual(true)
  })

  describe('availableWith with expiryPlace', () => {
    it('when beneficiaryBankId has been selected sync', () => {
      const setFieldValue = jest.fn()
      const wrapper = shallow(
        <LetterOfCreditDetailsStep
          formik={{
            ...testProps.formik,
            setFieldValue,
            values: {
              ...testProps.formik.values,
              templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT,
              beneficiaryBankId: 'beneficiaryBankId'
            }
          }}
        />
      )
      const value = Roles.ADVISING_BANK
      wrapper.find({ name: 'availableWith' }).prop('onChange')({}, { value })
      expect(setFieldValue).toHaveBeenCalledWith('availableWith', value)
      expect(setFieldValue).toHaveBeenCalledWith('expiryPlace', value)
    })

    it("when beneficiaryBankId hasn't been selected doesn't sync", () => {
      const setFieldValue = jest.fn()
      const wrapper = shallow(
        <LetterOfCreditDetailsStep
          formik={{
            ...testProps.formik,
            setFieldValue,
            values: {
              ...testProps.formik.values,
              templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT
            }
          }}
        />
      )
      const value = Roles.ISSUING_BANK
      wrapper.find({ name: 'availableWith' }).prop('onChange')({}, { value })
      expect(setFieldValue).toHaveBeenCalledWith('availableWith', value)
    })
  })

  describe('template type is KOMGO_BFOET', () => {
    it('matches snapshot with LOI fields shown', () => {
      const fakeFormik = {
        ...testProps.formik,
        values: { ...testProps.formik.values, templateType: TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET }
      }
      expect(
        render(
          <FormikProvider value={fakeFormik}>
            <LetterOfCreditDetailsStep formik={fakeFormik} />
          </FormikProvider>
        ).asFragment()
      ).toMatchSnapshot()
    })

    describe('GridTextController fields should have a value set', () => {
      const wrapper = shallow(
        <LetterOfCreditDetailsStep
          formik={{
            ...testProps.formik,
            values: { ...testProps.formik.values, templateType: TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET }
          }}
        />
      )

      expect(wrapper.find({ name: 'expiryDate' }).prop('value')).toBeUndefined()
      expect(wrapper.find({ name: 'expiryPlace' }).prop('value')).toBeDefined()
    })

    describe('LOIType field', () => {
      describe('customOnChange', () => {
        describe('when LOIType was FREE_TEXT and we are transitioning to KOMGO_LOI', () => {
          it('sets the LOI field to the initial form value (the komgo LOI template)', () => {
            const setFieldValue = jest.fn()
            const wrapper = shallow(
              <LetterOfCreditDetailsStep
                formik={{
                  ...testProps.formik,
                  values: {
                    ...testProps.formik.values,
                    templateType: TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET,
                    LOIType: LOI_TYPE_OPTIONS.FREE_TEXT
                  },
                  setFieldValue
                }}
              />
            )

            const customOnChange = wrapper.find({ name: 'LOIType' }).prop('customOnChange')

            customOnChange()

            expect(setFieldValue).toHaveBeenCalledWith('LOI', testProps.formik.initialValues.LOI)
          })
        })
        describe('when LOIType was KOMGO_LOI and we are transitioning to FREE_TEXT', () => {
          it('sets the LOI field to empty string', () => {
            const setFieldValue = jest.fn()
            const wrapper = shallow(
              <LetterOfCreditDetailsStep
                formik={{
                  ...testProps.formik,
                  values: {
                    ...testProps.formik.values,
                    templateType: TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET,
                    LOIType: LOI_TYPE_OPTIONS.KOMGO_LOI
                  },
                  setFieldValue
                }}
              />
            )

            const customOnChange = wrapper.find({ name: 'LOIType' }).prop('customOnChange')

            customOnChange()

            expect(setFieldValue).toHaveBeenCalledWith('LOI', '')
          })
        })
      })
    })
  })

  describe('template type is FREE_TEXT', () => {
    it('matches snapshot with LOI fields hidden', () => {
      const fakeFormik = {
        ...testProps.formik,
        values: { ...testProps.formik.values, templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT }
      }
      expect(
        render(
          <FormikProvider value={fakeFormik}>
            <LetterOfCreditDetailsStep formik={fakeFormik} />
          </FormikProvider>
        ).asFragment()
      ).toMatchSnapshot()
    })
  })
})
