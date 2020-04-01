import 'reflect-metadata'
import { Config } from '../../config'
import { onboardMemberENS } from './onboard-member-ens'
import * as artifacts from '../../utils/contract-artifacts'
import * as namehash from 'eth-ens-namehash'
import configDefault from '../../config.default'
import * as web3Utils from 'web3-utils'
import { allProducts } from '@komgo/products'
const sampleOnboardingJSONFile = require('../../utils/sample-onboarding-file.json')

jest.mock('../../utils/contract-artifacts')

const sampleStaticId = '56f57f2d-3bdd-459b-8a90-c2b7fba94cd2'

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => sampleStaticId)
  }
})

const uuid4Mock = require('uuid')

const contracts = artifacts.ContractArtifacts as jest.Mocked<any>

const mockKomgoRegistrar = {
  methods: {
    registerAndSetResolvers: jest.fn(() => {
      return {
        send: jest.fn(() => {
          return { transactionHash: '0x123' }
        })
      }
    })
  }
}

const mockKomgoOnboarder = {
  methods: {
    addCompaniesOnboardingInformation: jest.fn(() => {
      return {
        send: jest.fn()
      }
    }),
    transferCompanyNodes: jest.fn(() => {
      return {
        send: jest.fn()
      }
    })
  },
  options: {
    address: ''
  }
}

const mockKomgoMetaResolver = {
  methods: {
    staticId: jest.fn(() => {
      return {
        call: jest.fn(() => '123')
      }
    }),
    vaktStaticId: jest.fn(() => {
      return {
        call: jest.fn(() => '')
      }
    })
  }
}

const mockEnsRegistry = {
  methods: {
    owner: jest.fn(() => {
      return {
        call: jest.fn(() => '0x123')
      }
    }),
    setOwner: jest.fn(() => {
      return {
        send: jest.fn()
      }
    })
  }
}

const sampleAccount = '0x74d429B653748a56cB33531b26808b6D153680FD'

contracts.mockImplementation(() => {
  return {
    komgoOnboarder: jest.fn(() => mockKomgoOnboarder),
    komgoRegistrar: jest.fn(() => mockKomgoRegistrar),
    komgoMetaResolver: jest.fn(() => mockKomgoMetaResolver),
    ensRegistry: jest.fn(() => mockEnsRegistry)
  }
})

jest.mock('@komgo/blockchain-access', () => {
  return {
    Web3Wrapper: {
      web3Instance: {
        eth: {
          getAccounts: jest.fn(() => [sampleAccount])
        }
      }
    }
  }
})

jest.mock('./validate-input', () => {
  return {
    validateAll: jest.fn()
  }
})

const mockExit = jest.spyOn(process, 'exit').mockImplementation()

const validateMock = require('./validate-input')

let expectedResultSamplez: any = expectedResultSample()[0]

