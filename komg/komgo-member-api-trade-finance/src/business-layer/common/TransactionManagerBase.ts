import { URL } from 'url'
import { injectable, unmanaged } from 'inversify'
import { getLogger } from '@komgo/logging'
import { HashMetaDomain, hashMessageWithNonce } from './HashFunctions'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { ISignature } from './ISignature'
import { IContract } from './IContract'
import { getNextContractAddress } from './utils'
import { ISignerClient } from './ISignerClient'
const pako = require('pako')

@injectable()
export abstract class TransactionManagerBase<ContractType extends IContract<ActionType>, ActionType> {
  protected loggerName: string
  protected logger

  /**
   * @param signer - Signer client that abstracts and interacts with our signer api
   * @param ensAddress - ENSRegistry smart contract address
   */
  constructor(
    @unmanaged() protected signer: ISignerClient,
    @unmanaged() protected ensAddress: string,
    @unmanaged() private readonly companyStaticId: string,
    @unmanaged() private readonly companyRegistryService: ICompanyRegistryService,
    @unmanaged() private readonly contract: ContractType,
    @unmanaged() private readonly contractByteCode: string
  ) {
    this.logger = getLogger(this.loggerName)
  }

  protected async deployContract(contractArguments: string[], parties: string[], from: string) {
    this.logger.info(`Deploying contract into blockchain`, {
      contractArguments,
      parties,
      from
    })
    const nodes = parties.map(party => (party ? HashMetaDomain(party) : '0x00'))

    this.logger.info('Getting transaction data')
    const data = this.contract
      .instance()
      .deploy({
        data: this.contractByteCode,
        arguments: contractArguments
      })
      .encodeABI()

    const postResult = await this.sendData(data, undefined, this.removeMyselfFromParties(nodes), from)
    return postResult.data
  }

  protected async getTransactionEncodedData(contractAddress: string, type: ActionType, ...data: string[]) {
    this.logger.info('getting encoded data', {
      LCAddress: contractAddress,
      LCActionType: type
    })
    this.contract.at(contractAddress)
    const nonce = await this.getCachedNonce(contractAddress)
    const callDataToBeSigned = await this.contract.getHashedMessageWithCallDataFor(type, nonce, ...data)
    const signedDataResult = await this.signer.sign(callDataToBeSigned)

    if (signedDataResult) {
      return this.contract.getEncodedDataFromSignatureFor(type, signedDataResult.data, ...data)
    }
  }

  protected async getSignatureData(messageData: string, from: string): Promise<ISignature> {
    const nonce = 0 // TODO - check this
    const newContractAddress = await getNextContractAddress(nonce, from)

    const signatureVerifierNonce = 1 // During creation it is always going to be 1
    const messageHashed = hashMessageWithNonce(newContractAddress, signatureVerifierNonce, messageData)
    const signedDataResult = await this.signer.sign(messageHashed)

    return this.contract.getSignatureParameters(signedDataResult.data)
  }

  protected async prepareRawData(data: any) {
    return pako.deflate(JSON.stringify(data), { to: 'string' })
  }

  /**
   * Builds the raw transaction payload, signs and broadcasts transaction
   *
   * @param encodedData - Encoded data (this might include, method id and parameters)
   * @returns - An axios response object, with the transaction hash in the data field.
   */
  protected async sendData(encodedData: string, to?: string, parties?: string[], from?: string): Promise<any> {
    let transactionObject
    let postResult

    this.logger.info(`Generating key...`, { to })
    const oneTimeKey = from || (await this.signer.getKey()).data
    this.logger.info(`One time key generated <not logged>`, { to })
    this.logger.info('Parties provided ', { to, parties })

    const constellationPublicKeys = await this.companyRegistryService.getNodeKeys(parties)
    this.logger.info('Constellation public keys retrieved ', { to, constellationPublicKeys })
    transactionObject = {
      from: oneTimeKey,
      value: '0x00',
      data: encodedData,
      privateFor: constellationPublicKeys
    }
    if (to) {
      transactionObject = { ...transactionObject, to }
    }
    postResult = await this.signer.postTransaction(transactionObject)

    return postResult
  }

  protected removeMyselfFromParties(parties: string[]) {
    return parties.filter(party => party !== HashMetaDomain(this.companyStaticId))
  }

  // TODO: Temporary fix - return "null" by default to fetch nonce from the blockchain
  // Subclasses can re-implement this and return cached nonce
  // Need to implement nonce handling for all LC types (amendment, presentation, etc ... )
  protected async getCachedNonce(contractAddress: string): Promise<number | null> {
    return null
  }
}
