import { ActionType } from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import InvalidActionTypeError from '../messaging/InvalidActionTypeError'

import ReceiveInboundCorporateReplyUseCase from './corporate/ReceiveInboundCorporateReplyUseCase'
import { ReceiveInboundAcceptUseCase } from './financial-institution/ReceiveInboundAcceptUseCase'
import { ReceiveInboundDeclineUseCase } from './financial-institution/ReceiveInboundDeclineUseCase'
import ReceiveInboundRequestUseCase from './financial-institution/ReceiveInboundRequestUseCase'
import InboundUseCaseFactory from './InboundUseCaseFactory'

describe('InboundUseCaseFactory', () => {
  let inboundFactory: InboundUseCaseFactory
  let inboundRequestUseCase: ReceiveInboundRequestUseCase
  let inboundResponseUseCase: ReceiveInboundCorporateReplyUseCase
  let inboundAcceptUseCase: ReceiveInboundAcceptUseCase
  let inboundDeclineUseCase: ReceiveInboundDeclineUseCase
  beforeEach(() => {
    inboundRequestUseCase = createMockInstance(ReceiveInboundRequestUseCase)
    inboundResponseUseCase = createMockInstance(ReceiveInboundCorporateReplyUseCase)
    inboundAcceptUseCase = createMockInstance(ReceiveInboundAcceptUseCase)
    inboundFactory = new InboundUseCaseFactory(
      inboundRequestUseCase,
      inboundResponseUseCase,
      inboundAcceptUseCase,
      inboundDeclineUseCase
    )
  })

  it('retrieves a Response usecase', () => {
    const usecase = inboundFactory.getUseCase(ActionType.Response)
    expect(usecase).toBe(inboundResponseUseCase)
  })

  it('retrieves a Request usecase', () => {
    const usecase = inboundFactory.getUseCase(ActionType.Request)
    expect(usecase).toBe(inboundRequestUseCase)
  })

  it('retrieves an Accept usecase', () => {
    const usecase = inboundFactory.getUseCase(ActionType.Accept)
    expect(usecase).toBe(inboundAcceptUseCase)
  })

  it('retrieves a Decline usecase', () => {
    const usecase = inboundFactory.getUseCase(ActionType.Decline)
    expect(usecase).toBe(inboundDeclineUseCase)
  })

  it('throws an error if it cannot find a usecase that mateches the ActionType', () => {
    expect(() => {
      // @ts-ignore
      inboundFactory.getUseCase('InvalidActionType')
    }).toThrowError(InvalidActionTypeError)
  })
})
