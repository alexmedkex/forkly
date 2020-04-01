import * as React from 'react'
import { Fragment } from 'react'
import { Prompt } from 'react-router-dom'
import { Formik, FormikActions, FormikTouched, FormikErrors, FormikValues } from 'formik'
import { Button, Divider, Segment, List, Form } from 'semantic-ui-react'
import { sentenceCase, sentenceCaseWithAcronyms } from '../../utils/casings'
import Ajv from 'ajv'
import { toFormikErrors } from '../../utils/validator'
import { ErrorMessage } from '../../components'
import { violetBlue, dark } from '../../styles/colors'

export enum TRANSITION {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  GOTO = 'GOTO'
}

export const SUBMIT_APPLICATION = 'SUBMIT_APPLICATION'

export interface WizardInternalState<T> {
  step: string
  states?: any
  context?: {
    fields: Array<Partial<keyof T>>
    steps: string[]
  }
}

export type WizardStateMachineEvent<T> = WizardFormEvent<T> | WizardGotoEvent | undefined

export interface WizardFormEvent<T> {
  values: T
}

export interface WizardGotoEvent {
  step: string
}

export interface WizardStateMachine<T> {
  transitionTo: (transition: TRANSITION, event: WizardStateMachineEvent<T>) => WizardStateMachine<T>
  valueOf: () => WizardInternalState<T>
}

type Validation<T> = (values: T) => FormikErrors<T>

export interface WizardProps<T> {
  initialValues: T
  readonly?: boolean
  onSubmit: (values: T, formikActions?: FormikActions<T>) => any
  // to do cleanup under
  onNext?: (currentValues: T, step: string, setFieldValue: (field: keyof T, value: any) => void) => FormikErrors<T>
  validator: Ajv.Ajv | Validation<T>
  validationSchemaKeyRef: string
  fieldToLabel: (step: string, field: keyof T) => string
  submitting?: boolean
  initialStateMachine: WizardStateMachine<T>
  submitText?: string
  leaveWizardWarningText?: string
}

interface WizardPageProps {
  step: string
}

interface WizardState<T> {
  values: T
  errors: FormikErrors<T>
  onNextErrors: FormikErrors<T>
}

export class Wizard<T> extends React.Component<WizardProps<T>, WizardState<T>> {
  static Page: React.FC<WizardPageProps> = ({ children }: any) => <Fragment>{children}</Fragment>
  stateMachine: WizardStateMachine<T>

  constructor(props: WizardProps<T>) {
    super(props)
    this.validate = this.validate.bind(this)

    this.stateMachine = this.props.initialStateMachine

    this.state = {
      values: props.initialValues,
      onNextErrors: {},
      errors: {}
    }
  }

  next = (
    values: T,
    setTouched: (t: FormikTouched<T>) => void,
    setFieldValue: (field: keyof T & string, value: any) => void,
    setErrors: (errors: FormikErrors<T>) => void
  ) => () => {
    window.scrollTo(0, 0)

    const { errors: validationErrors } = this.state

    let onNextErrors = {}

    setTouched(
      this.stateMachine.valueOf().context!.fields.reduce((fields, field) => ({ ...fields, [field]: true }), {})
    )

    if (this.props.onNext) {
      onNextErrors = this.props.onNext(values, this.stateMachine.valueOf().step, setFieldValue)
      if (Object.keys(onNextErrors).length !== 0 && onNextErrors.constructor === Object) {
        this.setState({ onNextErrors })
        setErrors({ ...validationErrors, ...onNextErrors })
      } else {
        this.setState({ onNextErrors: {} })
        setErrors(validationErrors)
      }
    }

    const nextState = this.stateMachine.transitionTo(TRANSITION.NEXT, { values })

    if (Object.keys(validationErrors).length === 0 && Object.keys(onNextErrors).length === 0) {
      this.stateMachine = nextState
      this.forceUpdate()
    }
  }

  goto = (step: string) => {
    if (!this.props.readonly) {
      return
    }
    this.stateMachine = this.stateMachine.transitionTo(TRANSITION.GOTO, { step })
    this.forceUpdate()
  }

  previous = (values: T, touched: FormikTouched<T>) => () => {
    window.scrollTo(0, 0)

    const { errors } = this.state

    const touchedErrors = Object.keys(errors).reduce((touchedErrors, error) => {
      return (touched as any)[error]
        ? {
            ...touchedErrors,
            [error]: true
          }
        : touchedErrors
    }, {})

    if (Object.keys(touchedErrors).length === 0 && touchedErrors.constructor === Object) {
      this.setState({
        errors: {}
      })
      this.stateMachine = this.stateMachine.transitionTo(TRANSITION.PREVIOUS, { values })
    }
  }

  findActivePage = () => {
    return React.Children.toArray(this.props.children).find(
      (child: any) => child.props.step === this.stateMachine.valueOf().step
    ) as React.ReactElement<WizardPageProps>
  }

