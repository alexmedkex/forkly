import { STEP, LetterOfCreditValues, TEMPLATE_TYPE_OPTIONS } from '../constants'
import {
  WizardInternalState,
  WizardStateMachine,
  TRANSITION,
  SUBMIT_APPLICATION,
  WizardStateMachineEvent,
  WizardFormEvent,
  WizardGotoEvent
} from '../../../components/wizard'
import { currentStepFields } from '../constants/fieldsByStep'

type IStateMachine = { [key in STEP]?: any }

export const initialStateMachineStates: IStateMachine = {
  [STEP.SUMMARY_OF_TRADE]: {
    on: {
      [TRANSITION.NEXT]: STEP.CARGO_MOVEMENTS
    }
  },
  [STEP.CARGO_MOVEMENTS]: {
    on: {
      [TRANSITION.NEXT]: STEP.PARTICIPANTS,
      [TRANSITION.PREVIOUS]: STEP.SUMMARY_OF_TRADE
    }
  },
  [STEP.PARTICIPANTS]: {
    on: {
      [TRANSITION.NEXT]: STEP.LC_TYPE,
      [TRANSITION.PREVIOUS]: STEP.CARGO_MOVEMENTS
    }
  },
  [STEP.LC_TYPE]: {
    on: {
      [TRANSITION.NEXT]: STEP.LC_DETAILS,
      [TRANSITION.PREVIOUS]: STEP.PARTICIPANTS
    }
  },
  [STEP.LC_DETAILS]: {
    on: {
      [TRANSITION.NEXT]: STEP.REVIEW,
      [TRANSITION.PREVIOUS]: STEP.LC_TYPE
    }
  },
  [STEP.REVIEW]: {
    on: {
      [TRANSITION.PREVIOUS]: STEP.LC_DETAILS,
      [SUBMIT_APPLICATION]: SUBMIT_APPLICATION
    }
  }
}

export const LetterOfCreditApplicationStateMachine = (
  {
    step = STEP.SUMMARY_OF_TRADE,
    states = initialStateMachineStates,
    context = {
      fields: [],
      steps: []
    }
  }: WizardInternalState<LetterOfCreditValues> = {
    step: STEP.SUMMARY_OF_TRADE,
    states: initialStateMachineStates,
    context: {
      fields: [],
      steps: []
    }
  }
): WizardStateMachine<LetterOfCreditValues> => ({
  transitionTo: (transition: TRANSITION, wizardEvent: WizardStateMachineEvent<LetterOfCreditValues>) => {
    switch (transition) {
      case TRANSITION.NEXT:
      case TRANSITION.PREVIOUS:
        const { values: currentValues } = wizardEvent as WizardFormEvent<LetterOfCreditValues>
        const nextStep = states[step].on[transition]
        const templateTypeIsFreeText = currentValues.templateType === TEMPLATE_TYPE_OPTIONS.FREE_TEXT

        if (templateTypeIsFreeText) {
          delete states[STEP.LC_DETAILS].on[TRANSITION.NEXT]
          delete states[STEP.REVIEW]
        } else {
          states[STEP.LC_DETAILS].on[TRANSITION.NEXT] = STEP.REVIEW
          states[STEP.REVIEW] = initialStateMachineStates[STEP.REVIEW]
        }
        return LetterOfCreditApplicationStateMachine({ step: nextStep, states, context })
      case TRANSITION.GOTO:
        const { step: goToStep } = wizardEvent as WizardGotoEvent
        return LetterOfCreditApplicationStateMachine({ step: goToStep, states, context })
      default:
        return LetterOfCreditApplicationStateMachine({ step, states, context })
    }
  },
  valueOf: () => ({
    step,
    context: {
      steps: Object.keys(states),
      fields: currentStepFields(step)
    },
    states
  })
})
