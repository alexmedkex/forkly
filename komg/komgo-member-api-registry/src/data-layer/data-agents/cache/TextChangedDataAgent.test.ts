import 'reflect-metadata'
import { TextChangedDataAgent } from './TextChangedDataAgent'
import { IMemberDAO } from '../../dao/IMemberDAO'

const memberDaoMock: IMemberDAO = {
  clearAll: jest.fn(),
  findByParentAndLabel: jest.fn(),
  createNewMemberCompany: jest.fn(),
  addEthPubKey: jest.fn(),
  revokeEthPubKey: jest.fn(),
  addKomgoMessagingPubKey: jest.fn(),
  revokeKomgoMessagingPubKey: jest.fn(),
  addVaktMessagingPubKey: jest.fn(),
  revokeVaktMessagingPubKey: jest.fn(),
  getMembers: jest.fn(),
  updateField: jest.fn()
}

describe('TextChangedDataAgent', () => {
  const agent = new TextChangedDataAgent(memberDaoMock)

  describe('should call updateField', () => {
    it('with the correct parameters for staticId', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'staticId',
        _value: '1bc05a66-1eba-44f7-8f85-38204e4d3516'
      }

      await agent.saveEvent(mockEvent)
      expect(memberDaoMock.updateField).toHaveBeenCalledWith(mockEvent._node, mockEvent._key, mockEvent._value)
    })

    it('with the correct parameters for komgoMnid', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'komgoMnid',
        _value: '9a2908a4-ec69-478d-a3f7-e02e8a6bb193'
      }

      await agent.saveEvent(mockEvent)
      expect(memberDaoMock.updateField).toHaveBeenCalledWith(mockEvent._node, mockEvent._key, mockEvent._value)
    })

    it('with the correct parameters for nodeKeys', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'nodeKeys',
        _value: JSON.stringify(['3Jc5AVUyDKIC7SVptEESgn/PO7K0NCknulJQbxdGFWQ='])
      }

      await agent.saveEvent(mockEvent)
      expect(memberDaoMock.updateField).toHaveBeenCalledWith(mockEvent._node, mockEvent._key, mockEvent._value)
    })

    it('with the correct parameters for vaktStaticId', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'nodeKeys',
        _value: '1bc05a66-1eba-44f7-8f85-38204e4d3516'
      }

      await agent.saveEvent(mockEvent)
      expect(memberDaoMock.updateField).toHaveBeenCalledWith(mockEvent._node, mockEvent._key, mockEvent._value)
    })

    it('with the correct parameters for vaktMnid', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'nodeKeys',
        _value: '9a2908a4-ec69-478d-a3f7-e02e8a6bb193'
      }

      await agent.saveEvent(mockEvent)
      expect(memberDaoMock.updateField).toHaveBeenCalledWith(mockEvent._node, mockEvent._key, mockEvent._value)
    })

    it('with the correct parameters for x500Name', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'x500Name',
        _value: `{
          "CN": "Equinor ASA",
          "O": "Equinor ASA",
          "C": "NO",
          "L": "Stavanger",
          "STREET": "Forusbeen 50",
          "PC": "4035"
      }`
      }

      await agent.saveEvent(mockEvent)

      expect(memberDaoMock.updateField).toHaveBeenCalledWith(
        mockEvent._node,
        mockEvent._key,
        JSON.parse(mockEvent._value)
      )
    })

    it('with the correct parameters for hasSWIFTKey', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'hasSWIFTKey',
        _value: 'false'
      }

      await agent.saveEvent(mockEvent)

      expect(memberDaoMock.updateField).toHaveBeenCalledWith(mockEvent._node, mockEvent._key, false)
    })

    it('with the correct parameters for isFinancialInstitution', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'isFinancialInstitution',
        _value: 'false'
      }

      await agent.saveEvent(mockEvent)

      expect(memberDaoMock.updateField).toHaveBeenCalledWith(mockEvent._node, mockEvent._key, false)
    })

    it('with the correct parameters for isMember', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'isMember',
        _value: 'false'
      }

      await agent.saveEvent(mockEvent)

      expect(memberDaoMock.updateField).toHaveBeenCalledWith(mockEvent._node, mockEvent._key, false)
    })

    it('with the correct parameters for memberType', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'memberType',
        _value: 'SMS'
      }

      await agent.saveEvent(mockEvent)

      expect(memberDaoMock.updateField).toHaveBeenCalledWith(mockEvent._node, mockEvent._key, mockEvent._value)
    })

    it('with the correct parameters for isFMS', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'isFMS',
        _value: 'false'
      }

      await agent.saveEvent(mockEvent)

      expect(memberDaoMock.updateField).toHaveBeenCalledWith(mockEvent._node, mockEvent._key, false)
    })

    it('with the correct parameters for vakt', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'vakt',
        _value: `{
          "staticId": "63092",
          "mnid": "EQUINOR_ASA_63092",
          "messagingPublicKey": {
              "validFrom": "2018-11-27T04:45:02Z",
              "validTo": "2018-11-27T04:45:02Z",
              "key": {
                  "kty": "RSA",
                  "kid": "04eef523-8a50-4d18-ab7d-d6bb209770ca",
                  "n": "gzmNNxWW3OrCB4CvOAYUcFdJErzyO0pwIYLK5KF5uo0rgaSMNCjIY6U562gWUASKi_OopDoz4mHO1wITVizopvdOEe2vBWADVGgkLrpgAQQa2BjbFxE70TFGg_IVxzDYkg8xR_-2pFjFr0U6ig680UBU84Y-Rc6SVFQpr46FkIKJ5yWZM7EM-qcVUEh0Py9LslpUxxtxws32KeZ5MTT9BoguXB-vlxFS76LaSUHACJCjkDPTXVjBXHyTWBg_2ModiBjPJ0Y6-FcGvNbySBVWllzZSsXpiZhc9iwC3Kpbfz-MwZrdUEENrIRpbCrrAxDgXORvDZ5sVjym1mJTWXsOqw",
                  "e": "AQAB"
              },
              "current": true,
              "revoked": false
          }
      }`
      }

      await agent.saveEvent(mockEvent)

      expect(memberDaoMock.updateField).toHaveBeenCalledWith(
        mockEvent._node,
        mockEvent._key,
        JSON.parse(mockEvent._value)
      )
    })

    it('with the correct parameters for komgoProducts', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'komgoProducts',
        _value: `[
          {
              "productName": "Kyc",
              "productId": "KYC"
          },
          {
              "productName": "Letter Of Credit",
              "productId": "LC"
          },
          {
              "productName": "Receivables Discounting",
              "productId": "RD"
          }
      ]`
      }

      await agent.saveEvent(mockEvent)

      expect(memberDaoMock.updateField).toHaveBeenCalledWith(
        mockEvent._node,
        mockEvent._key,
        JSON.parse(mockEvent._value)
      )
    })

    it('with the correct parameters for vaktMessagingPubKeys', async () => {
      const mockEvent = {
        _node: 'node',
        _key: 'vaktMessagingPubKeys',
        _value: `[
          {
            "validFrom": "2018-11-27T04:45:02Z",
            "validTo": "2018-11-27T04:45:02Z",
            "key": "04eef523-8a50-4d18-ab7d-d6bb209770ca",
            "current": true,
            "revoked": false
          }
      ]`
      }

      await agent.saveEvent(mockEvent)

      expect(memberDaoMock.updateField).toHaveBeenCalledWith(
        mockEvent._node,
        mockEvent._key,
        JSON.parse(mockEvent._value)
      )
    })
  })
})
