import axios from '../../../utils/axios'

import { TRADE_FINANCE_BASE_ENDPOINT, DOCUMENTS_BASE_ENDPOINT } from '../../../utils/endpoints'
import { createAndGetLetterOfCreditDocument, getLetterOfCreditDocument } from './createAndGetLetterOfCredit'
import { ILetterOfCreditTemplate } from '../constants'
import { fakeLetterOfCreditTemplate } from '../utils/faker'

jest.mock('../constants')
const fields: ILetterOfCreditTemplate = fakeLetterOfCreditTemplate()

describe('createAndGetLetterOfCredit', () => {
  describe('createAndGetLetterOfCreditDocument', () => {
    const spy = jest.spyOn(axios, 'post')
    beforeAll(() => {
      spy.mockImplementation(() => Promise.resolve(null))
    })
    it('calls Kite via axios with expected arguments', async () => {
      spy.mockImplementationOnce(() => Promise.resolve(null))

      await createAndGetLetterOfCreditDocument({ templateId: 'test-id', fields })

      expect(spy).toHaveBeenCalledWith(
        `${DOCUMENTS_BASE_ENDPOINT}/document-templates/generate-document`,
        { templateId: 'test-id', fields },
        { responseType: 'arraybuffer' }
      )
    })
  })

  describe('getLetterOfCreditDocument', () => {
    const spy = jest.spyOn(axios, 'get')
    beforeAll(() => {
      spy.mockImplementation(() => Promise.resolve({ data: [{ id: 'test-doc-id' }] }) as any)
    })
    it('gets the document from trade-finance via axios with expected arguments', async () => {
      await getLetterOfCreditDocument({ id: 'test-LC-id' })

      expect(spy).toHaveBeenCalledWith(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/test-LC-id/documents`)
    })

    it('gets the document content from trade-finance via axios with expected arguments', async () => {
      await getLetterOfCreditDocument({ id: 'test-LC-id' })

      expect(spy).toHaveBeenCalledWith(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/documents/test-doc-id/content`, {
        responseType: 'arraybuffer'
      })
    })

    it('rejects if there is no lc document with the id', async () => {
      spy.mockImplementationOnce(() => Promise.resolve({ data: [] }) as any)

      const call = getLetterOfCreditDocument({ id: 'test-LC-id' })

      await expect(call).rejects.toEqual(new Error('No document with ID=test-LC-id was found'))
    })
  })
})
