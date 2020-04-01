import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import * as jestMock from 'jest-mock'
import 'reflect-metadata'

import DeactivatedDocumentDataAgent from '../../data-layer/data-agent/DeactivatedDocumentDataAgent'
import JtiDataAgent from '../../data-layer/data-agent/JtiDataAgent'
import JWSAgent from '../../data-layer/utils/JWSAgent'

import { DocumentsController } from './DocumentsController'

function mock(classType) {
  const mockType = jestMock.generateFromMetadata(jestMock.getMetadata(classType))
  return new mockType()
}

const jwtAgent = mock(JWSAgent)
const jtiDataAgent = mock(JtiDataAgent)
const deactivatedDocumentDataAgent = mock(DeactivatedDocumentDataAgent)

const companyRegistry = {
  getCompany: jest.fn(),
  getCompanyName: jest.fn().mockResolvedValue('companyName')
}
const docRegistry = {
  getTruffleContract: jest.fn(),
  findDocument: jest.fn().mockResolvedValue({
    companyStaticId: 'companyStaticId',
    timestamp: 12345678
  })
}

describe('DocumentsController', () => {
  let documentsController
  beforeAll(() => {
    documentsController = new DocumentsController(
      jwtAgent,
      companyRegistry,
      jtiDataAgent,
      docRegistry,
      deactivatedDocumentDataAgent
    )
  })

  it('should call deactivateDocument', async () => {
    jwtAgent.decodeAndVerify.mockResolvedValue({ staticId: 'staticId', jti: 'jti', hash: 'hash', deactivated: true })
    await documentsController.deactivate({ jws: 'jws' })
    expect(deactivatedDocumentDataAgent.deactivateDocument).toHaveBeenCalledWith('hash')
  })

  it('should call reactivateDocument', async () => {
    jwtAgent.decodeAndVerify.mockResolvedValue({ staticId: 'staticId', jti: 'jti', hash: 'hash', deactivated: false })
    await documentsController.deactivate({ jws: 'jws' })
    expect(deactivatedDocumentDataAgent.reactivateDocument).toHaveBeenCalledWith('hash')
  })

  it('should throw error if document not found in blockchain', async () => {
    jwtAgent.decodeAndVerify.mockResolvedValue({
      staticId: 'staticId',
      jti: 'jti',
      hash: '0xabc123',
      deactivated: false
    })
    docRegistry.findDocument.mockResolvedValueOnce(undefined)
    const resp = documentsController.deactivate({ jws: 'jws' })
    await expect(resp).rejects.toEqual(
      ErrorUtils.notFoundException(
        ErrorCode.BlockchainEventValidation,
        `Document with hash 0xabc123 is not registered in blockchain`
      )
    )
  })

  it('should return document registration info', async () => {
    deactivatedDocumentDataAgent.isDeactivated.mockResolvedValue(true)
    const hash = '0123456789'
    const result = await documentsController.verifyDocument(hash)

    expect(result).toMatchObject({
      registered: true,
      deactivated: true,
      documentInfo: {
        registeredAt: 12345678,
        registeredBy: 'companyName'
      }
    })
  })
})
