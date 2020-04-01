import { STEP, LetterOfCreditValues } from '../constants'
import {
  WizardInternalState,
  WizardStateMachine,
  TRANSITION,
  SUBMIT_APPLICATION,
  WizardStateMachineEvent,
  WizardGotoEvent
} from '../../../components/wizard'
import { currentStepFields } from '../constants/fieldsByStep'

export const initialStateMachineStatesWithoutReviewStep = {
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
      [TRANSITION.NEXT]: STEP.LC_DOCUMENTS,
      [TRANSITION.PREVIOUS]: STEP.LC_TYPE
    }
  },
  [STEP.LC_DOCUMENTS]: {
    on: {
      [TRANSITION.PREVIOUS]: STEP.LC_DETAILS
    }
  }
}

export const initialStateMachineStates = {
  ...initialStateMachineStatesWithoutReviewStep,
  [STEP.LC_DOCUMENTS]: {
    on: {
      [TRANSITION.NEXT]: STEP.REVIEW,
      [TRANSITION.PREVIOUS]: STEP.LC_DETAILS
    }
  },
  [STEP.REVIEW]: {
    on: {
      [TRANSITION.PREVIOUS]: STEP.LC_DOCUMENTS,
      [SUBMIT_APPLICATION]: SUBMIT_APPLICATION
    }
  }
}

export const LetterOfCreditViewStateMachine = (
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
        const newStep = states[step].on[transition]
        return LetterOfCreditViewStateMachine({ step: newStep, states, context })
      case TRANSITION.GOTO:
        const { step: goToStep } = wizardEvent as WizardGotoEvent
        return LetterOfCreditViewStateMachine({ step: goToStep, states, context })
      default:
        return LetterOfCreditViewStateMachine({ step, states, context })
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
