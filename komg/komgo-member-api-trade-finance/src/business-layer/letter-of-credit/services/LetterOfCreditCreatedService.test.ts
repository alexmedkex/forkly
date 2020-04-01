import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import {
  LetterOfCreditStatus,
  LetterOfCreditType,
  buildFakeLetterOfCredit,
  ILetterOfCredit,
  IDataLetterOfCredit
} from '@komgo/types'

import { ILetterOfCreditDataAgent, LetterOfCreditDataAgent } from '../../../data-layer/data-agents'

import { soliditySha3, HashMetaDomain } from '../../common/HashFunctions'

import { ILetterOfCreditPartyActionProcessor } from '../processors/ILetterOfCreditPartyActionProcessor'
import { LetterOfCreditPartyActionProcessor } from '../processors/LetterOfCreditPartyActionProcessor'

import { LetterOfCreditCreatedService } from './LetterOfCreditCreatedService'
import { ILetterOfCreditEventService } from './ILetterOfCreditEventService'
import { removeNullsAndUndefined } from '../../util'

const mockGetRole = jest.fn()

jest.mock('../../util/getCompanyLCRole', () => {
  return {
    getCompanyLCRole: mockGetRole
  }
})

const rawEventMock = {
  address: '0x0',
  transactionHash: '0x12345'
}

const getLetterOfCreditHash = (letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) => {
  const lcToHash = { ...letterOfCredit }
  delete lcToHash.hashedData
  delete lcToHash.status
  delete lcToHash.transactionHash
  return soliditySha3(JSON.stringify(removeNullsAndUndefined(lcToHash)))
}

