import { IUserResponse } from '@komgo/types'
import 'reflect-metadata'

import axios from 'axios'

import { startService, stopService } from './run-test-server'

jest.setTimeout(1000 * 60 * 5)

async function start() {
  try {
    await startService()
  } catch (e) {
    console.log(e)
  }
}

describe('API Users', () => {
  beforeAll(async () => {
    await start()
  })
  afterAll(async () => {
    await stopService()
  })

  it('should return more than 20 users', async () => {
    const response = await axios.get<IUserResponse[]>('http://localhost:8081/v0/users')
    expect(response.data.length).toBeGreaterThan(20)
  })
})
