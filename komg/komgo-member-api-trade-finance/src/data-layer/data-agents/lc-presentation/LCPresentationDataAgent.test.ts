import 'reflect-metadata'

const mockLCPresentationRepo = {
  find: jest.fn().mockImplementation(record => {
    return Promise.resolve({ staticId: 'presentationId' })
  }),
  create: jest.fn().mockImplementation(record => {
    return Promise.resolve({ staticId: 'presentationId', ...record })
  }),
  findOne: jest.fn().mockImplementation((record: any) => {
    return Promise.resolve({ staticId: 'presentationId' })
  }),
  updateOne: jest.fn().mockImplementation((query: any, data: any) => {
    return Promise.resolve({ n: 1 })
  }),
  findOneAndUpdate: jest.fn().mockImplementation(record => {
    return Promise.resolve({ staticId: 'presentationId' })
  })
}

jest.mock('../../mongodb/LCPresentationRepo', () => ({
  LCPresentationRepo: mockLCPresentationRepo
}))

import { LCPresentationDataAgent } from './LCPresentationDataAgent'
import { ContentNotFoundException } from '../../../exceptions'
import { ILCPresentation } from '../../models/ILCPresentation'
import { LCPresentationDocumentStatus, LCPresentationStatus } from '@komgo/types'

const MOCK_DATA: ILCPresentation = {
  staticId: '10ba038e-48da-487b-96e8-8d3b99b6d18a',
  beneficiaryId: 'beneficiaryId',
  applicantId: 'applicantId',
  issuingBankId: 'issuingBankId',
  nominatedBankId: 'nominatedBankId',
  LCReference: '2018-BP-16',
  reference: '1549016621690',
  documents: [
    {
      documentId: 'documentId',
      documentHash: 'documentHash',
      status: LCPresentationDocumentStatus.Draft,
      documentTypeId: 'documentTypeId',
      dateProvided: new Date('2019-02-02')
    }
  ],
  status: LCPresentationStatus.Draft,
  stateHistory: [
    {
      toState: LCPresentationDocumentStatus.Draft,
      performer: '08e9f8e3-94e5-459e-8458-ab512bee6e2c',
      date: new Date('2019-02-02')
    }
  ],
  submittedAt: new Date('2019-02-02')
}

describe('LCPresentationDataAgent', () => {
  const presentation = new LCPresentationDataAgent()
  it('is defined', () => {
    expect(presentation).toBeDefined()
  })
  it('create presentation', async () => {
    await presentation.savePresentation({ staticId: 'presentationId', ...MOCK_DATA })
    expect(mockLCPresentationRepo.findOneAndUpdate).toHaveBeenCalled()
  })
  it('should create presentation is not exists', async () => {
    await presentation.savePresentation(MOCK_DATA)
    expect(mockLCPresentationRepo.findOneAndUpdate).toHaveBeenCalled()
  })
  it('get presentation by id', async () => {
    const presentationById = await presentation.getById('presentationId')
    expect(presentationById).toEqual({
      staticId: 'presentationId'
    })
  })
  it('get presentation by reference', async () => {
    await presentation.getByReference('reference')
    expect(mockLCPresentationRepo.findOne).toHaveBeenCalledWith({ reference: 'reference', deletedAt: null })
  })
  it('get presentation by LC reference', async () => {
    await presentation.getByLcReference('lcreference')

    expect(mockLCPresentationRepo.find).toHaveBeenCalledWith({ LCReference: 'lcreference', deletedAt: null })
  })
  it('get presentation by attibutes', async () => {
    await presentation.getByAttributes({ LCReference: 'lcreference' })

    expect(mockLCPresentationRepo.findOne).toHaveBeenCalledWith({ LCReference: 'lcreference', deletedAt: null })
  })
  it('delete presentation by id', async () => {
    await presentation.deleteLCPresentation('presentationId')
    expect(mockLCPresentationRepo.updateOne).toHaveBeenCalledWith(
      { staticId: 'presentationId', deletedAt: null },
      { deletedAt: expect.anything() }
    )
  })
  it('delete should fail if id not found', async () => {
    mockLCPresentationRepo.updateOne = jest.fn().mockImplementation((query: any, data: any) => {
      return Promise.resolve({ n: 0 })
    })
    await expect(presentation.deleteLCPresentation('presentationId')).rejects.toBeInstanceOf(ContentNotFoundException)
  })
})
