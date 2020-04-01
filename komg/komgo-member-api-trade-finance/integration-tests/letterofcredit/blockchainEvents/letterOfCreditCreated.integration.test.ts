import 'reflect-metadata'
import Axios from 'axios'
import { randomHex } from 'web3-utils'
import MockAdapter from 'axios-mock-adapter'

import SmartContractInfo from '@komgo/smart-contracts'
import {
  ILetterOfCredit,
  buildFakeLetterOfCredit,
  LetterOfCreditStatus,
  IDataLetterOfCredit,
  LetterOfCreditTaskType
} from '@komgo/types'

import { HashMetaDomain, soliditySha3 } from '../../../src/business-layer/common/HashFunctions'
import { ILetterOfCreditDataAgent } from '../../../src/data-layer/data-agents'
import { TYPES, CONFIG } from '../../../src/inversify'

import { buildEventsMapping, buildEventObject, expectObjectInDatabase } from '../../utils/utils'
import { IntegrationEnvironment } from '../../utils/IntegrationEnvironment'
import { AxiosMockUtils } from '../../mocks/AxiosMockUtils'
import MessagingUtility from '../../utils/MessagingUtility'
import { removeNullsAndUndefined } from '../../../src/business-layer/util'
import * as notifPublisher from '@komgo/notification-publisher'
import waitForExpect from 'wait-for-expect'
import { TRADE_FINANCE_ACTION, TRADE_FINANCE_PRODUCT_ID } from '../../../src/business-layer/tasks/permissions'

let axiosMockUtils

const integrationEnvironment = new IntegrationEnvironment()

jest.setTimeout(60000)

const web3Utils = require('web3-utils')
const events = buildEventsMapping([{ abi: SmartContractInfo.LetterOfCredit.ABI }])

