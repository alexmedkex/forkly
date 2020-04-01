import 'reflect-metadata'

import { getBooleanFromEnvVariable } from './utils'

describe('getBooleanFromEnvVariable', () => {
  it('should return true if env variable undefined and default value = true', async () => {
    const envVariable = undefined
    const defaultValue = true

    const result = getBooleanFromEnvVariable(envVariable, defaultValue)

    expect(result).toBe(defaultValue)
  })

  it('should return false if env variable undefined and default value = false', async () => {
    const envVariable = undefined
    const defaultValue = false

    const result = getBooleanFromEnvVariable(envVariable, defaultValue)

    expect(result).toBe(defaultValue)
  })

  it('should return false if env variable undefined', async () => {
    const envVariable = undefined

    const result = getBooleanFromEnvVariable(envVariable)

    expect(result).toBeFalsy()
  })

  it('should return false if env variable false', async () => {
    const envVariable = 'false'

    const result = getBooleanFromEnvVariable(envVariable)

    expect(result).toBeFalsy()
  })

  it('should return false if env variable invalid', async () => {
    const envVariable = 'notvalid'

    const result = getBooleanFromEnvVariable(envVariable)

    expect(result).toBeFalsy()
  })

  it('should return true if env variable true and default value = true', async () => {
    const envVariable = 'true'
    const defaultValue = false

    const result = getBooleanFromEnvVariable(envVariable, defaultValue)

    expect(result).toBeTruthy()
  })

  it('should return false if env variable false and default value = true', async () => {
    const envVariable = 'false'
    const defaultValue = true

    const result = getBooleanFromEnvVariable(envVariable, defaultValue)

    expect(result).toBeFalsy()
  })

  it('should return true if env variable invalid and default value = true', async () => {
    const envVariable = 'notvalid'
    const defaultValue = true

    const result = getBooleanFromEnvVariable(envVariable, defaultValue)

    expect(result).toBeTruthy()
  })
})
