import { Web3Wrapper } from '@komgo/blockchain-access'
import Web3 from 'web3'

export default class Member {
  readonly web3: Web3
  readonly account: string
  readonly pub: string

  constructor(
    private readonly blockchainHost: string,
    private readonly blockchainPort: string,
    private readonly constellationPublicKey: string
  ) {
    const web3Wrapper = new Web3Wrapper(this.blockchainHost, this.blockchainPort)
    this.web3 = web3Wrapper.web3Instance
    this.pub = this.constellationPublicKey
  }
  async newAccount(password: string): Promise<string> {
    return this.web3.eth.personal.newAccount(password)
  }
}