  validate = (values: T) => {
    return Promise.resolve().then(() => {
      const { validator, validationSchemaKeyRef } = this.props
      const { onNextErrors } = this.state
      const stepFields = this.stateMachine.valueOf().context!.fields
      let formikErrors = {}

      // If validator is function
      if (typeof validator === 'function') {
        formikErrors = validator(values)
      } else if (!validator.validate(validationSchemaKeyRef, values)) {
        // If validator is not function (Ajv validator)
        formikErrors = toFormikErrors(validator.errors)
      }
      Object.keys(formikErrors).length > 0
        ? this.setErrors(formikErrors, stepFields, onNextErrors)
        : this.setEmptyError(onNextErrors)
      return Promise.resolve({})
    })
  }

  // Set errors in state
  setErrors = (formikErrors: FormikErrors<FormikValues>, stepFields: any, onNextErrors: FormikErrors<T>) => {
    const errors = Object.entries(formikErrors).reduce(
      (memo: any, [fieldName, message]) =>
        stepFields.find(s => fieldName === s)
          ? {
              ...memo,
              [fieldName]: message
            }
          : memo,
      {}
    )
    this.setState({ errors })
    throw { ...errors, ...onNextErrors }
  }

  // Set empty errors
  setEmptyError = (onNextErrors: FormikErrors<T>) => {
    this.setState({ errors: {} })
    if (Object.keys(onNextErrors).length !== 0 && onNextErrors.constructor === Object) {
      throw onNextErrors
    }
  }

  handleSubmit = (values: T, formikActions: FormikActions<T>) => {
    const { onSubmit } = this.props
    onSubmit(values, formikActions)
  }

  render() {
    const { values, onNextErrors } = this.state
    const { submitting, submitText, leaveWizardWarningText } = this.props
    const activePage = this.findActivePage()

    const { step, context, states } = this.stateMachine.valueOf()

    const isLastPage = states![step!].on[TRANSITION.NEXT] === undefined

    const displaySubmitButton = !this.props.readonly && isLastPage

    const isFirstPage = states![step!].on[TRANSITION.PREVIOUS] === undefined

    return (
      <Fragment>
        <List horizontal={true}>
          {context!.steps.map((s, idx) => (
            <List.Item
              key={idx}
              style={
                s === step
                  ? { color: violetBlue, fontWeight: 'bold' }
                  : { color: dark, cursor: `${this.props.readonly && 'pointer'}`, fontWeight: 'bold' }
              }
              content={sentenceCaseWithAcronyms(s.toString(), ['LC'])}
              onClick={() => this.goto(s)}
            />
          ))}
        </List>
        <Divider hidden={true} />

        <Formik
          initialValues={values}
          enableReinitialize={false}
          validate={this.validate}
          validateOnBlur={true}
          validateOnChange={true}
          onSubmit={this.handleSubmit}
          render={({
            handleSubmit,
            errors,
            error,
            touched,
            setTouched,
            values,
            dirty,
            isSubmitting,
            setFieldValue,
            setErrors
          }) => (
            <Form onSubmit={handleSubmit}>
              {leaveWizardWarningText && <Prompt when={dirty && !isSubmitting} message={leaveWizardWarningText} />}
              {Object.entries(errors)
                .filter(([field, _]: [string, any]) => (touched as any)[field])
                .map(([field, validationError]: [string, string], idx) => (
                  <ErrorMessage
                    key={idx}
                    title="Please complete all required fields"
                    error={validationError.replace(field, this.props.fieldToLabel(step!, field as keyof T) || field)}
                  />
                ))}
              {Object.entries(onNextErrors).map(([field, validationError]: [string, string], idx) => (
                <ErrorMessage
                  key={idx}
                  title="Please complete all required fields"
                  error={validationError.replace(field, this.props.fieldToLabel(step!, field as keyof T) || field)}
                />
              ))}
              {error && <ErrorMessage title="Form error" error={error} />}
              {activePage}
              <Divider />
              <Segment basic={true} textAlign="right">
                {!isFirstPage && (
                  <Button
                    type="button"
                    name="previous"
                    content={sentenceCase(TRANSITION.PREVIOUS)}
                    disabled={submitting}
                    onClick={this.previous(values, touched)}
                  />
                )}
                {!isLastPage && (
                  <Button
                    content={sentenceCase(TRANSITION.NEXT)}
                    name="next"
                    type="button"
                    onClick={this.next(values, setTouched, setFieldValue, setErrors)}
                  />
                )}
                {displaySubmitButton && (
                  <Button
                    content={sentenceCase(submitText || SUBMIT_APPLICATION)}
                    type="submit"
                    disabled={submitting}
                    loading={submitting}
                    primary={true}
                  />
                )}
              </Segment>
            </Form>
          )}
        />
      </Fragment>
    )
  }
}
