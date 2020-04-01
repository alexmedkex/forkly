import {
  WizardInternalState,
  WizardStateMachine,
  TRANSITION,
  SUBMIT_APPLICATION,
  WizardStateMachineEvent,
  WizardFormEvent,
  WizardGotoEvent
} from '../../../../components/wizard'
import { IDiff, ILCAmendmentBase } from '@komgo/types'

export enum Step {
  Trade = 'TRADE',
  LetterOfCredit = 'LETTER_OF_CREDIT',
  Summary = 'SUMMARY'
}

const REQUEST_AMENDMENT = 'REQUEST_AMENDMENT'

const fieldsByStep = {
  [Step.Trade]: {
    tradeAmendments: 'Trade Amendments'
  },
  [Step.LetterOfCredit]: {
    letterOfCreditAmendments: 'LC Amendments'
  },
  [Step.Summary]: {}
}

type IStateMachine = { [key in Step]?: any }

export const amendmentFlow: IStateMachine = {
  [Step.Trade]: {
    on: {
      [TRANSITION.NEXT]: Step.LetterOfCredit
    }
  },
  [Step.LetterOfCredit]: {
    on: {
      [TRANSITION.NEXT]: Step.Summary,
      [TRANSITION.PREVIOUS]: Step.Trade
    }
  },
  [Step.Summary]: {
    on: {
      [TRANSITION.PREVIOUS]: Step.LetterOfCredit,
      // TODO LS REQUEST_AMENDMENT
      [SUBMIT_APPLICATION]: SUBMIT_APPLICATION
    }
  }
}

export const CreateAmendmentStateMachine = (
  { step, states, context }: WizardInternalState<ILCAmendmentBase> = {
    step: Step.Trade,
    states: amendmentFlow,
    context: {
      fields: [],
      steps: []
    }
  }
): WizardStateMachine<ILCAmendmentBase> => ({
  transitionTo: (transition: TRANSITION, wizardEvent: WizardStateMachineEvent<ILCAmendmentBase>) => {
    switch (transition) {
      case TRANSITION.NEXT:
      case TRANSITION.PREVIOUS:
        const { values: currentValues } = wizardEvent as WizardFormEvent<ILCAmendmentBase>
        const nextStep = states[step].on[transition]
        return CreateAmendmentStateMachine({ step: nextStep, states, context })
      case TRANSITION.GOTO:
        const { step: goToStep } = wizardEvent as WizardGotoEvent
        return CreateAmendmentStateMachine({ step: goToStep, states, context })
      default:
        return CreateAmendmentStateMachine({ step, states, context })
    }
  },
  valueOf: () => ({
    step,
    context: {
      steps: Object.keys(states),
      fields: step === Step.LetterOfCredit ? ['diffs'] : []
    },
    states
  })
})
