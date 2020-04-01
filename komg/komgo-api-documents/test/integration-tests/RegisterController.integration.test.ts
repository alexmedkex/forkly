import * as fs from 'fs'
import waitForExpect from 'wait-for-expect'

import { IFullDocumentResponse } from '../../src/service-layer/responses/document/IFullDocumentResponse'

import { extraDocumentData, sampleDocumentSignature } from './sampledata/sampleData'
import { uploadSampleFile } from './sampledata/upload-sample-file'
import { categoryId, productId, sampleFilePath, typeId } from './utils/consts'
import { integrationTest } from './utils/integration-test'
import { TestContainer } from './utils/TestContainer'

integrationTest(
  'Register Controller Integration',
  [TestContainer.MockServer, TestContainer.Mongo, TestContainer.Ganache],
  test => {
    it('Upload file', async () => {
      // Hash is not set here as this is mocked within
      const data = await uploadSampleFile(sampleFilePath, { productId, categoryId, typeId }, test.instance, null)
      const result: IFullDocumentResponse = data

      await waitForExpect(async () => {
        expect(result).toBeDefined()
        expect(result.content.signature).toEqual(sampleDocumentSignature)
        expect(result.metadata).toEqual(extraDocumentData.metadata)
      })
    })

    it('Find Documents', async () => {
      const response = await test.instance.serverConnection().get(`products/${productId}/documents`)
      const documents: IFullDocumentResponse[] = response.data

      await waitForExpect(async () => {
        expect(documents).toBeDefined()
        expect(documents.length).toEqual(1)

        // should be first and only doc
        const aDocument = documents[0]
        expect(aDocument.metadata).toEqual(extraDocumentData.metadata)
        expect(aDocument.product.id).toEqual(productId)
        expect(aDocument.category.id).toEqual(categoryId)
        expect(aDocument.type.id).toEqual(typeId)
      })
    })

    it('Get document by Id', async () => {
      const response = await test.instance.serverConnection().get(`products/${productId}/documents`)
      const document: IFullDocumentResponse = response.data[0]

      const getByIdResponse = await test.instance
        .serverConnection()
        .get(`products/${productId}/documents/${document.id}`)
      const fetchedDocument: IFullDocumentResponse = getByIdResponse.data
      expect(document.id).toEqual(fetchedDocument.id)
    })

    it('Download document', async () => {
      // fetch sample document
      const response = await test.instance.serverConnection().get(`products/${productId}/documents`)
      // last document in DB
      const document: IFullDocumentResponse = response.data[response.data.length - 1]

      // Download document file content
      const downloadResponse = await test.instance
        .serverConnection()
        .get(`products/${productId}/documents/${document.id}/content`)
      const downloadByteSize: number = Buffer.from(downloadResponse.data).byteLength

      // Compare downloaded vs local sample file that was uploaded
      const sampleFile = fs.readFileSync(sampleFilePath, 'utf8')
      const sampleFileByteSize: number = Buffer.from(sampleFile).byteLength

      // Basic verification on byte size that the document is the same
      // We should probably do hash comparison
      expect(downloadByteSize).toEqual(sampleFileByteSize)
    })

    it('Delete document', async () => {
      // fetch document to be deleted
      const response = await test.instance.serverConnection().get(`products/${productId}/documents`)
      // We have fixtures in the database before every test.
      // length - 1 gives us whatever the last doc is
      const document: IFullDocumentResponse = response.data[response.data.length - 1]

      // Request deletion
      const deletedResponse = await test.instance
        .serverConnection()
        .delete(`products/${productId}/documents/${document.id}`)
      const deletedDocument: IFullDocumentResponse = deletedResponse.data

      expect(deletedDocument.id).toEqual(document.id)

      // Attempt to re-fetch same document, confirm deletion
      const confirmationResponse = await test.instance.serverConnection().get(`products/${productId}/documents`)
      expect(confirmationResponse.data.length).toBe(0) // empty
    })
  }
)
