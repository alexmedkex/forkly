import axios from 'axios'

import { ICompany } from '../src/interfaces'

import * as config from './config'

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const getCompany = async (companyStaticId: string): Promise<ICompany> => {
  const resp = await axios.get<ICompany>(`${config.apiBaseUrl}/companies/${companyStaticId}`)
  return resp.data
}