describe('LetterOfCreditCreatedService', () => {
  let service: ILetterOfCreditEventService
  let mockPartyActionProcessor: jest.Mocked<ILetterOfCreditPartyActionProcessor>
  let agentMock: jest.Mocked<ILetterOfCreditDataAgent>
  let letterOfCredit
  let logger

  describe('doEvent', () => {
    beforeEach(() => {
      mockPartyActionProcessor = createMockInstance(LetterOfCreditPartyActionProcessor)
      agentMock = createMockInstance(LetterOfCreditDataAgent)
      letterOfCredit = {
        ...buildFakeLetterOfCredit(),
        transactionHash: undefined
      }
    })

    describe('as applicant', () => {
      beforeEach(() => {
        service = new LetterOfCreditCreatedService('applicantid', agentMock, mockPartyActionProcessor)
        logger = (service as any).logger
        logger.info = jest.fn()
        logger.warn = jest.fn()
        logger.error = jest.fn()
      })

      describe('no letter of credit found', () => {
        it('should log a warning', async () => {
          let decodedEventMock = {
            creatorRole: 'applicant',
            creatorGuid: HashMetaDomain('applicantid'),
            hashedData: ''
          }

          agentMock.getByTransactionHash.mockImplementation(() => undefined)

          await service.doEvent(decodedEventMock, rawEventMock)
          expect(logger.error).toHaveBeenCalled()
          expect(agentMock.save).not.toHaveBeenCalled()
        })
      })

      describe('letter of credit found', () => {
        describe('hash is valid', () => {
          let letterOfCreditWhenHashIsValid: ILetterOfCredit<IDataLetterOfCredit>

          beforeEach(() => {
            letterOfCreditWhenHashIsValid = {
              ...buildFakeLetterOfCredit(),
              transactionHash: undefined
            }
            mockPartyActionProcessor.executePartyActions.mockReset()
            agentMock.getByTransactionHash.mockImplementation(() => letterOfCreditWhenHashIsValid)
          })

          describe('beneficiary bank is present', () => {
            it('should update the database with Requested, and publish messages', async () => {
              let decodedEventMock = {
                creatorRole: 'applicant',
                creatorGuid: HashMetaDomain('applicantid'),
                hashedData: ''
              }
              ;(letterOfCreditWhenHashIsValid as any).templateInstance.data.beneficiaryBank = {
                staticId: '1bc05a66-1eba-44f7-8f85-38204e4d3516',
                x500Name: {
                  CN: 'Soc Gen',
                  O: 'Soc Gen ltd',
                  C: 'country',
                  L: 'city',
                  STREET: 'street',
                  PC: 'postal code'
                }
              }

              decodedEventMock.hashedData = getLetterOfCreditHash(letterOfCreditWhenHashIsValid)

              await service.doEvent(decodedEventMock, rawEventMock)

              expect(agentMock.update).toHaveBeenCalledWith(
                { transactionHash: letterOfCreditWhenHashIsValid.transactionHash },
                {
                  contractAddress: rawEventMock.address,
                  status: LetterOfCreditStatus.Requested
                }
              )

              expect(mockPartyActionProcessor.executePartyActions).toHaveBeenCalledTimes(1)
              expect(mockPartyActionProcessor.executePartyActions).toHaveBeenCalledWith(letterOfCreditWhenHashIsValid)
            })
          })

          describe('beneficiary bank is not present', () => {
            it('should update the database with Requested, and publish messages', async () => {
              let decodedEventMock = {
                creatorRole: 'applicant',
                creatorGuid: HashMetaDomain('applicantid'),
                hashedData: ''
              }

              letterOfCreditWhenHashIsValid.templateInstance.data.beneficiaryBank = undefined

              decodedEventMock.hashedData = getLetterOfCreditHash(letterOfCreditWhenHashIsValid)

              agentMock.getByTransactionHash.mockImplementation(() => letterOfCreditWhenHashIsValid)

              await service.doEvent(decodedEventMock, rawEventMock)

              expect(agentMock.update).toHaveBeenCalledWith(
                { transactionHash: letterOfCreditWhenHashIsValid.transactionHash },
                {
                  contractAddress: rawEventMock.address,
                  status: LetterOfCreditStatus.Requested
                }
              )

              expect(mockPartyActionProcessor.executePartyActions).toHaveBeenCalledTimes(1)
              expect(mockPartyActionProcessor.executePartyActions).toHaveBeenCalledWith(letterOfCreditWhenHashIsValid)
            })
          })
        })

        describe('hash is not valid', () => {
          let lcWithInvalidHash: any
          let originalLC: ILetterOfCredit<IDataLetterOfCredit>

          beforeEach(() => {
            originalLC = buildFakeLetterOfCredit()
            lcWithInvalidHash = {
              ...originalLC,
              staticId: 'invalid'
            }

            mockPartyActionProcessor.executePartyActions.mockReset()
            agentMock.getByTransactionHash.mockImplementation(() => originalLC)
          })

          it('should update the database with Verification Failed', async () => {
            let decodedEventMock = {
              creatorRole: 'applicant',
              creatorGuid: HashMetaDomain('applicantid'),
              hashedData: getLetterOfCreditHash(lcWithInvalidHash)
            }

            await service.doEvent(decodedEventMock, rawEventMock)

            expect(agentMock.update).toHaveBeenCalledWith(
              { transactionHash: originalLC.transactionHash },
              {
                contractAddress: rawEventMock.address,
                status: LetterOfCreditStatus.Requested_Verification_Failed
              }
            )
            expect(logger.warn).toHaveBeenCalled()
            expect(mockPartyActionProcessor.executePartyActions).not.toHaveBeenCalled()
          })
        })
      })
    })

    describe('as other party', () => {
      beforeEach(() => {
        service = new LetterOfCreditCreatedService('otherpartyid', agentMock, mockPartyActionProcessor)
        logger = (service as any).logger
        logger.info = jest.fn()
        logger.warn = jest.fn()
        logger.error = jest.fn()
      })

      describe('letter of credit found', () => {
        beforeEach(() => {
          mockPartyActionProcessor.executePartyActions.mockReset()
        })

        describe('hash is valid', () => {
          beforeEach(() => {
            agentMock.getByTransactionHash.mockImplementation(() => letterOfCredit)
          })

          it('should update the database with Requested', async () => {
            let decodedEventMock = {
              creatorRole: 'applicant',
              creatorGuid: HashMetaDomain('applicantid'),
              hashedData: ''
            }

            decodedEventMock.hashedData = getLetterOfCreditHash(letterOfCredit)

            await service.doEvent(decodedEventMock, rawEventMock)

            expect(agentMock.update).toHaveBeenCalledWith(
              { transactionHash: letterOfCredit.transactionHash },
              {
                contractAddress: rawEventMock.address,
                status: LetterOfCreditStatus.Requested
              }
            )
          })
        })

        describe('hash is not valid', () => {
          it('should update the database with Verification Failed', async () => {
            const originalLC: ILetterOfCredit<IDataLetterOfCredit> = buildFakeLetterOfCredit()
            const lcWithInvalidProperty: ILetterOfCredit<IDataLetterOfCredit> = {
              ...originalLC,
              staticId: 'invalid'
            }

            let decodedEventMock = {
              creatorRole: 'applicant',
              creatorGuid: HashMetaDomain('applicantid'),
              hashedData: getLetterOfCreditHash(lcWithInvalidProperty)
            }

            agentMock.getByTransactionHash.mockImplementation(() => originalLC)

            await service.doEvent(decodedEventMock, rawEventMock)

            expect(agentMock.update).toHaveBeenCalledWith(
              { transactionHash: originalLC.transactionHash },
              {
                contractAddress: rawEventMock.address,
                status: LetterOfCreditStatus.Requested_Verification_Failed
              }
            )

            expect(mockPartyActionProcessor.executePartyActions).not.toHaveBeenCalled()
            expect(logger.warn).toHaveBeenCalled()
          })
        })
      })

      describe('no letter of credit found', () => {
        beforeEach(() => {
          mockPartyActionProcessor.executePartyActions.mockReset()
        })

        it('should create a new letter of credit with Verification Pending', async () => {
          let decodedEventMock = {
            creatorRole: 'applicant',
            creatorGuid: HashMetaDomain('applicantid'),
            hashedData: ''
          }

          const expectedLetterOfCredit = {
            contractAddress: rawEventMock.address,
            transactionHash: rawEventMock.transactionHash,
            hashedData: decodedEventMock.hashedData,
            version: 1,
            type: LetterOfCreditType.Standby,
            status: LetterOfCreditStatus.Requested_Verification_Pending
          }

          agentMock.getByTransactionHash.mockImplementation(() => undefined)

          await service.doEvent(decodedEventMock, rawEventMock)

          expect(agentMock.save).toHaveBeenCalledWith(expectedLetterOfCredit)
          expect(mockPartyActionProcessor.executePartyActions).not.toHaveBeenCalled()
        })
      })
    })
  })
})
