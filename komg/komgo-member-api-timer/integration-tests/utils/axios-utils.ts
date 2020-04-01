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

async function getAPI<T>(path: string) {
  return axiosInstance.get<T>(`http://localhost:8080/v0/${path}`)
}

async function putAPI<T>(path: string, data?: any) {
  return axiosInstance.put<T>(`http://localhost:8080/v0/${path}`, data)
}

async function deleteAPI(path: string) {
  return axiosInstance.delete(`http://localhost:8080/v0/${path}`)
}

export { axiosMock, postAPI, getAPI, putAPI, deleteAPI }
