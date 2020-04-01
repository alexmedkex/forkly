import 'reflect-metadata'

import { buildFakeTrade, ITrade, ICargo, buildFakeCargo } from '@komgo/types'

import { CargoUpdateMessageUseCase } from './CargoUpdateMessageUseCase'
import { EventMessagePublisher } from '../service-layer/events/EventMessagePublisher'
import createMockInstance from 'jest-create-mock-instance'

let mockEventMessagePublisher: EventMessagePublisher

const MOCK_DATA: ICargo = buildFakeCargo()

describe('CargoUpdateMessageUseCase', () => {
  let cargoUpdateMessageUseCase: CargoUpdateMessageUseCase

  beforeEach(() => {
    mockEventMessagePublisher = createMockInstance(EventMessagePublisher)
    cargoUpdateMessageUseCase = new CargoUpdateMessageUseCase(mockEventMessagePublisher)
  })

  it('should not publish message if ICargo is the same', async () => {
    const oldCargo: ICargo = { ...MOCK_DATA }
    const newCargo: ICargo = { ...MOCK_DATA }

    await cargoUpdateMessageUseCase.execute(oldCargo, newCargo)

    expect(mockEventMessagePublisher.publishCargoUpdated).toBeCalledTimes(0)
  })

  it('should publish message if ICargo is different', async () => {
    const oldCargo: ICargo = { ...MOCK_DATA, quality: 'new quality' }
    const newCargo: ICargo = { ...MOCK_DATA }

    await cargoUpdateMessageUseCase.execute(oldCargo, newCargo)

    expect(mockEventMessagePublisher.publishCargoUpdated).toBeCalledTimes(1)
    expect(mockEventMessagePublisher.publishCargoUpdated).toBeCalledWith(newCargo)
  })

  it('should not publish message if only updateAt is different ', async () => {
    const oldCargo: ICargo = { ...MOCK_DATA }
    const newCargo: ICargo = { ...MOCK_DATA, updatedAt: '2001-01-02' }

    await cargoUpdateMessageUseCase.execute(oldCargo, newCargo)

    expect(mockEventMessagePublisher.publishCargoUpdated).toBeCalledTimes(0)
  })
})
