import 'reflect-metadata'

jest.mock('../../retry', () => ({
  ...require.requireActual('../../retry'),
  exponentialDelay: (delay: number) => {
    return (retryNum: number) => {
      return 0
    }
  }
}))

import { DocumentServiceClient } from './DocumentServiceClient'
import mockAxios from 'axios'

const mockAxiosGet = jest.fn()
const mockAxiosPost = jest.fn<{}>()
mockAxios.get = mockAxiosGet
mockAxios.post = mockAxiosPost

describe('DocumentServiceClient', () => {
  let docServiceClient
  beforeEach(() => {
    docServiceClient = new DocumentServiceClient('http://api-docs')
  })

  describe('getDocumentTypes', () => {
    it('should get doc types', async () => {
      const types = [{ type: 1 }]
      mockAxiosGet.mockImplementation(() => ({ data: types }))
      const result = await docServiceClient.getDocumentTypes('product', 'category')

      expect(result).toMatchObject(types)
      expect(mockAxiosGet).toHaveBeenCalledWith('http://api-docs/v0/products/product/types', {
        data: { categoryId: 'category' }
      })
    })

    it('should get doc types without category if not passed', async () => {
      const types = [{ type: 1 }]
      mockAxiosGet.mockImplementation(() => ({ data: types }))
      const result = await docServiceClient.getDocumentTypes('product')

      expect(result).toMatchObject(types)
      expect(mockAxiosGet).toHaveBeenCalledWith('http://api-docs/v0/products/product/types', { data: null })
    })

    it('should throw error if request fails', async () => {
      mockAxiosGet.mockImplementation(() => {
        throw new Error('some api error')
      })
      const result = docServiceClient.getDocumentTypes('product', 'category')

      await expect(result).rejects.toEqual(new Error(`Failed to get document types. some api error`))
    })

    it('should return null if no data retrieved', async () => {
      mockAxiosGet.mockImplementation(() => [])
      const result = await docServiceClient.getDocumentTypes('product', 'category')

      expect(result).toBeNull()
    })

    it('should call without category', async () => {
      mockAxiosGet.mockImplementation(() => [])
      const result = await docServiceClient.getDocumentTypes('product')

      expect(result).toBeNull()
    })
  })
})
