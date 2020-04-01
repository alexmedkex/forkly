const mockAxiosGet = jest.fn(() => ({ data: { sendTaskNotificationsByEmail: true } }))
jest.mock('axios', () => ({
  default: {
    get: mockAxiosGet
  }
}))
import { getUserSettingsById } from './getUserSettingsById'

describe('getUserSettingsById', () => {
  it('should call axios.get', async () => {
    await getUserSettingsById('test')
    expect(mockAxiosGet).toHaveBeenCalledWith(`${process.env.API_USERS_BASE_URL}/v0/users/test/settings`)
  })
})
