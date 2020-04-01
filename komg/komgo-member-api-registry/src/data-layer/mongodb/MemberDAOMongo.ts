import { Web3Wrapper } from '@komgo/blockchain-access'
import { injectable, inject } from 'inversify'

import { TYPES } from '../../inversify/types'
import { IMemberDAO } from '../dao/IMemberDAO'

import { IEthPubKeyDocument } from './IEthPubKeyDocument'
import { IMemberDocument } from './IMemberDocument'
import { IMessagingPubKeyDocument } from './IMessagingPubKeyDocument'
import { MemberRepo } from './MemberRepository'

@injectable()
export class MemberDAOMongo implements IMemberDAO {
  constructor(@inject(TYPES.Web3) private readonly web3Instance) {}
  async clearAll(): Promise<any> {
    await MemberRepo.deleteMany({})
  }

  async findByParentAndLabel(parent: string, label: string): Promise<any> {
    const node = this.web3Instance.utils.soliditySha3(parent, label)
    return MemberRepo.findOne({ node })
  }

  async createNewMemberCompany(node: string, label: string, owner: string): Promise<any> {
    const thisNode = this.web3Instance.utils.soliditySha3(node, label)
    // tslint:disable-next-line:no-object-literal-type-assertion
    const newMember = {
      node: thisNode,
      parentNode: node,
      label,
      owner
    } as IMemberDocument
    await MemberRepo.create(newMember)
  }

  async updateOwner(node: string, newOwner: any): Promise<any> {
    await MemberRepo.update({ node }, { owner: newOwner })
  }

  async getMembers(companyData: string): Promise<any> {
    const members = await MemberRepo.find(JSON.parse(companyData))
    return members
  }

  async updateResolver(node: string, resolver: any): Promise<any> {
    await MemberRepo.update({ node }, { resolver })
  }

  async updateAddress(node: string, address: any): Promise<any> {
    await MemberRepo.update({ node }, { address })
  }

  async updateAbi(node: string, data: any): Promise<any> {
    await MemberRepo.update({ node }, { abi: data })
  }

  async addEthPubKey(
    node: string,
    xPublicKey: string,
    yPublicKey: string,
    address: string,
    effDate: number,
    termDate: number
  ): Promise<any> {
    const key = xPublicKey + yPublicKey.replace('0x', '')
    // tslint:disable-next-line:no-object-literal-type-assertion
    const ethPubKey = {
      key,
      effDate,
      termDate,
      address,
      current: true,
      revoked: false
    } as IEthPubKeyDocument

    const member = await MemberRepo.findOne({ node })
    const keys = member.ethPubKeys
    if (keys.length > 0) {
      keys[keys.length - 1].current = false
    }
    keys.push(ethPubKey)

    await MemberRepo.update({ node }, { ethPubKeys: keys })
  }

  async addKomgoMessagingPubKey(node: string, pubKey: string, effDate: number, termDate: number): Promise<any> {
    // tslint:disable-next-line:no-object-literal-type-assertion
    const messagingPubKey = {
      key: pubKey,
      effDate,
      termDate,
      current: true,
      revoked: false
    } as IMessagingPubKeyDocument

    const member = await MemberRepo.findOne({ node })
    const keys = member.komgoMessagingPubKeys
    if (keys.length > 0) {
      keys[keys.length - 1].current = false
    }
    keys.push(messagingPubKey)

    await MemberRepo.update({ node }, { komgoMessagingPubKeys: keys })
  }

  async revokeKomgoMessagingPubKey(node: string, index: number): Promise<any> {
    const member = await MemberRepo.findOne({ node })
    const keys = member.komgoMessagingPubKeys
    keys[index].revoked = true
    await MemberRepo.update({ node }, { komgoMessagingPubKeys: keys })
  }

  async addVaktMessagingPubKey(node: string, key: string, effDate: number, termDate: number): Promise<any> {
    // tslint:disable-next-line:no-object-literal-type-assertion
    const messagingPubKey = {
      key,
      effDate,
      termDate,
      current: true,
      revoked: false
    } as IMessagingPubKeyDocument

    const member = await MemberRepo.findOne({ node })
    const keys = member.vaktMessagingPubKeys
    if (keys.length > 0) {
      keys[keys.length - 1].current = false
    }
    keys.push(messagingPubKey)

    await MemberRepo.update({ node }, { vaktMessagingPubKeys: keys })
  }

  async revokeVaktMessagingPubKey(node: string, index: number): Promise<any> {
    const member = await MemberRepo.findOne({ node })
    const keys = member.vaktMessagingPubKeys
    keys[index].revoked = true
    await MemberRepo.update({ node }, { vaktMessagingPubKeys: keys })
  }

  async revokeEthPubKey(node: string, index: number): Promise<any> {
    const member = await MemberRepo.findOne({ node })
    const keys = member.ethPubKeys
    keys[index].revoked = true
    await MemberRepo.update({ node }, { ethPubKeys: keys })
  }

  async updateReverseNode(node: string, reverseNode: string): Promise<any> {
    await MemberRepo.update({ node }, { reverseNode })
  }

  async updateField(node: string, key: string, value: string) {
    await MemberRepo.update({ node }, { [key]: value })
  }
}
