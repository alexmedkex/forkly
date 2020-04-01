import 'reflect-metadata'

import { LCDocumentManager } from './LCDocumentManager'
import { DOCUMENT_TYPE } from '../../../documents/documentTypes'
import { ContentNotFoundException } from '../../../../exceptions'

describe('LCDocumentManager', () => {
  let docManager
  const mockLc = {
    _id: '1',
    applicantId: 'app1',
    beneficiaryId: 'ben2'
  }

  const mockDocumentServiceClient: any = {
    getDocument: jest.fn(() => ({ id: 'swiftdoc' })),
    shareDocument: jest.fn(),
    deleteDocument: jest.fn()
  }

  const mockDocumentRequestBuilder: any = {
    getLCDocumentContext: jest.fn(() => ({ productId: 'tradeFinance' })),
    getLCDocumentToShareRequest: jest.fn()
  }

  const mockCompanyRegistryService: any = {
    getMembers: jest.fn(staticId => Promise.resolve({ data: [{ komgoMnid: 'mnid' + staticId }] }))
  }

  beforeEach(() => {
    docManager = new LCDocumentManager(
      mockDocumentServiceClient,
      mockDocumentRequestBuilder,
      mockCompanyRegistryService
    )
  })

  it('should raise error if no swift document', async () => {
    mockDocumentServiceClient.getDocument.mockImplementationOnce(() => null)

    await expect(docManager.shareDocument(mockLc, DOCUMENT_TYPE.LC, ['ben2'])).rejects.toBeInstanceOf(
      ContentNotFoundException
    )
  })

  it('delete document', async () => {
    mockDocumentServiceClient.deleteDocument.mockImplementationOnce(() => {})

    const result = await docManager.deleteDocument(mockLc, DOCUMENT_TYPE.LC)

    //expect(logger.info).toHaveBeenCalledTimes(1)

    await expect(result).toEqual(true)
  })

  it('delete document - not found', async () => {
    mockDocumentServiceClient.getDocument.mockImplementationOnce(() => null)

    const result = await docManager.deleteDocument(mockLc, DOCUMENT_TYPE.LC)

    //expect(logger.info).toHaveBeenCalledTimes(1)

    await expect(result).toEqual(false)
  })

  it('should not share with non members', async () => {
    mockCompanyRegistryService.getMembers.mockImplementationOnce(() =>
      Promise.resolve([{ staticId: 'staticId1', isMember: true }, { staticId: 'staticId2', isMember: false }])
    )

    await docManager.shareDocument(mockLc, DOCUMENT_TYPE.LC, ['staticId1', 'staticId2', 'staticId3'])

    expect(mockDocumentRequestBuilder.getLCDocumentToShareRequest).toHaveBeenCalledWith(mockLc, expect.anything(), [
      'staticId1'
    ])
  })
})
