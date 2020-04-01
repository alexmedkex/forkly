import * as React from 'react'
import { shallow, mount } from 'enzyme'
import { Wizard, WizardProps, TRANSITION, SUBMIT_APPLICATION } from './Wizard'
import {
  STEP,
  initialLetterOfCreditValues,
  LetterOfCreditValues
} from '../../features/letter-of-credit-legacy/constants'
import { sentenceCase } from '../../utils/casings'
import { List, Button } from 'semantic-ui-react'
import { findLabel } from '../../features/letter-of-credit-legacy/constants/fieldsByStep'
import { LetterOfCreditViewStateMachine } from '../../features/letter-of-credit-legacy/state-machines/ViewStateMachine'
import { Ajv } from 'ajv'

const globalAny: any = global
globalAny.scrollTo = jest.fn()

const setFieldValue = jest.fn()
const setTouched = jest.fn()
const setErrors = jest.fn()
const nextFunc = jest.fn()

const testProps: WizardProps<LetterOfCreditValues> = {
  initialValues: initialLetterOfCreditValues,
  onSubmit: jest.fn(),
  validator: {
    validate: jest.fn(),
    compile: jest.fn(),
    compileAsync: jest.fn(),
    addSchema: jest.fn(),
    addMetaSchema: jest.fn(),
    validateSchema: jest.fn(),
    getSchema: jest.fn(),
    removeSchema: jest.fn(),
    addFormat: jest.fn(),
    addKeyword: jest.fn(),
    getKeyword: jest.fn(),
    removeKeyword: jest.fn(),
    errorsText: jest.fn()
  },
  validationSchemaKeyRef: '',
  fieldToLabel: findLabel,
  submitting: false,
  initialStateMachine: LetterOfCreditViewStateMachine()
}

