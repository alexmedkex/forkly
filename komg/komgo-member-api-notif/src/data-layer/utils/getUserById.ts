import axios from 'axios'

export const getUserById = async (id: string) => axios.get(`${process.env.API_USERS_BASE_URL}/v0/users/${id}`)
