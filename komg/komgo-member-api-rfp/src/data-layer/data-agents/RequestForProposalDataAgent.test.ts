import { IRequestForProposalBase, buildFakeRequestForProposalBase } from '@komgo/types'
import 'reflect-metadata'
// tslint:disable-next-line
import validator from 'validator'

import { RequestForProposal } from '../models/mongo/RequestForProposal'

import { RequestForProposalDataAgent } from './RequestForProposalDataAgent'

const findOneMock = jest.fn()
const createMock = jest.fn()

describe('RequestForProposalDataAgent', () => {
  let rfpBaseData: IRequestForProposalBase
  let rfpDataAgent: RequestForProposalDataAgent
  let mockRfpDocument: jest.Mocked<any>

  beforeEach(() => {
    jest.resetAllMocks()
    RequestForProposal.create = createMock
    RequestForProposal.findOne = findOneMock
    rfpDataAgent = new RequestForProposalDataAgent()
    rfpBaseData = buildFakeRequestForProposalBase()

    mockRfpDocument = {
      // this is used in to pass back a pojo rather than the MongooseDocument
      toObject: jest.fn().mockImplementation(() => {
        return {
          ...rfpBaseData
        }
      })
    }
  })

  it('should return the saved object with a static ID', async () => {
    createMock.mockResolvedValue(mockRfpDocument)

    const savedData = await rfpDataAgent.create(rfpBaseData)

    expect(savedData).toEqual({ ...rfpBaseData })
    // check static ID was created
    const dataSaved = createMock.mock.calls[0][0]
    expect(validator.isUUID(dataSaved.staticId)).toBeTruthy()
  })

  it('should return a rfp data for the given staticId', async () => {
    const mockQuery = { exec: jest.fn().mockResolvedValue(mockRfpDocument) }
    findOneMock.mockReturnValueOnce(mockQuery)

    const savedData = await rfpDataAgent.findOneByStaticId('mockId')
    expect(savedData).toEqual({ ...rfpBaseData })
  })
})
