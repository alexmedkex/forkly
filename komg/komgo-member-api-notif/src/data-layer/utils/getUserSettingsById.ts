import axios from 'axios'
import { IUserSettings } from '@komgo/types'

export const getUserSettingsById = async (id: string): Promise<IUserSettings> => {
  const resp = await axios.get<IUserSettings>(`${process.env.API_USERS_BASE_URL}/v0/users/${id}/settings`)
  return resp.data
}
