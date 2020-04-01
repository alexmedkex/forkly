import { STEP } from '../constants'
import { initialStateMachineStates as initialApplicationStateMachineStates } from './ApplicationStateMachine'
import { initialStateMachineStates as initialViewStateMachineStates } from './ViewStateMachine'
import { TRANSITION, SUBMIT_APPLICATION } from '../../../components/wizard'
describe('Application LC flow', () => {
  describe('movements', () => {
    it('moves to LC type step from Participants', () => {
      expect(initialApplicationStateMachineStates[STEP.PARTICIPANTS].on[TRANSITION.NEXT]).toEqual(STEP.LC_TYPE)
    })
    it('moves to LC details step from LC type', () => {
      expect(initialApplicationStateMachineStates[STEP.LC_TYPE].on[TRANSITION.NEXT]).toEqual(STEP.LC_DETAILS)
    })
    it('moves to cargo movement step from summary of trades', () => {
      expect(initialApplicationStateMachineStates[STEP.SUMMARY_OF_TRADE].on[TRANSITION.NEXT]).toEqual(
        STEP.CARGO_MOVEMENTS
      )
    })
    it('moves to review step from LC details', () => {
      expect(initialApplicationStateMachineStates[STEP.LC_DETAILS].on[TRANSITION.NEXT]).toEqual(STEP.REVIEW)
    })
    it('moves to participants step from cargo movements', () => {
      expect(initialApplicationStateMachineStates[STEP.CARGO_MOVEMENTS].on[TRANSITION.NEXT]).toEqual(STEP.PARTICIPANTS)
    })
    it('has no next step after review', () => {
      expect(initialApplicationStateMachineStates[STEP.REVIEW].on[TRANSITION.NEXT]).toBeUndefined()
    })
    it('has a submit step at review', () => {
      expect(initialApplicationStateMachineStates[STEP.REVIEW].on[SUBMIT_APPLICATION]).toBeDefined()
    })
    it('moves back to LC details from review', () => {
      expect(initialApplicationStateMachineStates[STEP.REVIEW].on[TRANSITION.PREVIOUS]).toEqual(STEP.LC_DETAILS)
    })
    it('moves back to summary of trades from cargo movements', () => {
      expect(initialApplicationStateMachineStates[STEP.CARGO_MOVEMENTS].on[TRANSITION.PREVIOUS]).toEqual(
        STEP.SUMMARY_OF_TRADE
      )
    })
    it('moves back to LC type from LC details', () => {
      expect(initialApplicationStateMachineStates[STEP.LC_DETAILS].on[TRANSITION.PREVIOUS]).toEqual(STEP.LC_TYPE)
    })
    it('has no previous step from summary of trades', () => {
      expect(initialApplicationStateMachineStates[STEP.SUMMARY_OF_TRADE].on[TRANSITION.PREVIOUS]).toBeUndefined()
    })
    it('moves back to participants from LC type', () => {
      expect(initialApplicationStateMachineStates[STEP.LC_TYPE].on[TRANSITION.PREVIOUS]).toEqual(STEP.PARTICIPANTS)
    })
    it('moves back to cargo movement from participants', () => {
      expect(initialApplicationStateMachineStates[STEP.PARTICIPANTS].on[TRANSITION.PREVIOUS]).toEqual(
        STEP.CARGO_MOVEMENTS
      )
    })
  })
})

describe('View LC flow', () => {
  describe('movements', () => {
    it('moves to LC type step from Participants', () => {
      expect(initialViewStateMachineStates[STEP.PARTICIPANTS].on[TRANSITION.NEXT]).toEqual(STEP.LC_TYPE)
    })
    it('moves to LC details step from LC type', () => {
      expect(initialViewStateMachineStates[STEP.LC_TYPE].on[TRANSITION.NEXT]).toEqual(STEP.LC_DETAILS)
    })
    it('moves to cargo movement step from summary of trades', () => {
      expect(initialViewStateMachineStates[STEP.SUMMARY_OF_TRADE].on[TRANSITION.NEXT]).toEqual(STEP.CARGO_MOVEMENTS)
    })
    it('moves to lc documents step from LC details', () => {
      expect(initialViewStateMachineStates[STEP.LC_DETAILS].on[TRANSITION.NEXT]).toEqual(STEP.LC_DOCUMENTS)
    })
    it('moves to review step from LC documents', () => {
      expect(initialViewStateMachineStates[STEP.LC_DOCUMENTS].on[TRANSITION.NEXT]).toEqual(STEP.REVIEW)
    })
    it('moves to participants step from cargo movements', () => {
      expect(initialViewStateMachineStates[STEP.CARGO_MOVEMENTS].on[TRANSITION.NEXT]).toEqual(STEP.PARTICIPANTS)
    })
    it('has no next step after review', () => {
      expect(initialViewStateMachineStates[STEP.REVIEW].on[TRANSITION.NEXT]).toBeUndefined()
    })
    it('has a submit step at review', () => {
      expect(initialViewStateMachineStates[STEP.REVIEW].on[SUBMIT_APPLICATION]).toBeDefined()
    })
    it('moves back to LC details from documents', () => {
      expect(initialViewStateMachineStates[STEP.LC_DOCUMENTS].on[TRANSITION.PREVIOUS]).toEqual(STEP.LC_DETAILS)
    })
    it('moves back to LC documents from review', () => {
      expect(initialViewStateMachineStates[STEP.REVIEW].on[TRANSITION.PREVIOUS]).toEqual(STEP.LC_DOCUMENTS)
    })
    it('moves back to summary of trades from cargo movements', () => {
      expect(initialViewStateMachineStates[STEP.CARGO_MOVEMENTS].on[TRANSITION.PREVIOUS]).toEqual(STEP.SUMMARY_OF_TRADE)
    })
    it('moves back to LC type from LC details', () => {
      expect(initialViewStateMachineStates[STEP.LC_DETAILS].on[TRANSITION.PREVIOUS]).toEqual(STEP.LC_TYPE)
    })
    it('has no previous step from summary of trades', () => {
      expect(initialViewStateMachineStates[STEP.SUMMARY_OF_TRADE].on[TRANSITION.PREVIOUS]).toBeUndefined()
    })
    it('moves back to participants from LC type', () => {
      expect(initialViewStateMachineStates[STEP.LC_TYPE].on[TRANSITION.PREVIOUS]).toEqual(STEP.PARTICIPANTS)
    })
    it('moves back to cargo movement from participants', () => {
      expect(initialViewStateMachineStates[STEP.PARTICIPANTS].on[TRANSITION.PREVIOUS]).toEqual(STEP.CARGO_MOVEMENTS)
    })
  })
})
