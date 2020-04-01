import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

jest.unmock('axios')
const axiosInstance = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

const axiosMock = new MockAdapter(axios)

async function postAPI(path: string, data?: any) {
  return axiosInstance.post(`http://localhost:8080/v0/${path}`, data)
}

async function getAPI(path: string) {
  return axiosInstance.get(`http://localhost:8080/v0/${path}`)
}

export { axiosMock, postAPI, getAPI }
