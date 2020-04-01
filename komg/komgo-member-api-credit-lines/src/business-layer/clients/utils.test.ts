import { processServiceError } from './utils'
import InvalidDataError from '../errors/InvalidDataError'
import { MicroserviceClientError } from '../errors/MicroserviceClientError'
const logger = { error: jest.fn() }

describe('processServiceError', () => {
  it('should throw InvalidDataError', () => {
    expect(() =>
      processServiceError({ isAxiosError: true, response: { data: 'error', status: 400 } }, 'some action name', logger)
    ).toThrow(InvalidDataError)
  })

  it('should throw MicroserviceClientError', () => {
    expect(() =>
      processServiceError({ isAxiosError: true, response: { data: 'error', status: 500 } }, 'some action name', logger)
    ).toThrow(MicroserviceClientError)
  })
})