describe('onboard-member-ens', () => {
  beforeEach(() => {
    mockKomgoMetaResolver.methods.vaktStaticId.mockImplementation(() => {
      return {
        call: jest.fn(() => '')
      }
    })
  })

  describe('onboardMemberENS', () => {
    it('should onboard a company', async () => {
      let staticId = sampleOnboardingJSONFile[0].staticId
      let expectedResult = [
        {
          staticIdHashed: web3Utils.soliditySha3(staticId)
        }
      ]
      setMockValidationResult(sampleOnboardingJSONFile)

      await onboardAndExpect(expectedResult)
    })

    describe('without vakt only', () => {
      let input = generateInput()

      describe('no staticId is present', () => {
        it('should set staticId', async () => {
          let input = generateInput({
            staticId: undefined
          })
          let staticId = uuid4Mock.v4()
          let expectedResult = [
            {
              staticIdHashed: web3Utils.soliditySha3(staticId)
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expectedResult)
        })
      })

      describe('isMember == true && !komgoMnid', () => {
        it('should set komgoMnid', async () => {
          let input = generateInput({
            isMember: true,
            komgoMnid: undefined
          })
          let komgoMnid = uuid4Mock.v4()
          let expectedResult = [
            {
              textEntries: expect.arrayContaining([
                {
                  key: 'komgoMnid',
                  value: komgoMnid
                },
                {
                  key: 'isMember',
                  value: 'true'
                }
              ])
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expectedResult)
        })
      })

      describe('komgoMnid is defined', () => {
        it('should set komgoMnid', async () => {
          let input = generateInput({
            komgoMnid: '123'
          })
          let expectedResult = [
            {
              textEntries: expect.arrayContaining([
                {
                  key: 'komgoMnid',
                  value: '123'
                }
              ])
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expectedResult)
        })
      })

      describe('isMember is true', () => {
        let input = generateInput({
          isMember: true
        })
        let expectedResult: any = {
          textEntries: expect.arrayContaining([
            {
              key: 'isMember',
              value: 'true'
            }
          ])
        }
        it('should set komgoMessagingPublicKey', async () => {
          let expected = [
            {
              ...expectedResult,
              komgoMessagingPubKey: expectedResultSamplez.komgoMessagingPubKey
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expected)
        })

        it('should set ethereumPublicKey', async () => {
          let expected = [
            {
              ...expectedResult,
              ethPubKey: expectedResultSamplez.ethPubKey
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expected)
        })

        it('should set nodeKeys', async () => {
          let expected = [
            {
              textEntries: expect.arrayContaining([
                {
                  key: 'isMember',
                  value: 'true'
                },
                {
                  key: 'nodeKeys',
                  value: JSON.stringify(['1dQcior2UOmoq4zwCzSe2P1wB3I+qYKn0VY1u7+RVmQ='])
                }
              ])
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expected)
        })
      })

      describe('isMember is false', () => {
        let input = generateInput({
          isMember: false
        })
        let expectedResult: any = {
          textEntries: expect.arrayContaining([
            {
              key: 'isMember',
              value: 'false'
            }
          ])
        }
        it('should set default keys', async () => {
          let expected = [
            {
              ...expectedResult,
              ethPubKey: {
                publicKey: {
                  x: '0x0000000000000000000000000000000000000000000000000000000000000000',
                  y: '0x0000000000000000000000000000000000000000000000000000000000000000'
                },
                termDate: 0
              },
              komgoMessagingPubKey: {
                key: '',
                termDate: 0
              }
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expected)
        })
      })

      describe('vakt field is present', () => {
        let input = generateInput()

        it('should set vaktMessagingPublicKey', async () => {
          let expected = [
            {
              vaktMessagingPubKey: expectedResultSamplez.vaktMessagingPubKey
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expected)
        })

        describe('existingVaktId is empty', () => {
          mockKomgoMetaResolver.methods.vaktStaticId.mockImplementation(() => {
            return {
              call: jest.fn(() => '')
            }
          })

          it('should set vaktStaticId', async () => {
            let expected = [
              {
                textEntries: expect.arrayContaining([
                  {
                    key: 'vaktStaticId',
                    value: '63092'
                  }
                ])
              }
            ]
            setMockValidationResult(input)

            await onboardAndExpect(expected)
          })
        })

        it('should set vaktMnid', async () => {
          let expected = [
            {
              textEntries: expect.arrayContaining([
                {
                  key: 'vaktMnid',
                  value: 'EQUINOR_ASA_63092'
                }
              ])
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expected)
        })
      })

      describe('vakt field is not present', () => {
        let input = generateInput({
          vakt: undefined
        })
        it('should set default vaktMessagingPubKey', async () => {
          let expected = [
            {
              vaktMessagingPubKey: {
                key: '',
                termDate: 0
              }
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expected)
        })
      })

      it('should set hasSWIFTKey', async () => {
        let expected = [
          {
            textEntries: expect.arrayContaining([
              {
                key: 'hasSWIFTKey',
                value: 'false'
              }
            ])
          }
        ]
        setMockValidationResult(input)

        await onboardAndExpect(expected)
      })

      it('should set isFinancialInstitution', async () => {
        let expected = [
          {
            textEntries: expect.arrayContaining([
              {
                key: 'isFinancialInstitution',
                value: 'false'
              }
            ])
          }
        ]
        setMockValidationResult(input)

        await onboardAndExpect(expected)
      })

      it('should set isMember', async () => {
        let expected = [
          {
            textEntries: expect.arrayContaining([
              {
                key: 'isMember',
                value: 'false'
              }
            ])
          }
        ]
        setMockValidationResult(input)

        await onboardAndExpect(expected)
      })

      it('should set komgoProducts', async () => {
        let expected = [
          {
            textEntries: expect.arrayContaining([
              {
                key: 'komgoProducts',
                value: JSON.stringify(allProducts)
              }
            ])
          }
        ]
        setMockValidationResult(input)

        await onboardAndExpect(expected)
      })
    })

    describe('with vakt only', () => {
      let configmock = {
        get: jest.fn(() => true),
        data: configDefault,
        set: jest.fn(),
        cli: jest.fn()
      }
      describe('vakt field is present', () => {
        let input = generateInput()

        it('should set vaktMessagingPublicKey', async () => {
          let expected = [
            {
              vaktMessagingPubKey: expectedResultSamplez.vaktMessagingPubKey
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expected)
        })

        describe('existingVaktId is empty', () => {
          mockKomgoMetaResolver.methods.vaktStaticId.mockImplementation(() => {
            return {
              call: jest.fn(() => '')
            }
          })

          it('should set vaktStaticId', async () => {
            let expected = [
              {
                textEntries: expect.arrayContaining([
                  {
                    key: 'vaktStaticId',
                    value: '63092'
                  }
                ])
              }
            ]
            setMockValidationResult(input)

            await onboardAndExpect(expected)
          })
        })

        it('should set vaktMnid', async () => {
          let expected = [
            {
              textEntries: expect.arrayContaining([
                {
                  key: 'vaktMnid',
                  value: 'EQUINOR_ASA_63092'
                }
              ])
            }
          ]
          setMockValidationResult(input)

          await onboardAndExpect(expected)
        })
      })
    })
  })
})

function generateInput(fields: any = {}) {
  let input = {}
  Object.assign(input, sampleOnboardingJSONFile[0])
  return [modifyJson(fields, input)]
}

function modifyJson(fieldsToModify: any, json: any) {
  let fields: string[] = Object.keys(fieldsToModify)
  let currentField: string
  for (let i = 0; i < fields.length; i++) {
    currentField = fields[i]
    json[currentField] = fieldsToModify[currentField]
  }
  return json
}

function setMockValidationResult(result: any) {
  validateMock.validateAll.mockImplementation(() => {
    return result
  })
}

async function onboardAndExpect(expectedResult) {
  await onboardMemberENS(new Config(), 'filename.json')

  const call: any[][] = mockKomgoOnboarder.methods.addCompaniesOnboardingInformation.mock.calls[0]
  expect(call[0]).toMatchObject(expectedResult)
}

function expectedResultSample() {
  return [
    {
      staticIdHashed: web3Utils.soliditySha3(sampleOnboardingJSONFile[0].staticId),
      textEntries: [
        {
          key: 'x500Name',
          value: '{"CN":"Equinor ASA","O":"Equinor ASA","C":"NO","L":"Stavanger","STREET":"Forusbeen 50","PC":"4035"}'
        },
        { key: 'hasSWIFTKey', value: 'false' },
        { key: 'isFinancialInstitution', value: 'false' },
        { key: 'isMember', value: 'false' },
        { key: 'isFMS', value: 'false' },
        {
          key: 'komgoProducts',
          value: JSON.stringify(allProducts)
        },
        { key: 'nodeKeys', value: ['1dQcior2UOmoq4zwCzSe2P1wB3I+qYKn0VY1u7+RVmQ='] },
        { key: 'komgoMnid', value: '63092' },
        { key: 'vaktMnid', value: 'EQUINOR_ASA_63092' },
        { key: 'vaktStaticId', value: '63092' }
      ],
      vaktMessagingPubKey: {
        key: JSON.stringify(sampleOnboardingJSONFile[0].vakt.messagingPublicKey.key),
        termDate: 1543293902000,
        isEmpty: false
      },
      komgoMessagingPubKey: {
        key: JSON.stringify(sampleOnboardingJSONFile[0].messagingPublicKey.key),
        termDate: 1569709390000,
        isEmpty: false
      },
      ethPubKey: {
        publicKey: {
          x: '0x74d429B653748a56cB33531b26808b6D153680FD',
          y: '0x'
        },
        termDate: 1569709390000,
        isEmpty: false
      }
    }
  ]
}
