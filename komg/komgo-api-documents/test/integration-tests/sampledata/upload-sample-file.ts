import { axiosRetry } from '@komgo/retry'
import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as FormData from 'form-data'
import * as fs from 'fs'

import { IFullDocumentResponse } from '../../../src/service-layer/responses/document/IFullDocumentResponse'
import { EnvironmentInstance } from '../utils/EnvironmentInstance'
import { enhancedAxiosErrorMessage } from '../utils/utils'

import { contracts, extraDocumentData, userProfile } from './sampleData'

export async function uploadSampleFile(
  sampleFilePath,
  { productId, categoryId, typeId },
  testInstance: EnvironmentInstance,
  hash: string
): Promise<IFullDocumentResponse> {
  const fd = buildSampleUploadFormData(sampleFilePath)

  const requestHeaders = {
    ...fd.getHeaders(),
    Authorization: 'Bearer 0xsampleToken'
  }

  // multipart/form-data headers
  const axiosMultipartInstance = Axios.create({
    baseURL: testInstance.serverBaseUrl(),
    timeout: 5000,
    headers: requestHeaders
  })
  axiosMultipartInstance.interceptors.response.use(resp => resp, enhancedAxiosErrorMessage)

  // =======================
  // Api-Signer mocked results
  // =======================
  const docSignature = 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a'
  const docRegisterTxHash = hash || '0x65462b0520ef7d3df61b9992ed3bea0c56ead753be7c8b3614e0ce01e4cac41b'

  // Mocking Api calls for Api-Signer & Api-Registry
  await testInstance.mockServer().mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: testInstance.apiRoutes().registry.getMembers
    },
    httpResponse: {
      body: JSON.stringify(contracts)
    }
  })

  await testInstance.mockServer().mockAnyResponse({
    httpRequest: {
      method: 'POST',
      path: testInstance.apiRoutes().signer.sign
    },
    httpResponse: {
      body: JSON.stringify(docSignature)
    }
  })

  await testInstance.mockServer().mockAnyResponse({
    httpRequest: {
      method: 'GET',
      path: testInstance.apiRoutes().users.profile
    },
    httpResponse: {
      body: JSON.stringify(userProfile)
    }
  })

  await testInstance.mockServer().mockAnyResponse({
    httpRequest: {
      method: 'POST',
      path: testInstance.apiRoutes().signer.sendPublicTransaction
    },
    httpResponse: {
      body: JSON.stringify(docRegisterTxHash)
    }
  })

  let resp
  await axiosRetry(
    async () => {
      resp = await axiosMultipartInstance.post(
        `products/${productId}/categories/${categoryId}/types/${typeId}/documents`,
        fd,
        requestHeaders
      )
    },
    {
      delay: () => 1e3,
      maxRetries: 10
    }
  )

  const receivedDocument: IFullDocumentResponse = resp.data
  return receivedDocument
}

function buildSampleUploadFormData(filepath: string) {
  const file = fs.createReadStream(filepath)

  const fd = new FormData()
  fd.append('extraData', JSON.stringify(extraDocumentData))
  fd.append('fileData', file, {
    filename: filepath,
    contentType: undefined
  })

  return fd
}
