import { createMiddlewareTestHelpers } from './api.test'
import { LetterOfCreditActionType } from '../../features/letter-of-credit-legacy/store/types'
import afterMiddleware from './afterHandler'

describe('afterHandler middleware', () => {
  it(`calls the afterHandler if one is given`, () => {
    const { invoke } = createMiddlewareTestHelpers(afterMiddleware)

    const funcToCall = jest.fn()

    invoke({ type: LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_REQUEST, afterHandler: () => funcToCall() })

    expect(funcToCall).toHaveBeenCalled()
  })
})
