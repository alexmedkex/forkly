import axios from '../../../utils/axios'
import { TRADE_FINANCE_BASE_ENDPOINT, DOCUMENTS_BASE_ENDPOINT } from '../../../utils/endpoints'
import { ILetterOfCreditTemplate } from '../constants'
import { AxiosResponse } from 'axios'

export interface CreateLetterOfCreditPayload {
  templateId: string
  fields: ILetterOfCreditTemplate
}

export interface GetLetterOfCreditPayload {
  id: string
}

export const createAndGetLetterOfCreditDocument = (payload: CreateLetterOfCreditPayload): Promise<AxiosResponse> => {
  return axios.post(`${DOCUMENTS_BASE_ENDPOINT}/document-templates/generate-document`, payload, {
    responseType: 'arraybuffer'
  })
}

export const getLetterOfCreditDocument = async (payload: GetLetterOfCreditPayload): Promise<AxiosResponse> => {
  const { data: documents } = await axios.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${payload.id}/documents`)
  if (!documents.length) {
    throw new Error(`No document with ID=${payload.id} was found`)
  }
  return axios.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/documents/${documents[0].id}/content`, {
    responseType: 'arraybuffer'
  })
}
