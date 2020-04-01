import { LetterOfCreditViewStateMachine, initialStateMachineStatesWithoutReviewStep } from './ViewStateMachine'
import { STEP, initialLetterOfCreditValues, TEMPLATE_TYPE_OPTIONS } from '../constants'
import { TRANSITION } from '../../../components/wizard'

describe('LetterOfCreditViewStateMachine', () => {
  it('starts on summary of trade step', () => {
    const stateMachine = LetterOfCreditViewStateMachine()

    expect(stateMachine.valueOf().step).toEqual(STEP.SUMMARY_OF_TRADE)
    expect(stateMachine.valueOf().context!.steps).toEqual(Object.keys(STEP))
    expect(stateMachine.valueOf().context!.fields).toEqual(['tradeId'])
  })
  it('can transition to another step', () => {
    const stateMachine = LetterOfCreditViewStateMachine().transitionTo(TRANSITION.NEXT, {
      values: initialLetterOfCreditValues
    })
    expect(stateMachine.valueOf().step).toEqual(STEP.CARGO_MOVEMENTS)
    expect(stateMachine.valueOf().context!.steps).toEqual(Object.keys(STEP))
    expect(stateMachine.valueOf().context!.fields).toEqual(['cargoIds'])
  })
  it('can transition two steps', () => {
    const stateMachine = LetterOfCreditViewStateMachine()
      .transitionTo(TRANSITION.NEXT, { values: initialLetterOfCreditValues })
      .transitionTo(TRANSITION.NEXT, { values: initialLetterOfCreditValues })
    expect(stateMachine.valueOf().step).toEqual(STEP.PARTICIPANTS)
  })
  it('can start on another step', () => {
    const stateMachine = LetterOfCreditViewStateMachine({ step: STEP.REVIEW })
    expect(stateMachine.valueOf().step).toEqual(STEP.REVIEW)
  })
  it('has an undefined step after the final step', () => {
    const nextPage = LetterOfCreditViewStateMachine({ step: STEP.REVIEW }).valueOf().states![STEP.REVIEW].on[
      TRANSITION.NEXT
    ]

    expect(nextPage).toEqual(undefined)
  })
  it('has no review step if initialStateMachineStatesWithoutReviewStep is used', () => {
    const options: any = { states: initialStateMachineStatesWithoutReviewStep }
    const stateMachine = LetterOfCreditViewStateMachine(options)

    expect(stateMachine.valueOf().context!.steps).not.toContain(STEP.REVIEW)
  })
  it('can goto a step', () => {
    const stateMachine = LetterOfCreditViewStateMachine().transitionTo(TRANSITION.GOTO, { step: STEP.LC_DOCUMENTS })

    expect(stateMachine.valueOf().step).toEqual(STEP.LC_DOCUMENTS)
  })
})
