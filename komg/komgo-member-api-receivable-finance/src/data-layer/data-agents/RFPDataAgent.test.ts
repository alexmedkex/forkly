import { DataLayerError } from '../errors'
import { RFPRequestModel } from '../models/rfp/RFPRequestModel'

import { RFPDataAgent } from './RFPDataAgent'

const findOneMock = jest.fn()
const createMock = jest.fn()
const updateOneMock = jest.fn()
const mockRFPRequest = { rfpId: 'staticId', rdId: 'rdId', participantStaticIds: [] }
const mockRFPRequestDocument = {
  toObject: () => mockRFPRequest
}

describe('RFPDataAgent', () => {
  let dataAgent: RFPDataAgent

  beforeAll(() => {
    RFPRequestModel.findOne = findOneMock
    RFPRequestModel.updateOne = updateOneMock
    RFPRequestModel.create = createMock
  })

  beforeEach(() => {
    dataAgent = new RFPDataAgent()
  })

  describe('create', () => {
    it('should create an RFP', async () => {
      await dataAgent.create(mockRFPRequest)

      expect(createMock).toHaveBeenCalledWith(mockRFPRequest)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      createMock.mockImplementationOnce(() => {
        throw new Error()
      })

      await expect(dataAgent.create(mockRFPRequest)).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findByRdId', () => {
    it('should return a rfp request succesfully', async () => {
      const rdId = mockRFPRequest.rdId
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(mockRFPRequestDocument) })

      const data = await dataAgent.findByRdId(rdId)

      expect(findOneMock).toHaveBeenCalledWith({ rdId })
      expect(data).toEqual(mockRFPRequest)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      const rdId = 'rdId'
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      await expect(dataAgent.findByRdId(rdId)).rejects.toThrowError(DataLayerError)
    })
  })

  describe('findByRfpId', () => {
    it('should return a rfp request succesfully', async () => {
      const rfpId = mockRFPRequest.rfpId
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(mockRFPRequestDocument) })

      const data = await dataAgent.findByRfpId(rfpId)

      expect(findOneMock).toHaveBeenCalledWith({ rfpId })
      expect(data).toEqual(mockRFPRequest)
    })

    it('should throw a DataLayerError if the call to DB fails', async () => {
      const rfpId = 'rfpId'
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error()) })

      await expect(dataAgent.findByRfpId(rfpId)).rejects.toThrowError(DataLayerError)
    })
  })

  describe('updateCreate', () => {
    it('should throw a DataLayerError if the call to DB fails', async () => {
      updateOneMock.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error())
      })

      await expect(dataAgent.updateCreate(mockRFPRequest)).rejects.toThrowError(DataLayerError)
    })

    it('should create or update a received RFP without using default timestamps', async () => {
      const exec = jest.fn()
      updateOneMock.mockReturnValueOnce({ exec })

      await dataAgent.updateCreate(mockRFPRequest)

      expect(exec).toHaveBeenCalled()
      await expect(updateOneMock).toHaveBeenCalledWith(
        { rfpId: mockRFPRequest.rfpId },
        { ...mockRFPRequest },
        { upsert: true, timestamps: false, setDefaultsOnInsert: true }
      )
    })
  })
})
