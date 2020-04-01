import 'reflect-metadata'

import { buildFakeAmendmentBase, buildFakeAmendment } from '@komgo/types'
import { LCAmendmentController } from './LCAmendmentController'
import getUser from '../../business-layer/util/getUser'
import decode from '../../middleware/utils/decode'
import { ILCAmendmentUseCase } from '../../business-layer/ILCAmendmentUseCase'
import { ILCAmendmentDataAgent } from '../../data-layer/data-agents'
import { HttpException } from '@komgo/microservice-config'

const lcAmendmentUseCaseMock: jest.Mocked<ILCAmendmentUseCase> = {
  create: jest.fn(),
  approve: jest.fn(),
  reject: jest.fn()
}

const lcAmendmentDataAgentMock: jest.Mocked<ILCAmendmentDataAgent> = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  getByAddress: jest.fn()
}

let controller: LCAmendmentController
const JWT_MOCK: string =
  'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJCZTB6VktGN1BGTGtKTGVHaGNOVzU0ckhUckRBZThkVERqYUJTMjFkMFZjIn0.eyJqdGkiOiJhNTUyM2RhZS0yMDEwLTQyZWEtOTM0Yy1iOGY1Yzg4NjhjZGYiLCJleHAiOjE1NDMzMjcxMjUsIm5iZiI6MCwiaWF0IjoxNTQzMzI2ODI1LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwNzAvYXV0aC9yZWFsbXMvS09NR08iLCJhdWQiOiJ3ZWItYXBwIiwic3ViIjoiN2EyZmQwMzYtNTBlOC00NzA2LTllOWQtMzgyNWVlNjY1YmQ5IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsIm5vbmNlIjoiZTNiNDY5MWQtYTUxMi00YjZhLTg3MDktYzcwZjI4MmUwOGQ5IiwiYXV0aF90aW1lIjoxNTQzMzI2ODI1LCJzZXNzaW9uX3N0YXRlIjoiNzE5NjQxNjUtMjNjZi00MWI4LWE5ZTAtOTdiODY5NjIwZjMxIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMTAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidHJhZGVGaW5hbmNlT2ZmaWNlciIsIm1pZGRsZUFuZEJhY2tPZmZpY2VyIiwidXNlckFkbWluIiwidW1hX2F1dGhvcml6YXRpb24iLCJyZWxhdGlvbnNoaXBNYW5hZ2VyIiwia3ljQW5hbHlzdCIsImNvbXBsaWFuY2VPZmZpY2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJtYW5hZ2UtdXNlcnMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlN1cGVyIFVzZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzdXBlcnVzZXIiLCJnaXZlbl9uYW1lIjoiU3VwZXIiLCJmYW1pbHlfbmFtZSI6IlVzZXIiLCJlbWFpbCI6InN1cGVyQGtvbWdvLmlvIn0.HysQLhMcdockuZ0MuAmqW0L6VpuLy0bdvlHlVEHfsIADDaXKbRVkxe1kx0ezCMwLc6Uvp-ohy-2EyXXNUKhk_uoqqkKnhYLMIRD2cK9yIYvWi_Q1f5uazfBMnp53M8VQWxvzGPtJpAtYHmwKpLb5uK4XoiHpdEH1WnMYrWdM4dpzYcX-jygpnQX4oVgVUswybBwEUTn-OqY8wNNVX2GLbtKxTwi2OjCvPRVs-qZ5KJYpsYOq0Mpm1RrS-4A-CL942Eee5RYPFNvQNuZqcDGb2kNvnCNpC7Z954OgCrJ7m3MCjh2Ndw0K2Hp_D1IFk0O1LPdW-BS4kvgChQwjQEkG7A'
const TX_HASH_MOCK = '0x123'
const STATIC_ID_MOCK = 'bd42a696-7dbb-4b53-b66a-237b2f03018f'
const LC_STATIC_ID_MOCK = 'df954b02-e17a-4ae1-949f-32a25ab432e7'

