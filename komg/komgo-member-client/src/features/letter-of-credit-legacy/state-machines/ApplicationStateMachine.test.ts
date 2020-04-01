import { LetterOfCreditApplicationStateMachine } from './ApplicationStateMachine'
import { STEP, initialLetterOfCreditValues, TEMPLATE_TYPE_OPTIONS } from '../constants'
import { TRANSITION } from '../../../components/wizard'

describe('LetterOfCreditApplicationStateMachine', () => {
  it('starts on summary of trade step', () => {
    const stateMachine = LetterOfCreditApplicationStateMachine()

    expect(stateMachine.valueOf().step).toEqual(STEP.SUMMARY_OF_TRADE)
    expect(stateMachine.valueOf().context!.steps).toEqual([
      STEP.SUMMARY_OF_TRADE,
      STEP.CARGO_MOVEMENTS,
      STEP.PARTICIPANTS,
      STEP.LC_TYPE,
      STEP.LC_DETAILS,
      STEP.REVIEW
    ])
    expect(stateMachine.valueOf().context!.fields).toEqual(['tradeId'])
  })
  it('can transition to another step', () => {
    const stateMachine = LetterOfCreditApplicationStateMachine().transitionTo(TRANSITION.NEXT, {
      values: initialLetterOfCreditValues
    })
    expect(stateMachine.valueOf().step).toEqual(STEP.CARGO_MOVEMENTS)
    expect(stateMachine.valueOf().context!.fields).toEqual(['cargoIds'])
  })
  it('can transition two steps', () => {
    const stateMachine = LetterOfCreditApplicationStateMachine()
      .transitionTo(TRANSITION.NEXT, { values: initialLetterOfCreditValues })
      .transitionTo(TRANSITION.NEXT, { values: initialLetterOfCreditValues })
    expect(stateMachine.valueOf().step).toEqual(STEP.PARTICIPANTS)
  })
  it('has an undefined step after the final step', () => {
    const nextPage = LetterOfCreditApplicationStateMachine({ step: STEP.LC_DETAILS }).valueOf().states![STEP.LC_DETAILS]
      .on[TRANSITION.NEXT]

    expect(nextPage).toEqual(undefined)
  })
  it('removes the review step if free text LC is chosen', () => {
    const stateMachine = LetterOfCreditApplicationStateMachine({ step: STEP.CARGO_MOVEMENTS }).transitionTo(
      TRANSITION.NEXT,
      { values: { ...initialLetterOfCreditValues, templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT } }
    )

    expect(stateMachine.valueOf().context!.steps).not.toContain(STEP.REVIEW)
  })
  it('can goto a step', () => {
    const stateMachine = LetterOfCreditApplicationStateMachine().transitionTo(TRANSITION.GOTO, {
      step: STEP.LC_TYPE
    })

    expect(stateMachine.valueOf().step).toEqual(STEP.LC_TYPE)
  })
})