describe('LetterOfCredit contract events', () => {
  let dataAgent: ILetterOfCreditDataAgent
  let messagingUtils: MessagingUtility
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let transactionHash: string
  let contractAddress: string
  let lcDataHashed: string
  let APPLICANT_NODE: string
  let applicantHex: string
  let eventObject

  beforeAll(async done => {
    letterOfCredit = {
      ...buildFakeLetterOfCredit(),
      status: LetterOfCreditStatus.Pending,
      transactionHash: undefined,
      contractAddress: undefined
    }

    letterOfCredit.templateInstance.bindings = {} // this is a temp hack in order to circumvent the "key $schema must not start with '$'"" error
    letterOfCredit = removeNullsAndUndefined(letterOfCredit)

    lcDataHashed = getLCHash(letterOfCredit)
    letterOfCredit.hashedData = lcDataHashed

    await integrationEnvironment.setup(letterOfCredit.templateInstance.data.applicant.staticId)
    await integrationEnvironment.startServer()

    axiosMockUtils = new AxiosMockUtils(new MockAdapter(Axios))
    messagingUtils = new MessagingUtility()

    await messagingUtils.createPublisher(integrationEnvironment.iocContainer.get<string>(CONFIG.FromPublisherId))
    await messagingUtils.createConsumer(integrationEnvironment.iocContainer.get<string>(CONFIG.PublisherId))

    dataAgent = integrationEnvironment.iocContainer.get<ILetterOfCreditDataAgent>(TYPES.LetterOfCreditDataAgent)
    done()
  })

  beforeEach(async done => {
    await messagingUtils.setup()
    done()
  })

  describe('LetterOfCreditCreated event', () => {
    beforeEach(() => {
      applicantHex = web3Utils.asciiToHex('applicant')
    })

    describe('as applicant', () => {
      beforeEach(async done => {
        transactionHash = randomHex(32)
        contractAddress = randomHex(32)

        APPLICANT_NODE = HashMetaDomain(process.env.COMPANY_STATIC_ID)
        eventObject = buildEventObject(
          ['bytes32', 'bytes32', 'bytes32'],
          [applicantHex, APPLICANT_NODE, lcDataHashed],
          events.LetterOfCreditCreated,
          transactionHash,
          contractAddress
        )

        const letterOfCreditWithHash = {
          ...letterOfCredit,
          transactionHash
        }

        await dataAgent.save(letterOfCreditWithHash)

        done()
      })

      it('should update the database with Requested status', async done => {
        await messagingUtils.publish(`BLK.${events.LetterOfCreditCreated}`, eventObject)
        expectObjectInDatabase(
          dataAgent,
          {
            transactionHash: eventObject.transactionHash,
            contractAddress: eventObject.contractAddress,
            status: LetterOfCreditStatus.Requested
          },
          done
        )
      })

      it('should send letter of credit to other parties', async done => {
        const letterOfCreditWithHash = {
          ...letterOfCredit,
          transactionHash
        }

        axiosMockUtils.mockSuccessCompanyRegistryGetMember([{ staticId: '123', isMember: true }])

        messagingUtils.waitForAndExpectMessage(
          'komgo-internal',
          {
            routingKey: 'komgo-internal',
            content: {
              ...letterOfCreditWithHash,
              status: LetterOfCreditStatus.Requested,
              messageType: 'KOMGO.LetterOfCredit'
            }
          },
          done
        )
        await messagingUtils.publish(
          `BLK.${events.LetterOfCreditCreated}`,
          eventObject,
          `${messagingUtils.consumerName}.${integrationEnvironment.iocContainer.get<string>(CONFIG.PublisherId)}.queue`
        )
      })
    })

    describe('as other party', () => {
      beforeEach(async done => {
        transactionHash = randomHex(32)
        contractAddress = randomHex(32)

        APPLICANT_NODE = HashMetaDomain('someOtherCompany')
        eventObject = buildEventObject(
          ['bytes32', 'bytes32', 'bytes32'],
          [applicantHex, APPLICANT_NODE, lcDataHashed],
          events.LetterOfCreditCreated,
          transactionHash,
          contractAddress
        )
        await messagingUtils.publish(`BLK.${events.LetterOfCreditCreated}`, eventObject)
        done()
      })

      describe('hash is invalid', () => {
        it('should update the database with VerificationFailed status', async done => {
          const aLetterOfCreditWithInvalidStaticId = {
            ...letterOfCredit,
            staticId: 'invalid'
          }

          await dataAgent.save({
            ...aLetterOfCreditWithInvalidStaticId,
            transactionHash: eventObject.transactionHash
          })
          expectObjectInDatabase(
            dataAgent,
            {
              transactionHash: eventObject.transactionHash,
              contractAddress: eventObject.contractAddress,
              status: LetterOfCreditStatus.Requested_Verification_Failed
            },
            done
          )
        })
      })

      describe('hash is valid', () => {
        describe('no letter of credit found', () => {
          it('should save a new letter of credit in the database', async done => {
            expectObjectInDatabase(
              dataAgent,
              {
                transactionHash: eventObject.transactionHash,
                contractAddress: eventObject.contractAddress,
                status: LetterOfCreditStatus.Requested_Verification_Pending
              },
              done
            )
          })
        })
      })
    })

    describe('as beneficiary', () => {
      let eventObject

      beforeEach(async done => {
        transactionHash = randomHex(32)
        contractAddress = randomHex(32)
        let letterOfCreditWithHash = {
          ...letterOfCredit,
          transactionHash
        }
        letterOfCreditWithHash.templateInstance.data.applicant.staticId = '123'
        letterOfCreditWithHash.templateInstance.data.beneficiary.staticId = integrationEnvironment.iocContainer.get<
          string
        >(CONFIG.CompanyStaticId)

        const lcDataHashed = getLCHash(letterOfCreditWithHash)
        letterOfCreditWithHash.hashedData = lcDataHashed
        applicantHex = web3Utils.asciiToHex('applicant')

        APPLICANT_NODE = HashMetaDomain('someOtherCompany')
        eventObject = buildEventObject(
          ['bytes32', 'bytes32', 'bytes32'],
          [applicantHex, APPLICANT_NODE, lcDataHashed],
          events.LetterOfCreditCreated,
          transactionHash,
          contractAddress
        )

        await dataAgent.save(letterOfCreditWithHash)
        await messagingUtils.publish(`BLK.${events.LetterOfCreditCreated}`, eventObject)
        done()
      })

      it('should send a notification', async done => {
        let spy = jest
          .spyOn(notifPublisher.NotificationManager.prototype, 'createNotification')
          .mockImplementation(jest.fn())
        const expectedResult = [
          {
            context: {
              staticId: letterOfCredit.staticId,
              type: 'ILetterOfCredit'
            },
            level: 'info',
            message: `Letter of credit [${letterOfCredit.reference}] has been requested by ${
              letterOfCredit.templateInstance.data.applicant.x500Name.CN
            }`,
            productId: TRADE_FINANCE_PRODUCT_ID,
            requiredPermission: {
              actionId: TRADE_FINANCE_ACTION.ReviewLCApplication,
              productId: TRADE_FINANCE_PRODUCT_ID
            },
            type: LetterOfCreditTaskType.ReviewRequested
          }
        ]

        await waitForExpect(() => {
          expect(spy.mock.calls[0]).toEqual(expectedResult)
          spy.mockRestore()
          done()
        })
      })
    })

    describe('as issuing bank', () => {
      beforeEach(async done => {
        transactionHash = randomHex(32)
        contractAddress = randomHex(32)
        let letterOfCreditWithHash = {
          ...letterOfCredit,
          transactionHash
        }
        letterOfCreditWithHash.templateInstance.data.applicant.staticId = '123'
        letterOfCreditWithHash.templateInstance.data.issuingBank.staticId = integrationEnvironment.iocContainer.get<
          string
        >(CONFIG.CompanyStaticId)

        const lcDataHashed = getLCHash(letterOfCreditWithHash)
        letterOfCreditWithHash.hashedData = lcDataHashed
        applicantHex = web3Utils.asciiToHex('applicant')

        APPLICANT_NODE = HashMetaDomain('someOtherCompany')
        eventObject = buildEventObject(
          ['bytes32', 'bytes32', 'bytes32'],
          [applicantHex, APPLICANT_NODE, lcDataHashed],
          events.LetterOfCreditCreated,
          transactionHash,
          contractAddress
        )

        await dataAgent.save(letterOfCreditWithHash)
        done()
      })

      beforeEach(async done => {
        await messagingUtils.publish(`BLK.${events.LetterOfCreditCreated}`, eventObject)
        done()
      })

      it('should send a task', async done => {
        let spy = jest.spyOn(notifPublisher.TaskManager.prototype, 'createTask').mockImplementation(jest.fn())
        const taskSummary = `Letter of credit [${letterOfCredit.reference}] has been requested by ${
          letterOfCredit.templateInstance.data.applicant.x500Name.CN
        }`

        const expectedResult = [
          {
            context: {
              staticId: letterOfCredit.staticId,
              type: 'ILetterOfCredit'
            },
            emailData: {
              subject: 'Letter of credit Requested',
              taskLink: 'http://localhost:3010/tasks',
              taskTitle: 'Review Letter of credit Request'
            },
            requiredPermission: {
              actionId: TRADE_FINANCE_ACTION.ReviewLCApplication,
              productId: TRADE_FINANCE_PRODUCT_ID
            },
            status: notifPublisher.TaskStatus.ToDo,
            summary: taskSummary,
            taskType: LetterOfCreditTaskType.ReviewRequested
          },
          taskSummary
        ]
        await waitForExpect(() => {
          expect(spy.mock.calls[0]).toEqual(expectedResult)
          spy.mockRestore()
          done()
        })
      })
    })

    afterEach(async done => {
      await messagingUtils.tearDown()
      axiosMockUtils.reset()
      done()
    })

    afterAll(async done => {
      await integrationEnvironment.stopServer()
      await integrationEnvironment.tearDown()
      done()
    })
  })
})

function getLCHash(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): string {
  const newlcResult = { ...letterOfCredit }
  delete newlcResult.hashedData
  delete newlcResult.status
  delete newlcResult.transactionHash
  console.log(JSON.stringify(newlcResult))
  return soliditySha3(JSON.stringify(newlcResult))
}