describe('Wizard', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('begins on the initial flow state', () => {
    const wizardInstance = shallow(<Wizard {...testProps} />).instance() as Wizard<LetterOfCreditValues>

    expect(wizardInstance.stateMachine.valueOf().step).toEqual(STEP.SUMMARY_OF_TRADE)
  })
  describe('next', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      nextFunc.mockReturnValue({})
    })
    it('changes step to next one in flow', () => {
      const wizard = shallow(<Wizard {...testProps} />)
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      wizardInstance.next(initialLetterOfCreditValues, setTouched, setFieldValue, setErrors)()
      const stateMachine = wizardInstance.stateMachine.valueOf()

      expect(stateMachine.step).toEqual(stateMachine.states![STEP.SUMMARY_OF_TRADE].on[TRANSITION.NEXT])
    })
    it('does not change when there are errors in the form', () => {
      const wizard = shallow(<Wizard {...testProps} />)
      wizard.setState({ errors: { badField: 'error' } })
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      wizardInstance.next(initialLetterOfCreditValues, setTouched, setFieldValue, setErrors)()

      expect(wizardInstance.stateMachine.valueOf().step).toEqual(STEP.SUMMARY_OF_TRADE)
    })
    it('scrolls to top of screen', () => {
      globalAny.scrollTo = jest.fn()
      const wizard = shallow(<Wizard {...testProps} />)
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      wizardInstance.next(initialLetterOfCreditValues, setTouched, setFieldValue, setErrors)()

      expect(globalAny.scrollTo).toHaveBeenCalledWith(0, 0)
    })
    it('calls setTouched with an object with keys as summary of trades fields and values as true by default', () => {
      const wizard = shallow(<Wizard {...testProps} />)
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      wizardInstance.next(initialLetterOfCreditValues, setTouched, setFieldValue, setErrors)()

      expect(setTouched).toHaveBeenCalledWith({ tradeId: true })
    })
    it('calls setTouched with with an object with keys as participants fields and values as true on participants step', () => {
      const wizard = shallow(
        <Wizard {...testProps} initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.PARTICIPANTS })} />
      )
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      wizardInstance.next(initialLetterOfCreditValues, setTouched, setFieldValue, setErrors)()

      expect(setTouched).toHaveBeenCalledWith({
        applicantAddress: true,
        applicantContactPerson: true,
        applicantCountry: true,
        applicantId: true,
        beneficiaryAddress: true,
        beneficiaryBankAddress: true,
        beneficiaryBankContactPerson: true,
        beneficiaryBankCountry: true,
        beneficiaryBankId: true,
        beneficiaryBankRole: true,
        beneficiaryContactPerson: true,
        beneficiaryCountry: true,
        beneficiaryId: true,
        direct: true,
        feesPayableBy: true,
        issuingBankAddress: true,
        issuingBankContactPerson: true,
        issuingBankCountry: true,
        issuingBankId: true
      })
    })
    it('calls onNext if supplied with correct arguments', () => {
      const wizard = shallow(
        <Wizard
          {...testProps}
          initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.PARTICIPANTS })}
          onNext={nextFunc}
        />
      )
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      expect(nextFunc).not.toHaveBeenCalled()

      wizardInstance.next(initialLetterOfCreditValues, setTouched, setFieldValue, setErrors)()

      expect(nextFunc).toHaveBeenCalledWith(initialLetterOfCreditValues, STEP.PARTICIPANTS, setFieldValue)
    })
    it('sets error on state from onNext in formik and blocks next step', () => {
      const error = { blah: 'blah blah blah' }
      nextFunc.mockReturnValueOnce(error)

      const wizard = shallow(
        <Wizard
          {...testProps}
          initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.PARTICIPANTS })}
          onNext={nextFunc}
        />
      )
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      wizardInstance.next(initialLetterOfCreditValues, setTouched, setFieldValue, setErrors)()

      expect(wizard.state().onNextErrors).toEqual(error)

      const stateMachine = wizardInstance.stateMachine.valueOf()

      expect(stateMachine.step).toEqual(STEP.PARTICIPANTS)
    })
    it('unsets onNextErrors if no errors returned, and allows transition to next step', () => {
      const error = { blah: 'blah blah blah' }

      const wizard = shallow(
        <Wizard
          {...testProps}
          initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.PARTICIPANTS })}
          onNext={nextFunc}
        />
      )

      wizard.setState({ onNextErrors: error })

      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      wizardInstance.next(initialLetterOfCreditValues, setTouched, setFieldValue, setErrors)()

      const stateMachine = wizardInstance.stateMachine.valueOf()

      expect(wizard.state().onNextErrors).toEqual({})

      expect(stateMachine.step).toEqual(stateMachine.states![STEP.PARTICIPANTS].on[TRANSITION.NEXT])
    })
    it('calls setErrors with onNextErrors and formik errors combined if onNextErrors are there', () => {
      const nextError = { next: 'blah blah blah' }
      const formikValidationError = { schema: 'err err err' }

      nextFunc.mockReturnValueOnce(nextError)

      const wizard = shallow(
        <Wizard
          {...testProps}
          initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.PARTICIPANTS })}
          onNext={nextFunc}
        />
      )

      wizard.setState({ errors: formikValidationError }, () => {
        const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

        wizardInstance.next(initialLetterOfCreditValues, setTouched, setFieldValue, setErrors)()

        expect(setErrors).toHaveBeenCalledWith({ ...nextError, ...formikValidationError })
      })
    })
    it('calls setErrors with just formik errors if we have errors but no onNextErrors', () => {
      const formikValidationError = { schema: 'err err err' }

      const wizard = shallow(
        <Wizard
          {...testProps}
          initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.PARTICIPANTS })}
          onNext={nextFunc}
        />
      )

      wizard.setState({ errors: formikValidationError }, () => {
        const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

        wizardInstance.next(initialLetterOfCreditValues, setTouched, setFieldValue, setErrors)()

        expect(setErrors).toHaveBeenCalledWith(formikValidationError)
      })
    })
    it('works using the button', () => {
      const wizard = mount(<Wizard {...testProps} />)
      wizard.find({ content: 'Next' }).simulate('click')
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      expect(wizardInstance.stateMachine.valueOf().step).toEqual(STEP.CARGO_MOVEMENTS)
    })
    it('works twice using the button', () => {
      const wizard = mount(<Wizard {...testProps} />)
      wizard
        .find({ content: 'Next' })
        .simulate('click')
        .simulate('click')

      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      expect(wizardInstance.stateMachine.valueOf().step).toEqual(STEP.PARTICIPANTS)
    })
  })

  describe('previous', () => {
    it('changes step to previous one in flow', () => {
      const wizard = shallow(
        <Wizard {...testProps} initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.REVIEW })} />
      )
      const touched = {}
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      wizardInstance.previous(initialLetterOfCreditValues, touched)()

      expect(wizardInstance.stateMachine.valueOf().step).toEqual(
        wizardInstance.stateMachine.valueOf().states![STEP.REVIEW].on[TRANSITION.PREVIOUS]
      )
    })
    it('does not change if there are errors on touched fields', () => {
      const wizard = shallow(<Wizard {...testProps} />)
      const touched = { documentPresentationDeadlineDays: true }

      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>
      wizard.setState({ step: STEP.LC_DETAILS, errors: { documentPresentationDeadlineDays: 'error' } })

      wizardInstance.previous(initialLetterOfCreditValues, touched)()

      expect(wizard.state().step).toEqual(STEP.LC_DETAILS)
    })
    it('changes if there are errors on untouched fields', () => {
      const wizard = shallow(
        <Wizard {...testProps} initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.LC_DETAILS })} />
      )
      const touched = {}

      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>
      wizard.setState({ step: STEP.LC_DETAILS, errors: { documentPresentationDeadlineDays: 'error' } })

      wizardInstance.previous(initialLetterOfCreditValues, touched)()

      expect(wizardInstance.stateMachine.valueOf().step).toEqual(STEP.LC_TYPE)
    })
    it('clears errors if step is changed', () => {
      const wizard = shallow(<Wizard {...testProps} />)
      const touched = {}

      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>
      wizard.setState({ step: STEP.LC_DETAILS, errors: { documentPresentationDeadlineDays: 'error' } })

      wizardInstance.previous(initialLetterOfCreditValues, touched)()

      expect(wizard.state().errors).toEqual({})
    })
    it('scrolls to top of screen', () => {
      globalAny.scrollTo = jest.fn()
      const touched = {}

      const wizard = shallow(<Wizard {...testProps} />)
      wizard.setState({ step: STEP.REVIEW })

      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      wizardInstance.previous(initialLetterOfCreditValues, touched)()

      expect(globalAny.scrollTo).toHaveBeenCalledWith(0, 0)
    })
  })

  describe('validate', () => {
    beforeEach(() => {
      const validator: Ajv = testProps.validator as Ajv
      validator.validate = jest.fn().mockReturnValue(true)
      validator.errors = []
    })
    it('calls validator.validate', async () => {
      const validator: Ajv = testProps.validator as Ajv
      const wizard = shallow(<Wizard {...testProps} />)
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      await wizardInstance.validate(initialLetterOfCreditValues)

      expect(validator.validate).toHaveBeenCalled()
    })
    it('throws errors', async done => {
      const validator: Ajv = testProps.validator as Ajv
      validator.validate = jest.fn().mockReturnValue(false)
      validator.errors = [
        {
          keyword: 'enum',
          dataPath: '.feesPayableBy',
          schemaPath: '#/properties/feesPayableBy/enum',
          params: {
            allowedValues: ['APPLICANT', 'BENEFICIARY', 'SPLIT']
          },
          message: 'should be equal to one of the allowed values'
        }
      ]

      const wizard = shallow(
        <Wizard {...testProps} initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.PARTICIPANTS })} />
      )
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      try {
        await wizardInstance.validate(initialLetterOfCreditValues)
      } catch (e) {
        expect(e).toEqual({
          feesPayableBy:
            "'feesPayableBy' should be equal to one of the allowed values (APPLICANT or BENEFICIARY or SPLIT)"
        })
        done()
      }
    })
    it('clears errors state if validation passes', async () => {
      const wizard = shallow(<Wizard {...testProps} />)
      wizard.setState({ errors: { err: 'or' } })
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      await wizardInstance.validate(initialLetterOfCreditValues)

      expect(wizard.state().errors).toEqual({})
    })
    it('sets errors state if validation fails', async done => {
      const validator: Ajv = testProps.validator as Ajv
      validator.validate = jest.fn().mockReturnValue(false)
      validator.errors = [
        {
          keyword: 'enum',
          dataPath: '.feesPayableBy',
          schemaPath: '#/properties/feesPayableBy/enum',
          params: {
            allowedValues: ['APPLICANT', 'BENEFICIARY', 'SPLIT']
          },
          message: 'should be equal to one of the allowed values'
        }
      ]

      const wizard = shallow(
        <Wizard {...testProps} initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.PARTICIPANTS })} />
      )
      const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

      try {
        await wizardInstance.validate(initialLetterOfCreditValues)
      } catch {
        expect(wizard.state().errors).toEqual({
          feesPayableBy:
            "'feesPayableBy' should be equal to one of the allowed values (APPLICANT or BENEFICIARY or SPLIT)"
        })
        done()
      }
    })
    it('throws errors including onNextErrors and errors if validation fails', async done => {
      const validator: Ajv = testProps.validator as Ajv
      validator.validate = jest.fn().mockReturnValue(false)
      validator.errors = [
        {
          keyword: 'enum',
          dataPath: '.feesPayableBy',
          schemaPath: '#/properties/feesPayableBy/enum',
          params: {
            allowedValues: ['APPLICANT', 'BENEFICIARY', 'SPLIT']
          },
          message: 'should be equal to one of the allowed values'
        }
      ]

      const onNextErrors = { next: 'error' }

      const wizard = shallow(
        <Wizard {...testProps} initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.PARTICIPANTS })} />
      )

      wizard.setState({ onNextErrors }, async () => {
        const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

        try {
          await wizardInstance.validate(initialLetterOfCreditValues)
        } catch (e) {
          expect(e).toEqual({
            feesPayableBy:
              "'feesPayableBy' should be equal to one of the allowed values (APPLICANT or BENEFICIARY or SPLIT)",
            ...onNextErrors
          })
          done()
        }
      })
    })
    it('throws onNextErrors if validator validations pass', async done => {
      const wizard = shallow(<Wizard {...testProps} />)
      const onNextErrors = { next: 'error' }

      wizard.setState({ onNextErrors }, async () => {
        const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

        try {
          await wizardInstance.validate(initialLetterOfCreditValues)
        } catch (e) {
          expect(e).toEqual(onNextErrors)
          done()
        }
      })
    })
  })

  describe('list of stages', () => {
    it('displays all steps', () => {
      const wizard = shallow(<Wizard {...testProps} />)

      expect(wizard.find(List.Item).length).toEqual(Object.keys(STEP).length)
      expect(wizard.find({ content: sentenceCase(STEP.PARTICIPANTS) }).length).toEqual(1)
    })
  })

  describe('submit', () => {
    it('is displayed on the final step', () => {
      const wizard = mount(
        <Wizard {...testProps} initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.REVIEW })} />
      )

      expect(wizard.find({ content: sentenceCase(SUBMIT_APPLICATION) }).length).toEqual(1)
    })
    describe('handleSubmit', () => {
      it('calls onsubmit on the final step', () => {
        testProps.onSubmit = jest.fn()
        const wizard = shallow(<Wizard {...testProps} />)
        wizard.setState({ step: STEP.REVIEW })

        const wizardInstance = wizard.instance() as Wizard<LetterOfCreditValues>

        wizardInstance.handleSubmit(testProps.initialValues, {} as any)

        expect(testProps.onSubmit).toHaveBeenCalledWith(testProps.initialValues, {})
      })
    })
    describe('text', () => {
      it('is set by submitText attribute if set', () => {
        const wizard = mount(
          <Wizard
            {...testProps}
            submitText="custom submit"
            initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.REVIEW })}
          />
        )
        expect(wizard.find({ content: sentenceCase('custom submit') }).length).toEqual(1)
      })
    })
    describe('submitting prop', () => {
      it('disables and sets loading the submitting button and  previous button when submitting is true', () => {
        const wizard = mount(
          <Wizard
            {...testProps}
            submitText="custom submit"
            submitting={true}
            initialStateMachine={LetterOfCreditViewStateMachine({ step: STEP.REVIEW })}
          />
        )

        const buttons = wizard.find(Button)
        expect(buttons.length).toEqual(2)

        const previousButton = wizard.find(Button).first()
        expect(previousButton.prop('disabled')).toEqual(true)

        const submitButton = wizard.find(Button).last()
        expect(submitButton.prop('disabled')).toEqual(true)
        expect(submitButton.prop('loading')).toEqual(true)
      })
    })
  })
})
