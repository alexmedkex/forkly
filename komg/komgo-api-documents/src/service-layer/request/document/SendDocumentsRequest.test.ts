import 'reflect-metadata'

import { IValidationErrors } from '@komgo/error-utilities'
import { validateObject } from '@komgo/microservice-config'

import { SendDocumentsRequest } from './SendDocumentsRequest'

describe('SendDocumentRequest', () => {
  it('validate correct object', async () => {
    await assertIsValid({
      documents: ['doc-id'],
      companyId: 'company-id',
      requestId: 'request-id'
    })
  })

  it('request should have at least one document', async () => {
    await assertInvalid(
      {
        documents: [],
        companyId: 'company-id',
        requestId: 'request-id'
      },
      {
        documents: ['documents should not be empty']
      }
    )
  })

  async function assertIsValid(sendDocumentRequest: SendDocumentsRequest) {
    const res = await validateObject(SendDocumentsRequest, sendDocumentRequest)
    expect(res.getValidationErrors()).toEqual({})
  }

  async function assertInvalid(sendDocumentRequest: SendDocumentsRequest, errors: IValidationErrors) {
    const res = await validateObject(SendDocumentsRequest, sendDocumentRequest)
    expect(res.getValidationErrors()).toEqual(errors)
  }
})