describe('LCController', () => {
  beforeEach(() => {
    controller = new LCAmendmentController(lcAmendmentUseCaseMock, lcAmendmentDataAgentMock)
  })
  describe('create', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })
    it('success', async () => {
      lcAmendmentUseCaseMock.create.mockImplementation(() => [TX_HASH_MOCK, STATIC_ID_MOCK])
      const amendment = buildFakeAmendmentBase({
        lcStaticId: LC_STATIC_ID_MOCK
      })
      const { transactionHash, id } = await controller.create(LC_STATIC_ID_MOCK, amendment, JWT_MOCK)
      expect(lcAmendmentUseCaseMock.create).toHaveBeenCalledWith(amendment, getUser(decode(JWT_MOCK)))
      expect(transactionHash).toEqual(TX_HASH_MOCK)
      expect(id).toEqual(STATIC_ID_MOCK)
    })

    describe('failure', () => {
      it('invalid data', async () => {
        const amendment = {
          ...buildFakeAmendmentBase({ lcStaticId: LC_STATIC_ID_MOCK }),
          diffs: []
        }
        await expect(controller.create(LC_STATIC_ID_MOCK, amendment, JWT_MOCK)).rejects.toBeInstanceOf(HttpException)
        expect(lcAmendmentUseCaseMock.create).not.toHaveBeenCalled()
      })

      it('failed transaction', async () => {
        const error = new Error('Boom!')
        lcAmendmentUseCaseMock.create.mockImplementation(() => Promise.reject(error))
        const amendment = buildFakeAmendmentBase({
          lcStaticId: LC_STATIC_ID_MOCK
        })

        await expect(
          controller.create(LC_STATIC_ID_MOCK, amendment, JWT_MOCK)
          // WARNING toThrow doesn't work du to Exceptions implementation
        ).rejects.toBeInstanceOf(HttpException)
        expect(lcAmendmentUseCaseMock.create).toHaveBeenCalledWith(amendment, getUser(decode(JWT_MOCK)))
      })

      it('lc id mismatch', async () => {
        const error = new Error('Boom!')
        lcAmendmentUseCaseMock.create.mockImplementation(() => Promise.reject(error))
        const amendment = buildFakeAmendmentBase({
          lcStaticId: LC_STATIC_ID_MOCK
        })

        const LC_STATIC_ID_WRONG_MOCK = 'wrong-id'

        await expect(controller.create(LC_STATIC_ID_WRONG_MOCK, amendment, JWT_MOCK)).rejects.toBeInstanceOf(
          HttpException
        )
        expect(lcAmendmentUseCaseMock.create).not.toHaveBeenCalled()
      })
    })
  })

  describe('get', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })
    it('success', async () => {
      const lcStaticId = '31829f83-828b-4392-8dc2-292944c9e34e'
      const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
      const amendmentMock = buildFakeAmendment()
      lcAmendmentDataAgentMock.get.mockImplementation(() => Promise.resolve(amendmentMock))
      const amendment = await controller.get(staticId)
      expect(lcAmendmentDataAgentMock.get).toHaveBeenCalledWith(staticId)
      expect(amendment).toEqual(amendmentMock)
    })

    describe('failure', () => {
      it('returns 404', async () => {
        const lcStaticId = '31829f83-828b-4392-8dc2-292944c9e34e'
        const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
        lcAmendmentDataAgentMock.get.mockImplementation(() => Promise.resolve(null))

        await expect(
          controller.get(staticId)
          // WARNING toThrow doesn't work du to Exceptions implementation
        ).rejects.toBeInstanceOf(HttpException)
        expect(lcAmendmentDataAgentMock.get).toHaveBeenCalledWith(staticId)
      })

      it('returns 500', async () => {
        const lcStaticId = '31829f83-828b-4392-8dc2-292944c9e34e'
        const staticId = '75d27f9a-10fd-4350-a7f6-9acccfa75ecb'
        lcAmendmentDataAgentMock.get.mockImplementation(() => Promise.reject(new Error('Boom!')))

        await expect(
          controller.get(staticId)
          // WARNING toThrow doesn't work du to Exceptions implementation
        ).rejects.toBeInstanceOf(HttpException)
        expect(lcAmendmentDataAgentMock.get).toHaveBeenCalledWith(staticId)
      })
    })
  })
})
