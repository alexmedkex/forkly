import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import 'reflect-metadata'

import MagicLinkService from '../../infrastructure/api-magic-link/MagicLinkService'
import { mock } from '../../mock-utils'

import { RegisterController } from './RegisterController'
import { SendDocumentsController } from './SendDocumentsController'
import { TradeFinanceController } from './TradeFinanceController'
const MockExpressRequest = require('mock-express-request')

const registerControllerMock = mock(RegisterController)
const sendDocumentsControllerMock = mock(SendDocumentsController)
const magicLinkServiceMock = mock(MagicLinkService)

jest.mock('uuid', () => ({
  v4: () => 'uuid4'
}))

describe('TradeFinanceController', () => {
  let controller
  const request = new MockExpressRequest({
    method: 'POST',
    url: '/trade-finance/categories/{categoryId}/types/{typeId}/register/{docId}',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data;'
    }
  })

  beforeEach(() => {
    controller = new TradeFinanceController(
      registerControllerMock,
      sendDocumentsControllerMock,
      magicLinkServiceMock,
      'CompanyStaticId'
    )
    jest.resetAllMocks()
  })

  it('should call upload', async () => {
    await controller.upload(request, 'category1', 'type1', 'jwt')
    expect(registerControllerMock.upload).toHaveBeenCalledWith(
      request,
      'tradeFinance',
      'category1',
      'type1',
      'jwt',
      true
    )
  })

  it('should call GetById', async () => {
    await controller.GetById('documentId')
    expect(registerControllerMock.GetById).toHaveBeenCalledWith('tradeFinance', 'documentId')
  })

  it('should call DownloadFile', async () => {
    await controller.DownloadFile(request, 'documentId', true)
    expect(registerControllerMock.DownloadFile).toHaveBeenCalledWith(request, 'tradeFinance', 'documentId', true)
  })

  it('should call DeleteDocument', async () => {
    await controller.DeleteDocument('documentId')
    expect(registerControllerMock.DeleteDocument).toHaveBeenCalledWith('tradeFinance', 'documentId')
  })

  it('should call SendDocuments', async () => {
    const documentRequest = {
      ...request,
      context: {
        ...request.context,
        reviewNotRequired: true,
        documentShareNotification: true
      }
    }
    await controller.SendDocuments(request)
    expect(sendDocumentsControllerMock.SendDocuments).toHaveBeenCalledWith('tradeFinance', documentRequest)
  })

  it('should call deactivateDocument with deactivated: false', async () => {
    registerControllerMock.GetById.mockResolvedValue({ contentHash: 'hash', komgoStamp: true })
    await controller.PatchIsActivated('documentId', { isActivated: true })
    expect(magicLinkServiceMock.deactivateDocument).toHaveBeenCalledWith({
      staticId: 'CompanyStaticId',
      jti: 'uuid4',
      hash: 'hash',
      deactivated: false
    })
  })

  it('should call deactivateDocument with deactivated: true', async () => {
    registerControllerMock.GetById.mockResolvedValue({ contentHash: 'hash', komgoStamp: true })
    await controller.PatchIsActivated('documentId', { isActivated: false })
    expect(magicLinkServiceMock.deactivateDocument).toHaveBeenCalledWith({
      staticId: 'CompanyStaticId',
      jti: 'uuid4',
      hash: 'hash',
      deactivated: true
    })
  })

  it('should call isDeactivated', async () => {
    registerControllerMock.GetById.mockResolvedValue({ contentHash: 'hash', komgoStamp: true })
    await controller.GetIsActivated('documentId')
    expect(magicLinkServiceMock.isDeactivated).toHaveBeenCalledWith('hash')
  })

  it('should throw error if document does not have komgo stamp', async () => {
    registerControllerMock.GetById.mockResolvedValue({ contentHash: 'hash', komgoStamp: false })

    await expect(controller.GetIsActivated('documentId')).rejects.toEqual(
      ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpContent,
        'Olny documents with komgo stamp can be activated or deactivated',
        null
      )
    )
  })
})
