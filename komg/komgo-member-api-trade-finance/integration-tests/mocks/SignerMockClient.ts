import { ISignerClient } from '../../src/business-layer/common/ISignerClient'

const EthCrypto = require('eth-crypto')

const isConsortiumMode = process.env.CONSORTIUM_MODE ? true : false
const isQuorumMode = process.env.USE_QUORUM_NODE === 'true' ? true : false

export class SignerMockClient implements ISignerClient {
  web3Instance: any
  accountInfo: Map<string, string> = new Map<string, string>()
  currentSigner: string
  constructor(accounts: string[], web3, privateKey: string) {
    if (!web3) {
      throw new Error('You need to provide a valid web3 provider')
    }
    if (accounts.length === 0) {
      throw new Error('You need to provide at least 1 account')
    }
    this.web3Instance = web3
    let account = accounts[0]
    this.accountInfo.set(account, privateKey)
    this.currentSigner = accounts[0] // Set as default one
  }

  async postTransaction(txn: any) {
    try {
      if (!txn.gasPrice) {
        txn.gasPrice = 0
      }

      if (isConsortiumMode || isQuorumMode) {
        txn.gas = 804247552 // Only for Quorum
      } else if (!txn.gas && !txn.gasLimit) {
        const block = await this.web3Instance.eth.getBlock('latest')
        txn.gasLimit = block.gasLimit
        txn.gas = block.gasLimit
      }

      const accounts = await this.web3Instance.eth.getAccounts()
      delete txn.privateFor
      await this.web3Instance.eth.personal.unlockAccount(txn.from, '', 15000)
      const result = await this.web3Instance.eth.sendTransaction(txn)
      return {
        data: result
      }
    } catch (error) {
      console.log('ERROR', error.message) // tslint:disable-line
    }
  }

  async getKey() {
    let privKey = this.createRandomPrivKey(64)
    if (!isQuorumMode) {
      privKey = `0x${privKey}`
    }
    const address = await this.web3Instance.eth.personal.importRawKey(privKey, '')
    return { data: address }
  }

  async sign(messageToSign: string): Promise<any> {
    if (!messageToSign.startsWith('0x')) {
      throw new Error('Invalid address')
    }
    if (this.currentSigner.length !== 2 * 20 + 2) {
      throw new Error(`Invalid address ${this.currentSigner}`)
    }
    if (messageToSign.startsWith('0x')) {
      messageToSign = messageToSign.slice(2)
    }
    if (messageToSign.length > 64) {
      throw new Error('Message should of 32 bytes')
    }

    if (!this.accountInfo.has(this.currentSigner)) {
      throw new Error('The account is not setup')
    }
    const privateKey = this.accountInfo.get(this.currentSigner)
    const signature = EthCrypto.sign(`${privateKey}`, messageToSign)
    return { data: signature }
  }

  private createRandomPrivKey(length) {
    var text = ''
    var possible = 'abcdef0123456789'

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
  }
}
